import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

// Images must NEVER be autosaved as base64 while they are still uploading.
// The old patch depended on exact indentation and therefore often missed the
// real upload block. Use small, anchored replacements instead.
const marker = '<script id="canvasflow-image-persistence-fix">';
const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  // Safety net for legacy boards: if an image already has a permanent Storage
  // URL, make Fabric deserialize/render from that URL instead of stale base64.
  const isHttp=u=>typeof u==="string"&&/^https?:\\/\\//i.test(u);
  window.canvasflowPrepareFirestorePages=async function(pages){
    if(!Array.isArray(pages)) return pages;
    for(const p of pages){
      if(!p||!Array.isArray(p.objects)) continue;
      for(const o of p.objects){
        if(o&&isHttp(o.srcUrl)) o.src=o.srcUrl;
      }
    }
    return pages;
  };
  console.log("CanvasFlow: reliable image persistence fix installed");
})();</script>`;

const start=s.indexOf(marker);
if(start>=0){
  const end=s.indexOf("</script>",start);
  if(end>=0) s=s.slice(0,start)+injected+s.slice(end+9);
} else {
  s=s.replace("</body>",injected+"\n</body>");
}

// 1) Stop putting the temporary base64 URL into the custom srcUrl field.
// Fabric's internal src is still used only in-memory until Storage finishes.
s=s.replace(/objectRole:\s*'image',\s*fileName:\s*file\.name,\s*srcUrl:\s*dataUrl,/, "objectRole: 'image', fileName: file.name,");
s=s.replace(/objectRole:\s*"image",\s*fileName:\s*file\.name,\s*srcUrl:\s*dataUrl,/, 'objectRole: "image", fileName: file.name,');

// 2) Lock autosave BEFORE canvas.add(img), so object:added/page-state cannot
// serialize the huge temporary data URL.
const addNeedle = `          img.scale(scale);\n          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          scheduleSave(true);\n          pendingImagePoint = null;`;
const addReplacement = `          img.scale(scale);\n          const previousImageSaveSuppress = suppressSave;\n          suppressSave = true;\n          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          pendingImagePoint = null;`;
if(s.includes(addNeedle)) s=s.replace(addNeedle,addReplacement);

// 3) Once Storage succeeds, replace Fabric's actual image source with the
// permanent URL. Setting only srcUrl was the core bug: Fabric kept serializing
// the original base64 src.
const uploadNeedle = `              await ref.put(file);\n              img.set({srcUrl: await ref.getDownloadURL()});\n              canvas.requestRenderAll();\n              scheduleSave(true);`;
const uploadReplacement = `              await ref.put(file);\n              const imageUrl = await ref.getDownloadURL();\n              await new Promise((resolve, reject) => {\n                if (typeof img.setSrc !== 'function') {\n                  img.set({src:imageUrl});\n                  resolve();\n                  return;\n                }\n                img.setSrc(imageUrl, () => resolve());\n              });\n              img.set({srcUrl:imageUrl});\n              canvas.requestRenderAll();\n              suppressSave = previousImageSaveSuppress;\n              try { window.dispatchEvent(new CustomEvent('canvasflow:image-persisted')); } catch (_) {}\n              scheduleSave(true);`;
if(s.includes(uploadNeedle)) s=s.replace(uploadNeedle,uploadReplacement);

// 4) Always release the lock on Storage failure or when Storage is unavailable.
const catchNeedle = `            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n            }\n          }\n        } catch (err) {`;
const catchReplacement = `            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              suppressSave = previousImageSaveSuppress;\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n              scheduleSave(true);\n            }\n          } else {\n            suppressSave = previousImageSaveSuppress;\n            scheduleSave(true);\n          }\n        } catch (err) {`;
if(s.includes(catchNeedle)) s=s.replace(catchNeedle,catchReplacement);

const outerCatchNeedle = `        } catch (err) {\n          console.error('Image add failed:', err);\n          setSaveState('error', 'Could not add image');\n        }`;
const outerCatchReplacement = `        } catch (err) {\n          console.error('Image add failed:', err);\n          try { suppressSave = previousImageSaveSuppress; } catch (_) {}\n          setSaveState('error', 'Could not add image');\n          scheduleSave(true);\n        }`;
if(s.includes(outerCatchNeedle)) s=s.replace(outerCatchNeedle,outerCatchReplacement);

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: reliable image upload/save patch installed.");
