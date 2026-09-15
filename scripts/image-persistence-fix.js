import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const marker = '<script id="canvasflow-image-persistence-fix">';
const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  const isHttp=u=>typeof u==="string"&&/^https?:\\/\\//i.test(u);
  const isData=u=>typeof u==="string"&&u.indexOf("data:image/")===0;
  const MAX_PAGES=760*1024;

  function dataSize(v){try{return new Blob([JSON.stringify(v)]).size}catch(_){return String(v||"").length}}
  function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
  function blobUrlData(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
  async function shrink(src,maxSide,quality){
    try{
      const im=await loadImage(src);
      const ow=im.naturalWidth||im.width||1, oh=im.naturalHeight||im.height||1;
      const scale=Math.min(1,maxSide/Math.max(ow,oh));
      const w=Math.max(1,Math.round(ow*scale)), h=Math.max(1,Math.round(oh*scale));
      const c=document.createElement("canvas"); c.width=w; c.height=h;
      const ctx=c.getContext("2d"); if(!ctx)return null;
      ctx.drawImage(im,0,0,w,h);
      const b=await new Promise(r=>c.toBlob(r,"image/webp",quality));
      if(!b)return null;
      return {src:await blobUrlData(b),width:w,height:h,size:b.size};
    }catch(e){console.warn("CanvasFlow: image shrink failed",e);return null}
  }

  // Permanent Storage URLs are always the real persisted image source.
  // Temporary data URLs get a compact Firestore fallback so a large image can
  // NEVER make the whole pages array exceed Firestore's 1 MiB field limit.
  window.canvasflowPrepareFirestorePages=async function(pages){
    if(!Array.isArray(pages))return pages;

    for(const p of pages){
      if(!p||!Array.isArray(p.objects))continue;
      for(const o of p.objects){
        if(o&&isHttp(o.srcUrl)) o.src=o.srcUrl;
      }
    }

    if(dataSize(pages)<=MAX_PAGES)return pages;

    const levels=[[1000,.42],[760,.30],[560,.20],[420,.14],[320,.10]];
    for(const [maxSide,q] of levels){
      let changed=false;
      for(const p of pages){
        if(!p||!Array.isArray(p.objects))continue;
        for(const o of p.objects){
          if(!o||!isData(o.src)||isHttp(o.srcUrl))continue;
          const oldW=Number(o.width)||1,oldH=Number(o.height)||1,oldSX=Number(o.scaleX)||1,oldSY=Number(o.scaleY)||1;
          const r=await shrink(o.src,maxSide,q);
          if(r){
            o.src=r.src;
            o.width=r.width;
            o.height=r.height;
            o.scaleX=(oldW*oldSX)/r.width;
            o.scaleY=(oldH*oldSY)/r.height;
            changed=true;
          }
        }
      }
      if(changed&&dataSize(pages)<=MAX_PAGES)break;
    }
    return pages;
  };

  // Never let a Firebase request leave the UI stuck on "Saving" forever.
  function installFirebaseTimeouts(){
    try{
      if(window.firebase&&firebase.firestore&&firebase.firestore.DocumentReference&&!firebase.firestore.DocumentReference.prototype.__canvasflowTimeout){
        const proto=firebase.firestore.DocumentReference.prototype;
        const originalSet=proto.set;
        proto.set=function(){
          const operation=Promise.resolve().then(()=>originalSet.apply(this,arguments));
          const timeout=new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("Firestore save timed out"),{code:"deadline-exceeded"})),15000));
          return Promise.race([operation,timeout]);
        };
        proto.__canvasflowTimeout=true;
      }
    }catch(e){console.warn("CanvasFlow: Firestore timeout patch failed",e)}
    try{
      if(window.firebase&&firebase.storage&&firebase.storage.Reference&&!firebase.storage.Reference.prototype.__canvasflowTimeout){
        const proto=firebase.storage.Reference.prototype;
        const originalPut=proto.put;
        proto.put=function(){
          const task=originalPut.apply(this,arguments);
          const timer=setTimeout(()=>{try{task.cancel()}catch(_){ }},20000);
          if(task&&typeof task.then==="function")return task.then(v=>{clearTimeout(timer);return v},e=>{clearTimeout(timer);throw e});
          return task;
        };
        proto.__canvasflowTimeout=true;
      }
    }catch(e){console.warn("CanvasFlow: Storage timeout patch failed",e)}
  }
  installFirebaseTimeouts();setTimeout(installFirebaseTimeouts,500);setTimeout(installFirebaseTimeouts,1500);
})();</script>`;

const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf("</script>",start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9)}
else{s=s.replace("</body>",injected+"\n</body>")}

// Do not persist a temporary base64 URL in the custom srcUrl field.
s=s.replace(/objectRole:\s*'image',\s*fileName:\s*file\.name,\s*srcUrl:\s*dataUrl,/,"objectRole: 'image', fileName: file.name,");
s=s.replace(/objectRole:\s*\"image\",\s*fileName:\s*file\.name,\s*srcUrl:\s*dataUrl,/, 'objectRole: "image", fileName: file.name,');

// Prevent object:added/page-state from saving the temporary base64 image.
const addNeedle=`          img.scale(scale);\n          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          scheduleSave(true);\n          pendingImagePoint = null;`;
const addReplacement=`          img.scale(scale);\n          const previousImageSaveSuppress = suppressSave;\n          suppressSave = true;\n          canvas.add(img);\n          canvas.setActiveObject(img);\n          canvas.setCursor('default');\n          canvas.requestRenderAll();\n          pendingImagePoint = null;`;
if(s.includes(addNeedle))s=s.replace(addNeedle,addReplacement);

// Upload first, then replace Fabric's actual src with the permanent Storage URL.
const uploadNeedle=`              await ref.put(file);\n              img.set({srcUrl: await ref.getDownloadURL()});\n              canvas.requestRenderAll();\n              scheduleSave(true);`;
const uploadReplacement=`              await ref.put(file);\n              const imageUrl = await ref.getDownloadURL();\n              await new Promise((resolve,reject)=>{\n                let done=false;\n                const finish=()=>{if(done)return;done=true;resolve()};\n                const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Image URL load timed out'))},10000);\n                try{\n                  if(typeof img.setSrc==='function') img.setSrc(imageUrl,()=>{clearTimeout(timer);finish()});\n                  else { img.set({src:imageUrl}); clearTimeout(timer); finish(); }\n                }catch(e){clearTimeout(timer);reject(e)}\n              });\n              img.set({srcUrl:imageUrl});\n              canvas.requestRenderAll();\n              suppressSave=previousImageSaveSuppress;\n              try{window.dispatchEvent(new CustomEvent('canvasflow:image-persisted'))}catch(_){}\n              scheduleSave(true);`;
if(s.includes(uploadNeedle))s=s.replace(uploadNeedle,uploadReplacement);

// Always release the lock if Storage is unavailable or fails.
const catchNeedle=`            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n            }\n          }\n        } catch (err) {`;
const catchReplacement=`            } catch (err) {\n              console.error('Image Storage upload failed:', err);\n              suppressSave=previousImageSaveSuppress;\n              setSaveState('error', 'Image added locally — Firebase Storage failed');\n              scheduleSave(true);\n            }\n          } else {\n            suppressSave=previousImageSaveSuppress;\n            scheduleSave(true);\n          }\n        } catch (err) {`;
if(s.includes(catchNeedle))s=s.replace(catchNeedle,catchReplacement);

const outerCatchNeedle=`        } catch (err) {\n          console.error('Image add failed:', err);\n          setSaveState('error', 'Could not add image');\n        }`;
const outerCatchReplacement=`        } catch (err) {\n          console.error('Image add failed:', err);\n          try{suppressSave=previousImageSaveSuppress}catch(_){}\n          setSaveState('error', 'Could not add image');\n          scheduleSave(true);\n        }`;
if(s.includes(outerCatchNeedle))s=s.replace(outerCatchNeedle,outerCatchReplacement);

fs.writeFileSync(file,"utf8"===typeof s?s:"utf8");
console.log("CanvasFlow: image persistence and Firestore size protection installed.");
