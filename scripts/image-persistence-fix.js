import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const marker = '<script id="canvasflow-image-persistence-fix">';
const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  const isDataImage = u => typeof u === "string" && u.indexOf("data:image/") === 0;
  const isHttp = u => typeof u === "string" && /^https?:\\/\\//i.test(u);

  // Firestore helper: permanent Storage URLs are tiny; never duplicate the
  // actual bitmap into Firestore when a URL is already available.
  window.canvasflowPrepareFirestorePages = async function(pages){
    if(!Array.isArray(pages)) return pages;
    for(const page of pages){
      if(!page || !Array.isArray(page.objects)) continue;
      for(const obj of page.objects){
        if(!obj) continue;
        if(isHttp(obj.srcUrl)) obj.src = obj.srcUrl;
        if(isHttp(obj.src)) obj.srcUrl = obj.src;
      }
    }
    return pages;
  };

  function boot(){
    try{
      if(typeof canvas === "undefined" || !canvas || typeof firebase === "undefined"){
        setTimeout(boot,300); return;
      }
      if(canvas.__canvasflowImageRuntime) return;
      canvas.__canvasflowImageRuntime = true;

      // Prevent autosave while a newly-added image is still a temporary data URL.
      const originalScheduleSave = typeof scheduleSave === "function" ? scheduleSave : null;
      let pendingUploads = 0;
      window.canvasflowImageUploadPending = () => pendingUploads > 0;

      if(originalScheduleSave && !window.__canvasflowScheduleSaveImageGuard){
        window.__canvasflowScheduleSaveImageGuard = true;
        window.canvasflowOriginalScheduleSave = originalScheduleSave;
        window.scheduleSave = function(){
          if(pendingUploads > 0) return;
          return originalScheduleSave.apply(this, arguments);
        };
      }

      async function uploadImageObject(obj){
        if(!obj || !isDataImage(obj.src) || obj.__canvasflowImageUploading || obj.srcUrl) return;
        obj.__canvasflowImageUploading = true;
        pendingUploads++;
        const oldSuppress = typeof suppressSave !== "undefined" ? suppressSave : false;
        try{
          if(typeof suppressSave !== "undefined") suppressSave = true;
          if(!storage || !currentUser){
            throw new Error("Image storage is not ready");
          }
          const safeName = String(obj.fileName || "image.png").replace(/[^a-zA-Z0-9._-]/g,"_");
          const ref = storage.ref("whiteboard-images/" + Date.now() + "_" + Math.random().toString(36).slice(2) + "_" + safeName);

          // Convert the temporary Fabric bitmap to a Blob and upload it.
          const dataUrl = obj.src;
          const blob = await (await fetch(dataUrl)).blob();
          await Promise.race([
            ref.put(blob, {contentType: blob.type || "image/png"}),
            new Promise((_,reject)=>setTimeout(()=>reject(new Error("Image upload timed out")),20000))
          ]);
          const url = await ref.getDownloadURL();

          // Replace the REAL Fabric source. srcUrl alone is not enough.
          await new Promise((resolve,reject)=>{
            if(typeof obj.setSrc !== "function"){
              obj.set({src:url, srcUrl:url}); resolve(); return;
            }
            let done=false;
            const finish=()=>{if(done)return;done=true;resolve()};
            const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error("Image URL load timed out"))},10000);
            try{ obj.setSrc(url,()=>{clearTimeout(timer);finish()}); }
            catch(e){clearTimeout(timer);reject(e)}
          });
          obj.set({srcUrl:url});
          canvas.requestRenderAll();
          try{ window.dispatchEvent(new CustomEvent("canvasflow:image-persisted")); }catch(_){ }
        }catch(e){
          console.warn("CanvasFlow: image upload failed",e);
          // Leave the image visible locally. It will be handled by the normal
          // Firestore compressor rather than breaking the whiteboard.
        }finally{
          pendingUploads = Math.max(0,pendingUploads-1);
          obj.__canvasflowImageUploading = false;
          if(typeof suppressSave !== "undefined") suppressSave = oldSuppress;
          if(pendingUploads === 0){
            try{ if(typeof window.canvasflowOriginalScheduleSave === "function") window.canvasflowOriginalScheduleSave(true); }catch(_){ }
          }
        }
      }

      canvas.on("object:added", function(e){
        const obj=e && e.target;
        if(obj && obj.type === "image" && isDataImage(obj.src) && !obj.srcUrl){
          // Let Fabric finish adding/rendering before replacing its source.
          setTimeout(()=>uploadImageObject(obj),50);
        }
      });

      console.log("CanvasFlow: stable image Storage uploader installed");
    }catch(e){
      console.warn("CanvasFlow: image runtime retry",e);
      setTimeout(boot,500);
    }
  }
  boot();
})();</script>`;

const start = s.indexOf(marker);
if(start >= 0){
  const end = s.indexOf("</script>",start);
  if(end >= 0) s = s.slice(0,start) + injected + s.slice(end + 9);
}else{
  s = s.replace("</body>", injected + "\\n</body>");
}

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: stable image Storage uploader installed.");
