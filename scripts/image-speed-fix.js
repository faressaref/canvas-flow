import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

// The image upload already replaces the temporary data URL with a Firebase
// Storage URL. Tell the page-state saver to persist immediately at that point.
const persistedNeedle = 'img.set({srcUrl:imageUrl});\n              canvas.requestRenderAll();';
const persistedReplacement = 'img.set({srcUrl:imageUrl});\n              try { window.dispatchEvent(new CustomEvent("canvasflow:image-persisted")); } catch (_) {}\n              canvas.requestRenderAll();';
if (s.includes(persistedNeedle) && !s.includes('canvasflow:image-persisted")); } catch (_) {}')) {
  s = s.replace(persistedNeedle, persistedReplacement);
}

// Never run expensive image recompression on every normal autosave. Only use
// the fallback compressor for genuinely large temporary data URLs.
s = s.replace(
  'if(!o||!isDataImage(o.src))continue;const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1,r=await compressImage(o.src,520,.16);',
  'if(!o||!isDataImage(o.src))continue; if(o.src.length < 180000) continue; const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1,r=await compressImage(o.src,520,.16);'
);

// Keep the browser responsive when a temporary image has to be prepared.
s = s.replace(
  'for(const p of pages){if(!p||!Array.isArray(p.objects))continue;for(const o of p.objects)await prepareObject(o)}',
  'for(const p of pages){if(!p||!Array.isArray(p.objects))continue;for(const o of p.objects){if(o&&isDataImage(o.src)&&o.src.length<180000)continue;await prepareObject(o)}}'
);

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: fast image save finalization installed.");
