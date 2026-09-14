import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

/* Save-time image handling must be local and fast. Firebase Storage uploads are
   already handled when an image is added; saveNow must never upload again. */
const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  const MAX_PAGE_FIELD=700*1024;
  const isDataImage=u=>typeof u==="string"&&u.indexOf("data:image/")===0;
  const isHttp=u=>typeof u==="string"&&/^https?:\\/\\//i.test(u);
  const byteSize=v=>{try{return new Blob([typeof v==="string"?v:JSON.stringify(v)]).size}catch(_){return String(v||"").length*2}};
  function loadImage(u){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("تعذر تجهيز الصورة للحفظ"));im.src=u})}
  function blobToDataUrl(b){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(b)})}
  async function compressImage(u,maxSide,q){try{const im=await loadImage(u),ow=im.naturalWidth||im.width||1,oh=im.naturalHeight||im.height||1,scale=Math.min(1,maxSide/Math.max(ow,oh)),nw=Math.max(1,Math.round(ow*scale)),nh=Math.max(1,Math.round(oh*scale)),c=document.createElement("canvas");c.width=nw;c.height=nh;const ctx=c.getContext("2d");if(!ctx)return null;ctx.drawImage(im,0,0,nw,nh);const b=await new Promise(r=>c.toBlob(r,"image/webp",q));return b?{dataUrl:await blobToDataUrl(b),nw,nh,size:b.size}:null}catch(e){console.warn("CanvasFlow: image compression failed",e);return null}}
  async function prepareObject(o){
    if(!o)return;
    /* Permanent Storage URL wins over the old embedded Base64 source. */
    if(isHttp(o.srcUrl)){o.src=o.srcUrl;return}
    if(!isDataImage(o.src))return;
    const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1;
    /* Only compress as a fallback. Never start a network request from Save. */
    for(const pair of [[1200,.58],[1000,.45],[850,.34],[720,.26]]){
      const r=await compressImage(o.src,pair[0],pair[1]);
      if(r){o.src=r.dataUrl;o.width=r.nw;o.height=r.nh;o.scaleX=(oldW*oldSX)/r.nw;o.scaleY=(oldH*oldSY)/r.nh;break}
    }
    if(isDataImage(o.srcUrl))delete o.srcUrl;
  }
  async function preparePages(pages){
    if(!Array.isArray(pages))return pages;
    let hasData=false;
    for(const p of pages){
      if(!p||!Array.isArray(p.objects))continue;
      for(const o of p.objects){if(o&&isDataImage(o.src)){hasData=true;break}}
      if(hasData)break;
    }
    /* Normal case: all images have permanent URLs. This path is effectively free. */
    if(!hasData){
      for(const p of pages){if(!p||!Array.isArray(p.objects))continue;for(const o of p.objects){if(o&&isHttp(o.srcUrl))o.src=o.srcUrl}}
      return pages;
    }
    for(const p of pages){if(!p||!Array.isArray(p.objects))continue;for(const o of p.objects)await prepareObject(o)}
    if(byteSize(pages)>MAX_PAGE_FIELD){
      for(const p of pages){
        if(!p||!Array.isArray(p.objects))continue;
        for(const o of p.objects){
          if(!o||!isDataImage(o.src))continue;
          const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1;
          const r=await compressImage(o.src,520,.16);
          if(r){o.src=r.dataUrl;o.width=r.nw;o.height=r.nh;o.scaleX=(oldW*oldSX)/r.nw;o.scaleY=(oldH*oldSY)/r.nh}
        }
      }
    }
    return pages;
  }
  window.canvasflowPrepareFirestorePages=preparePages;
  console.log("CanvasFlow: fast image persistence fix installed");
})();</script>`;

const marker='<script id="canvasflow-image-persistence-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf("</script>",start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9)}else{s=s.replace("</body>",injected+"\n</body>")}

const prepareBlock=`    let pagesForSave = boardPages;\n    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      pagesForSave = await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
const exactBase=`    const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;`;
if(s.includes(exactBase) && !s.includes("let pagesForSave = boardPages;"))s=s.replace(exactBase,exactBase+"\n\n"+prepareBlock);
s=s.replace('const pagesJson = boardPages.map((pg, i) => {','const pagesJson = pagesForSave.map((pg, i) => {');
s=s.replace('      canvas: canvasJson,\n      pages: pagesJson,','      canvas: "",\n      pages: pagesJson,');

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: fast non-blocking image persistence installed.");
