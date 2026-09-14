import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  const MAX_PAGE_FIELD = 700 * 1024;
  const isDataImage = u => typeof u === "string" && u.indexOf("data:image/") === 0;
  const isHttp = u => typeof u === "string" && /^https?:\\/\\//i.test(u);
  const byteSize = v => { try { return new Blob([typeof v === "string" ? v : JSON.stringify(v)]).size; } catch (_) { return String(v || "").length * 2; } };
  function loadImage(u){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("تعذر تجهيز الصورة للحفظ"));im.src=u})}
  function blobToDataUrl(b){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(b)})}
  function clonePages(pages){try{return JSON.parse(JSON.stringify(pages))}catch(e){console.warn("CanvasFlow: page clone failed",e);return null}}
  async function compressImage(u,maxSide,q){try{const im=await loadImage(u),ow=im.naturalWidth||im.width||1,oh=im.naturalHeight||im.height||1,scale=Math.min(1,maxSide/Math.max(ow,oh)),nw=Math.max(1,Math.round(ow*scale)),nh=Math.max(1,Math.round(oh*scale)),c=document.createElement("canvas");c.width=nw;c.height=nh;const ctx=c.getContext("2d");if(!ctx)return null;ctx.drawImage(im,0,0,nw,nh);const b=await new Promise(r=>c.toBlob(r,"image/webp",q));return b?{dataUrl:await blobToDataUrl(b),ow,oh,nw,nh,size:b.size}:null}catch(e){console.warn("CanvasFlow: image compression failed",e);return null}}
  async function uploadDataImage(o){if(!o||!isDataImage(o.src)||!window.storage||!window.FIREBASE_READY)return false;try{const r=await compressImage(o.src,1600,.82);if(!r)return false;const path="whiteboard-images/objects/"+Date.now()+"_"+Math.random().toString(36).slice(2)+".webp",ref=window.storage.ref(path);await ref.putString(r.dataUrl,"data_url",{contentType:"image/webp"});const url=await ref.getDownloadURL();o.src=url;o.srcUrl=url;return true}catch(e){console.warn("CanvasFlow: Storage image persistence failed",e);return false}}
  async function prepareObject(o){if(!o)return;if(typeof o.srcUrl==="string"&&isHttp(o.srcUrl)){o.src=o.srcUrl;return}if(!isDataImage(o.src))return;if(window.storage&&window.FIREBASE_READY){const uploaded=await uploadDataImage(o);if(uploaded)return}const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1;let best=null;for(const pair of [[1200,.60],[1000,.48],[850,.38],[720,.30],[600,.24],[480,.18]]){const r=await compressImage(o.src,pair[0],pair[1]);if(r){best=r;if(r.size<=90*1024)break}}if(best){o.src=best.dataUrl;o.width=best.nw;o.height=best.nh;o.scaleX=(oldW*oldSX)/best.nw;o.scaleY=(oldH*oldSY)/best.nh}if(typeof o.srcUrl==="string"&&isDataImage(o.srcUrl))delete o.srcUrl}
  async function preparePages(pages){const copy=clonePages(pages);if(!copy)return pages;for(const page of copy){if(!page||!Array.isArray(page.objects))continue;for(const o of page.objects)await prepareObject(o)}let total=()=>byteSize(copy);if(total()<=MAX_PAGE_FIELD)return copy;for(const maxSide of [520,440,360]){for(const page of copy){for(const o of(page&&Array.isArray(page.objects)?page.objects:[])){if(!o||!isDataImage(o.src))continue;const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1,r=await compressImage(o.src,maxSide,.16);if(r){o.src=r.dataUrl;o.width=r.nw;o.height=r.nh;o.scaleX=(oldW*oldSX)/r.nw;o.scaleY=(oldH*oldSY)/r.nh}}}if(total()<=MAX_PAGE_FIELD)break}return copy}
  window.canvasflowPrepareFirestorePages=preparePages;
  console.log("CanvasFlow: image persistence fix installed");
})();</script>`;

const marker='<script id="canvasflow-image-persistence-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf("</script>",start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9)}else{s=s.replace("</body>",injected+"\n</body")}

const prepareBlock=`    let pagesForSave = boardPages;\n    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      pagesForSave = await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
const exactBase=`    const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;`;
if(s.includes(exactBase) && !s.includes("let pagesForSave = boardPages;"))s=s.replace(exactBase,exactBase+"\n\n"+prepareBlock);

s=s.replace('const pagesJson = boardPages.map((pg, i) => {','const pagesJson = pagesForSave.map((pg, i) => {');
s=s.replace('      canvas: canvasJson,\n      pages: pagesJson,','      canvas: "",\n      pages: pagesJson,');

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: robust image persistence + Firestore size fix installed.");
