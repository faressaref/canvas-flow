import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const helperId = 'id="canvasflow-firestore-size-fix"';
const injected = `<script ${helperId}>(function(){
const DOC_BUDGET=820*1024;
function isDataImage(u){return typeof u==="string"&&u.indexOf("data:image/")===0}
function loadImage(u){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("تعذر تجهيز صورة للحفظ"));im.src=u})}
function blobToDataUrl(b){return new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result);f.onerror=reject;f.readAsDataURL(b)})}
async function makeWebp(u,maxSide,q){try{const im=await loadImage(u);let w=im.naturalWidth||im.width||1,h=im.naturalHeight||im.height||1;const scale=Math.min(1,maxSide/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");if(!x)return null;x.drawImage(im,0,0,w,h);const b=await new Promise(r=>c.toBlob(r,"image/webp",q));return b?{dataUrl:await blobToDataUrl(b),width:w,height:h}:null}catch(e){console.warn("CanvasFlow: image compression failed",e);return null}}

// Change only the stored bitmap quality/size. Keep the exact same visible size.
function applyCompressedSource(o,r){
  if(!o||!r)return;
  const displayW=(Number(o.width)||1)*(Number(o.scaleX)||1);
  const displayH=(Number(o.height)||1)*(Number(o.scaleY)||1);
  o.src=r.dataUrl;
  o.width=r.width;
  o.height=r.height;
  o.scaleX=displayW/r.width;
  o.scaleY=displayH/r.height;
}

async function shrinkPage(page,budget){
  if(!page||!Array.isArray(page.objects))return;
  const size=()=>JSON.stringify(page).length;
  // IMPORTANT: don't recompress an image at all if the page already fits.
  if(size()<=budget)return;

  // First pass: high-quality WebP. These settings are intentionally much less
  // aggressive so screenshots/text remain clear and readable.
  const qualityLevels=[[2200,.82],[2000,.78],[1800,.74],[1600,.70],[1400,.66],[1200,.60]];
  for(const pair of qualityLevels){
    for(const o of page.objects){
      if(!o||!isDataImage(o.src))continue;
      const r=await makeWebp(o.src,pair[0],pair[1]);
      if(r)applyCompressedSource(o,r);
    }
    if(size()<=budget)break;
  }

  // Only if the page is still too large, reduce gradually. Never jump straight
  // to the old extremely low quality values.
  if(size()>budget){
    const fallbackLevels=[[1100,.52],[1000,.46],[900,.40],[800,.34],[700,.28]];
    for(const pair of fallbackLevels){
      for(const o of page.objects){
        if(!o||!isDataImage(o.src))continue;
        const r=await makeWebp(o.src,pair[0],pair[1]);
        if(r)applyCompressedSource(o,r);
      }
      if(size()<=budget)break;
    }
  }
}

window.canvasflowPrepareFirestorePages=async function(pages){
  if(!Array.isArray(pages))return;
  const budget=Math.max(120*1024,Math.floor(DOC_BUDGET/Math.max(1,pages.length)));
  for(const p of pages)await shrinkPage(p,budget);
};
})();</script>`;

const start = s.indexOf('<script id="canvasflow-firestore-size-fix">');
if (start >= 0) {
  const end = s.indexOf("</script>", start);
  if (end >= 0) s = s.slice(0, start) + injected + s.slice(end + 9);
} else {
  s = s.replace("</body>", injected + "\n</body>");
}

const old = `const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;\n\n    // Serialize before sending to Firestore so a serialization problem is\n    // reported clearly instead of being swallowed as an "unknown" error.\n    const canvasJson = JSON.stringify(currentPageJson);\n    const pagesJson = boardPages.map((pg, i) => {\n      try { return JSON.stringify(pg); }\n      catch(e) { throw new Error("Page " + (i + 1) + " could not be serialized: " + (e.message || e)); }\n    });`;
const replacement = `const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;\n\n    // Prepare only the data that is actually needed for Firestore.\n    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      await window.canvasflowPrepareFirestorePages(boardPages);\n    }\n    const canvasJson = JSON.stringify(boardPages[boardPageIndex]);\n    const pagesJson = boardPages.map((pg, i) => {\n      try { return JSON.stringify(pg); }\n      catch(e) { throw new Error("Page " + (i + 1) + " could not be serialized: " + (e.message || e)); }\n    });`;
if (s.includes(old)) s = s.replace(old, replacement);

const oldCanvasField = `      canvas: canvasJson,\n      pages: pagesJson,`;
const newCanvasField = `      // Pages are the source of truth; never duplicate the current page in canvas.\n      canvas: "",\n      pages: pagesJson,`;
if (s.includes(oldCanvasField)) s = s.replace(oldCanvasField, newCanvasField);

const oldSet = `    await ref.set({\n      name: currentBoardName || DEFAULT_BOARD_NAME,\n      canvas: "",\n      pages: pagesJson,\n      pageIndex: boardPageIndex,\n      pageCount: boardPages.length,\n      updatedAt: firebase.firestore.FieldValue.serverTimestamp()\n    }, {merge:true});`;
const newSet = `    const savePayload = {\n      name: currentBoardName || DEFAULT_BOARD_NAME,\n      canvas: "",\n      pages: pagesJson,\n      pageIndex: boardPageIndex,\n      pageCount: boardPages.length,\n      updatedAt: firebase.firestore.FieldValue.serverTimestamp()\n    };\n    await Promise.race([\n      ref.set(savePayload, {merge:true}),\n      new Promise((_, reject) => setTimeout(() => reject(new Error("Cloud save timed out")), 6000))\n    ]);`;
if (s.includes(oldSet)) s = s.replace(oldSet, newSet);

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: saved image quality improved while preserving display size.");
