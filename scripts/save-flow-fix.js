import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

// This is the LAST persistence patch in the build chain. It deliberately uses
// stable snippets from the generated HTML and fixes both board-open locking
// and image persistence without touching the existing UI.

/* ---------- Board open: never leave suppressSave locked ---------- */
const loadNeedle = "    canvas.loadFromJSON(data, function(){";
if (s.includes(loadNeedle) && !s.includes("canvasflow-open-save-unlock")) {
  const guard = `    /* canvasflow-open-save-unlock */\n    let openFinished = false;\n    const openSafetyTimer = setTimeout(() => {\n      if (!openFinished) {\n        openFinished = true;\n        suppressSave = false;\n        setSaveState("saved", "Opened ✓");\n      }\n    }, 4000);\n`;
  s = s.replace(loadNeedle, guard + loadNeedle);
  s = s.replace(
    loadNeedle + "\n      try{",
    loadNeedle + "\n      openFinished = true;\n      clearTimeout(openSafetyTimer);\n      suppressSave = false;\n      try{"
  );
}

/* ---------- Images: upload first, then save only the permanent URL ---------- */
// The original image object used srcUrl:dataUrl. Remove that field completely.
const dataUrlField = `            srcUrl: dataUrl,\n            selectable: true,`;
if (s.includes(dataUrlField)) {
  s = s.replace(dataUrlField, `            selectable: true,`);
}

// Prevent object:added from saving the huge data URL while Storage upload runs.
const readerNeedle = `    reader.onload = () => {\n      const dataUrl = reader.result;\n      const imgEl = new Image();`;
if (s.includes(readerNeedle) && !s.includes("canvasflow-image-save-lock")) {
  s = s.replace(readerNeedle, `    reader.onload = () => {\n      const dataUrl = reader.result;\n      /* canvasflow-image-save-lock */\n      const previousImageSaveSuppress = suppressSave;\n      suppressSave = true;\n      const imgEl = new Image();`);
}

// Replace the existing Storage upload block. The image is already visible on
// canvas; during upload it is not persisted. Once the URL exists, replace both
// Fabric src and srcUrl, release the lock, and save exactly once.
const imageUploadStart = `          if (FIREBASE_READY && storage) {\n            try {\n              setSaveState('saving');\n              const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');\n              const ref = storage.ref('whiteboard-images/' + Date.now() + '_' + safeName);`;
const imageUploadEnd = `              img.set({srcUrl: await ref.getDownloadURL()});\n              canvas.requestRenderAll();\n              scheduleSave(true);\n            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n            }\n          }`;
const imageUploadReplacement = `          if (FIREBASE_READY && storage && currentUser) {\n            try {\n              const safeName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');\n              const ref = storage.ref('whiteboard-images/' + Date.now() + '_' + safeName);\n              await ref.put(file);\n              const imageUrl = await ref.getDownloadURL();\n              if (typeof img.setSrc === 'function') {\n                await new Promise(resolve => img.setSrc(imageUrl, () => resolve()));\n              } else {\n                img.set({src:imageUrl});\n              }\n              img.set({srcUrl:imageUrl});\n              canvas.requestRenderAll();\n              suppressSave = previousImageSaveSuppress;\n              window.dispatchEvent(new Event('canvasflow:image-persisted'));\n              scheduleSave(true);\n            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              suppressSave = previousImageSaveSuppress;\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n              scheduleSave(true);\n            }\n          } else {\n            suppressSave = previousImageSaveSuppress;\n            scheduleSave(true);\n          }`;
if (s.includes(imageUploadStart) && s.includes(imageUploadEnd)) {
  s = s.replace(imageUploadStart + imageUploadEnd, imageUploadReplacement);
}

// If image decoding fails, unlock autosave.
const decodeError = `      imgEl.onerror = (err) => {\n        console.error('Image decode failed:', err);\n        setSaveState('error', 'Could not load image');\n        resolve();\n      };`;
if (s.includes(decodeError)) {
  s = s.replace(decodeError, `      imgEl.onerror = (err) => {\n        console.error('Image decode failed:', err);\n        suppressSave = previousImageSaveSuppress;\n        setSaveState('error', 'Could not load image');\n        resolve();\n      };`);
}

// Any outer image exception also releases the lock.
const outerCatch = `        } catch (err) {\n          console.error('Image add failed:', err);\n          setSaveState('error', 'Could not add image');\n        }`;
if (s.includes(outerCatch)) {
  s = s.replace(outerCatch, `        } catch (err) {\n          console.error('Image add failed:', err);\n          suppressSave = previousImageSaveSuppress;\n          setSaveState('error', 'Could not add image');\n          scheduleSave(true);\n        }`);
}

/* ---------- Performance: don't recompress normal cloud images on every save ---------- */
const oldPrepare = `    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
const newPrepare = `    const hasLegacyDataImages = boardPages.some(pg => Array.isArray(pg?.objects) && pg.objects.some(o =>\n      typeof o?.src === "string" && o.src.indexOf("data:image/") === 0 && !o.srcUrl\n    ));\n    if (hasLegacyDataImages && typeof window.canvasflowPrepareFirestorePages === "function") {\n      await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
if (s.includes(oldPrepare)) s = s.replace(oldPrepare, newPrepare);

const oldPrepare2 = `    let pagesForSave = boardPages;\n    if (typeof window.canvasflowPrepareFirestorePages === "function") {\n      pagesForSave = await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
const newPrepare2 = `    let pagesForSave = boardPages;\n    const hasLegacyDataImages = boardPages.some(pg => Array.isArray(pg?.objects) && pg.objects.some(o =>\n      typeof o?.src === "string" && o.src.indexOf("data:image/") === 0 && !o.srcUrl\n    ));\n    if (hasLegacyDataImages && typeof window.canvasflowPrepareFirestorePages === "function") {\n      pagesForSave = await window.canvasflowPrepareFirestorePages(boardPages);\n    }`;
if (s.includes(oldPrepare2)) s = s.replace(oldPrepare2, newPrepare2);

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: stable board-open, image persistence, and performance repair installed.");
