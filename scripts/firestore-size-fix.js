import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const helperId = 'id="canvasflow-firestore-size-fix"';
if (!s.includes(helperId)) {
  const injected = `<script ${helperId}>(function(){const LIMIT=800*1024;function dataUrlToBlob(u){const m=/^data:([^;]+);base64,(.+)$/s.exec(u||"");if(!m)return null;const b=atob(m[2]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new Blob([a],{type:m[1]})}function blobToDataUrl(b){return new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)})}function imageFromDataUrl(u){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=u})}async function compress(u,q){try{const im=await imageFromDataUrl(u),c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext("2d");x.drawImage(im,0,0);let b=await new Promise(r=>c.toBlob(r,"image/webp",q));if(!b)return u;return await blobToDataUrl(b)}catch(e){return u}}async function prepare(page){if(!page||!Array.isArray(page.objects))return;for(let i=0;i<page.objects.length;i++){const o=page.objects[i];if(o&&o.objectRole==="studyNote"&&typeof o.src==="string"&&o.src.indexOf("data:image/")===0){let src=await compress(o.src,.72);o.src=src;o.srcUrl=src}}let size=()=>JSON.stringify(page).length;if(size()>LIMIT){for(const o of page.objects){if(o&&o.objectRole==="studyNote"&&typeof o.src==="string"&&o.src.indexOf("data:image/")===0){o.src=await compress(o.src,.52);o.srcUrl=o.src}}}if(size()>LIMIT){for(const o of page.objects){if(o&&o.objectRole==="studyNote"&&typeof o.src==="string"&&o.src.indexOf("data:image/")===0){o.src=await compress(o.src,.38);o.srcUrl=o.src}}}}window.canvasflowPrepareFirestorePages=async function(pages){if(!Array.isArray(pages))return;for(const p of pages)await prepare(p)};})();</script>`;
  s = s.replace("</body>", injected + "\n</body>");
}

const old = `const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;\n\n    // Serialize before sending to Firestore so a serialization problem is\n    // reported clearly instead of being swallowed as an "unknown" error.\n    const canvasJson = JSON.stringify(currentPageJson);\n    const pagesJson = boardPages.map((pg, i) => {\n      try { return JSON.stringify(pg); }\n      catch(e) { throw new Error("Page " + (i + 1) + " could not be serialized: " + (e.message || e)); }\n    });`;
const replacement = `const currentPageJson = canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);\n    boardPages[boardPageIndex] = currentPageJson;\n\n    // Study-note images can be large PNG data URLs. Compress them before the\n    // Firestore write so no individual Firestore string crosses its 1 MiB limit.\n    await window.canvasflowPrepareFirestorePages(boardPages);\n    const canvasJson = JSON.stringify(boardPages[boardPageIndex]);\n    const pagesJson = boardPages.map((pg, i) => {\n      try { return JSON.stringify(pg); }\n      catch(e) { throw new Error("Page " + (i + 1) + " could not be serialized: " + (e.message || e)); }\n    });`;
if (s.includes(old)) s = s.replace(old, replacement);

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: Firestore study-note size protection installed.");
