import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const marker = '<script id="canvasflow-image-persistence-fix">';
const injected = `<script id="canvasflow-image-persistence-fix">(function(){
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

  // Never let a Firebase request leave the UI stuck on "Saving" forever.
  function installFirebaseTimeouts(){
    try{
      if(window.firebase && firebase.firestore && firebase.firestore.DocumentReference && !firebase.firestore.DocumentReference.prototype.__canvasflowTimeout){
        const proto=firebase.firestore.DocumentReference.prototype;
        const originalSet=proto.set;
        proto.set=function(){
          const args=arguments;
          const operation=Promise.resolve().then(()=>originalSet.apply(this,args));
          const timeout=new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("Firestore save timed out"),{code:"deadline-exceeded"})),15000));
          return Promise.race([operation,timeout]);
        };
        proto.__canvasflowTimeout=true;
      }
    }catch(e){console.warn("CanvasFlow: Firestore timeout patch failed",e)}

    try{
      if(window.firebase && firebase.storage && firebase.storage.Reference && !firebase.storage.Reference.prototype.__canvasflowTimeout){
        const proto=firebase.storage.Reference.prototype;
        const originalPut=proto.put;
        proto.put=function(){
          const args=arguments;
          const task=originalPut.apply(this,args);
          const timeout=setTimeout(()=>{try{task.cancel()}catch(_){ }},20000);
          if(task && typeof task.then==="function") return task.then(v=>{clearTimeout(timeout);return v},e=>{clearTimeout(timeout);throw e});
          return task;
        };
        proto.__canvasflowTimeout=true;
      }
    }catch(e){console.warn("CanvasFlow: Storage timeout patch failed",e)}
  }
  installFirebaseTimeouts();
  setTimeout(installFirebaseTimeouts,500);
  setTimeout(installFirebaseTimeouts,1500);

  console.log("CanvasFlow: reliable image persistence + save timeout installed");
})();</script>`;

const start=s.indexOf(marker);
if(start>=0){
  const end=s.indexOf("</script>",start);
  if(end>=0) s=s.slice(0,start)+injected+s.slice(end+9);
}else{
  s=s.replace("</body>",injected+"\\n</body>");
}

// Do not persist the temporary base64 URL in srcUrl.
s=s.replace(/objectRole:\s*'image',\s*fileName:\s*file\.name,\s*srcUrl:\s*dataUrl,/, "objectRole: 'image', fileName: file.name,");
s=s.replace(/objectRole:\s*\"image\",\s*fileName:\s*file\.name,\s*srcUrl:\s*dataUrl,/, 'objectRole: "image", fileName: file.name,');

// Prevent object:added/page-state from triggering a save while the image is
// still a temporary in-memory data URL.
const addNeedle=`          img.scale(scale);\n          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          scheduleSave(true);\n          pendingImagePoint = null;`;
const addReplacement=`          img.scale(scale);\n          const previousImageSaveSuppress = suppressSave;\n          suppressSave = true;\n          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          pendingImagePoint = null;`;
if(s.includes(addNeedle)) s=s.replace(addNeedle,addReplacement);

// Upload the original File, then replace Fabric's REAL src with the permanent
// Storage URL. The old code only changed srcUrl, leaving the base64 src behind.
const uploadNeedle=`              await ref.put(file);\n              img.set({srcUrl: await ref.getDownloadURL()});\n              canvas.requestRenderAll();\n              scheduleSave(true);`;
const uploadReplacement=`              await ref.put(file);\n              const imageUrl = await ref.getDownloadURL();\n              await new Promise((resolve,reject)=>{\n                let done=false;\n                const finish=()=>{if(done)return;done=true;resolve()};\n                const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Image URL load timed out'))},10000);\n                try{\n                  if(typeof img.setSrc==='function') img.setSrc(imageUrl,()=>{clearTimeout(timer);finish()});\n                  else { img.set({src:imageUrl}); clearTimeout(timer); finish(); }\n                }catch(e){clearTimeout(timer);reject(e)}\n              });\n              img.set({srcUrl:imageUrl});\n              canvas.requestRenderAll();\n              suppressSave = previousImageSaveSuppress;\n              try { window.dispatchEvent(new CustomEvent('canvasflow:image-persisted')); } catch (_) {}\n              scheduleSave(true);`;
if(s.includes(uploadNeedle)) s=s.replace(uploadNeedle,uploadReplacement);

// Always release suppressSave if Storage is unavailable or fails.
const catchNeedle=`            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n            }\n          }\n        } catch (err) {`;
const catchReplacement=`            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              suppressSave = previousImageSaveSuppress;\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n              scheduleSave(true);\n            }\n          } else {\n            suppressSave = previousImageSaveSuppress;\n            scheduleSave(true);\n          }\n        } catch (err) {`;
if(s.includes(catchNeedle)) s=s.replace(catchNeedle,catchReplacement);

const outerCatchNeedle=`        } catch (err) {\n          console.error('Image add failed:', err);\n          setSaveState('error', 'Could not add image');\n        }`;
const outerCatchReplacement=`        } catch (err) {\n          console.error('Image add failed:', err);\n          try { suppressSave = previousImageSaveSuppress; } catch (_) {}\n          setSaveState('error', 'Could not add image');\n          scheduleSave(true);\n        }`;
if(s.includes(outerCatchNeedle)) s=s.replace(outerCatchNeedle,outerCatchReplacement);

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: image upload/save fix installed.");
