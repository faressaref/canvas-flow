import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-image-persistence-fix">(function(){function isDataImage(u){return typeof u==="string"&&u.indexOf("data:image/")===0}function loadImage(u){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("تعذر تجهيز الصورة للحفظ"));im.src=u})}function blobToDataUrl(b){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(b)})}async function compressImage(u,maxSide,q){const im=await loadImage(u),ow=im.naturalWidth||im.width||1,oh=im.naturalHeight||im.height||1,scale=Math.min(1,maxSide/Math.max(ow,oh)),nw=Math.max(1,Math.round(ow*scale)),nh=Math.max(1,Math.round(oh*scale)),c=document.createElement("canvas");c.width=nw;c.height=nh;c.getContext("2d").drawImage(im,0,0,nw,nh);const b=await new Promise(r=>c.toBlob(r,"image/webp",q));return b?{dataUrl:await blobToDataUrl(b),ow,oh,nw,nh}:null}async function prepareObject(o){if(!o||!isDataImage(o.src))return;if(typeof o.srcUrl==="string"&&/^https?:\\/\\//i.test(o.srcUrl)){o.src=o.srcUrl;return}const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1,r=await compressImage(o.src,1400,.58);if(!r)return;o.src=r.dataUrl;o.width=r.nw;o.height=r.nh;o.scaleX=(oldW*oldSX)/r.nw;o.scaleY=(oldH*oldSY)/r.nh;if(typeof o.srcUrl==="string"&&isDataImage(o.srcUrl))delete o.srcUrl}window.canvasflowPrepareFirestorePages=async function(pages){if(!Array.isArray(pages))return;for(const page of pages){if(!page||!Array.isArray(page.objects))continue;for(const o of page.objects)await prepareObject(o)}};})();</script>`;

const start=s.indexOf('<script id="canvasflow-image-persistence-fix">');
if(start>=0){const end=s.indexOf("</script>",start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9)}else{s=s.replace("</body>",injected+"\n</body>")}

const old=`    const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;\n\n    // Serialize before sending to Firestore so a serialization problem is\n    // reported clearly instead of being swallowed as an "unknown" error.\n    const canvasJson = JSON.stringify(currentPageJson);\n    const pagesJson = boardPages.map((pg, i) => {`;
const replacement=`    const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;\n\n    // Prepare image URLs/bitmaps before Firestore serialization. This keeps\n    // uploaded images out of the document and preserves their visual size.\n    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      await window.canvasflowPrepareFirestorePages(boardPages);\n    }\n    const canvasJson = JSON.stringify(currentPageJson);\n    const pagesJson = boardPages.map((pg, i) => {`;
if(s.includes(old))s=s.replace(old,replacement);

const oldField=`      canvas: canvasJson,\n      pages: pagesJson,`;
const newField=`      canvas: "",\n      pages: pagesJson,`;
if(s.includes(oldField))s=s.replace(oldField,newField);

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: image persistence and resize preservation installed.");
