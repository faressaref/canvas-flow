import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

/*
 * Final persistence pass. This script intentionally runs LAST in the build
 * chain so it patches the already-generated page instead of depending on
 * fragile formatting in earlier fix scripts.
 */

// 1) Board open: Fabric can wait on image decoding before calling its JSON
// callback. Never let that leave suppressSave=true forever.
const loadNeedle = "    canvas.loadFromJSON(data, function(){";
if (s.includes(loadNeedle) && !s.includes("canvasflow-open-save-unlock")) {
  const guard = `    /* canvasflow-open-save-unlock */\n    let openFinished = false;\n    const openSafetyTimer = setTimeout(() => {\n      if (!openFinished) {\n        openFinished = true;\n        suppressSave = false;\n        setSaveState("saved", "Opened ✓");\n        console.warn("CanvasFlow: released board-open save lock after delayed Fabric image decode.");\n      }\n    }, 4000);\n`;
  s = s.replace(loadNeedle, guard + loadNeedle);
  s = s.replace(
    "    canvas.loadFromJSON(data, function(){\n      try{",
    "    canvas.loadFromJSON(data, function(){\n      openFinished = true;\n      clearTimeout(openSafetyTimer);\n      suppressSave = false;\n      try{"
  );
}

// 2) Image upload: never save the local data URL. Keep the image visible,
// upload the original file to Storage, replace Fabric's src with the permanent
// URL, then perform one cloud save.
const oldImageFields = `            objectRole: 'image',\n            fileName: file.name,\n            srcUrl: dataUrl,\n            selectable: true,`;
const newImageFields = `            objectRole: 'image',\n            fileName: file.name,\n            // srcUrl is filled with the permanent Storage URL after upload.\n            selectable: true,`;
if (s.includes(oldImageFields)) s = s.replace(oldImageFields, newImageFields);

// Save is suppressed only while the image is being uploaded.
const oldReader = `    reader.onload = () => {\n      const dataUrl = reader.result;\n      const imgEl = new Image();`;
const newReader = `    reader.onload = () => {\n      const dataUrl = reader.result;\n      const previousImageSaveSuppress = suppressSave;\n      suppressSave = true;\n      const imgEl = new Image();`;
if (s.includes(oldReader) && !s.includes("previousImageSaveSuppress = suppressSave")) {
  s = s.replace(oldReader, newReader);
}

// After the object is added, upload it. Do not trigger a save with dataUrl.
const oldImageAdd = `          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          scheduleSave(true);\n          pendingImagePoint = null;`;
const newImageAdd = `          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n\n          if (FIREBASE_READY && storage && currentUser) {\n            try {\n              const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');\n              const ref = storage.ref('whiteboard-images/' + Date.now() + '_' + safeName);\n              await ref.put(file);\n              const imageUrl = await ref.getDownloadURL();\n              // Replace the in-memory data URL too, so future serialization is tiny.\n              if (typeof img.setSrc === 'function') {\n                await new Promise(resolve => img.setSrc(imageUrl, () => resolve()));\n              } else {\n                img.set({ src: imageUrl });\n              }\n              img.set({ srcUrl: imageUrl });\n              canvas.requestRenderAll();\n              suppressSave = previousImageSaveSuppress;\n              window.dispatchEvent(new Event('canvasflow:image-persisted'));\n              scheduleSave(true);\n            } catch (uploadErr) {\n              console.error('CanvasFlow image upload failed:', uploadErr);\n              suppressSave = previousImageSaveSuppress;\n              setSaveState('error', 'Image added — cloud upload failed');\n              scheduleSave(true);\n            }\n          } else {\n            suppressSave = previousImageSaveSuppress;\n            scheduleSave(true);\n          }\n          pendingImagePoint = null;`;
if (s.includes(oldImageAdd)) s = s.replace(oldImageAdd, newImageAdd);

// If image decoding itself fails, release the save lock.
const oldDecodeError = `      imgEl.onerror = (err) => {\n        console.error('Image decode failed:', err);\n        setSaveState('error', 'Could not load image');\n        resolve();\n      };`;
const newDecodeError = `      imgEl.onerror = (err) => {\n        console.error('Image decode failed:', err);\n        suppressSave = previousImageSaveSuppress;\n        setSaveState('error', 'Could not load image');\n        resolve();\n      };`;
if (s.includes(oldDecodeError)) s = s.replace(oldDecodeError, newDecodeError);

// Outer image errors must also restore autosave.
const oldOuterImageCatch = `        } catch (err) {\n          console.error('Image add failed:', err);\n          setSaveState('error', 'Could not add image');\n        }`;
const newOuterImageCatch = `        } catch (err) {\n          console.error('Image add failed:', err);\n          suppressSave = previousImageSaveSuppress;\n          setSaveState('error', 'Could not add image');\n          scheduleSave(true);\n        }`;
if (s.includes(oldOuterImageCatch)) s = s.replace(oldOuterImageCatch, newOuterImageCatch);

// 3) Do not run expensive image recompression on every normal save. The image
// upload above converts the canvas object to a permanent URL before saving.
// Keep the size helper only as a fallback for legacy boards containing data URLs.
const helperStart = s.indexOf('<script id="canvasflow-firestore-size-fix">');
if (helperStart >= 0) {
  const helperEnd = s.indexOf('</script>', helperStart);
  if (helperEnd >= 0) {
    const helper = `<script id="canvasflow-firestore-size-fix"><script>`;
    // No-op marker handled below; intentionally leave the existing helper intact
    // for old boards. Its invocation is replaced with a cheap URL-first path.
  }
}

// Replace the costly awaited helper call with a guarded legacy-only call.
const oldPrepare = `    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
const newPrepare = `    // Only legacy data-URL images need preparation. Normal cloud images already\n    // contain srcUrl + a permanent URL and must not be recompressed on every save.\n    const hasLegacyDataImages = boardPages.some(pg => Array.isArray(pg?.objects) && pg.objects.some(o =>\n      typeof o?.src === "string" && o.src.indexOf("data:image/") === 0 && !o.srcUrl\n    ));\n    if (hasLegacyDataImages && typeof window.canvasflowPrepareFirestorePages === "function") {\n      await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
if (s.includes(oldPrepare)) s = s.replace(oldPrepare, newPrepare);

// Same protection for the other version inserted by image-persistence-fix.
const oldPrepare2 = `    let pagesForSave = boardPages;\n    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      pagesForSave = await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
const newPrepare2 = `    let pagesForSave = boardPages;\n    const hasLegacyDataImages = boardPages.some(pg => Array.isArray(pg?.objects) && pg.objects.some(o =>\n      typeof o?.src === "string" && o.src.indexOf("data:image/") === 0 && !o.srcUrl\n    ));\n    if (hasLegacyDataImages && typeof window.canvasflowPrepareFirestorePages === "function") {\n      pagesForSave = await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
if (s.includes(oldPrepare2)) s = s.replace(oldPrepare2, newPrepare2);

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: final board-open + image cloud persistence repair installed.");
