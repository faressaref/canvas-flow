import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const marker = '<script id="canvasflow-image-persistence-fix">';
const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  const isDataImage = u => typeof u === "string" && u.indexOf("data:image/") === 0;
  const isHttp = u => typeof u === "string" && /^https?:\\/\\//i.test(u);

  function boot(){
    try{
      if(typeof canvas === "undefined" || !canvas || typeof firebase === "undefined"){
        setTimeout(boot,300); return;
      }
      if(canvas.__canvasflowImageRuntime) return;
      canvas.__canvasflowImageRuntime = true;

      // Do NOT replace the Firestore size helper installed by firestore-size-fix.js.
      // Chain it so large fallback images are still compressed when Storage fails.
      const previousPrepare = window.canvasflowPrepareFirestorePages;
      window.canvasflowPrepareFirestorePages = async function(pages){
        if(typeof previousPrepare === "function") return previousPrepare(pages);
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

      let pendingUploads = 0;
      window.canvasflowImageUploadPending = () => pendingUploads > 0;

      async function uploadImageObject(obj){
        if(!obj || !isDataImage(obj.src) || obj.__canvasflowImageUploading || obj.srcUrl) return;
        obj.__canvasflowImageUploading = true;
        pendingUploads++;
        const oldSuppress = typeof suppressSave !== "undefined" ? suppressSave : false;
        try{
          if(typeof suppressSave !== "undefined") suppressSave = true;
          if(typeof storage === "undefined' || !storage || !currentUser){
            throw new Error("Image storage is not ready");
          }
          const safeName = String(obj.fileName || "image.png").replace(/[^a-zA-Z0-9._-]/g,"_");
          const ref = storage.ref("whiteboard-images/" + Date.now() + "_" + Math.random().toString(36).slice(2) + "_" + safeName);
          const dataUrl = obj.src;
          const blob = await (await fetch(dataUrl)).blob();
          await Promise.race([
            ref.put(blob, {contentType: blob.type || "image/png"}),
            new Promise((_,reject)=>setTimeout(()=>reject(new Error("Image upload timed out")),20000))
          ]);
          const url = await ref.getDownloadURL();

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
        }catch(e){
          console.warn("CanvasFlow: image upload failed; Firestore fallback will be used",e);
        }finally{
          pendingUploads = Math.max(0,pendingUploads-1);
          obj.__canvasflowImageUploading = false;
          if(typeof suppressSave !== "undefined") suppressSave = oldSuppress;
          if(pendingUploads === 0){
            try{ if(typeof scheduleSave === "function") scheduleSave(true); }catch(_){ }
          }
        }
      }

      // Critical: suppress autosave BEFORE Fabric fires object:added. This prevents
      // the first save from serializing the huge Base64 image while Storage upload runs.
      const originalAdd = canvas.add.bind(canvas);
      canvas.add = function(){
        const args = Array.from(arguments);
        const imageArgs = args.filter(o => o && o.type === "image" && isDataImage(o.src) && !o.srcUrl);
        if(imageArgs.length && typeof suppressSave !== "undefined") suppressSave = true;
        const result = originalAdd.apply(canvas,args);
        for(const obj of imageArgs){
          setTimeout(()=>uploadImageObject(obj),50);
        }
        if(!imageArgs.length && typeof suppressSave !== "undefined"){
          // Leave normal behavior untouched for non-image objects.
        }
        return result;
      };

      // Catch images added through code paths that bypass the wrapper.
      canvas.on("object:added", function(e){
        const obj=e && e.target;
        if(obj && obj.type === "image" && isDataImage(obj.src) && !obj.srcUrl && !obj.__canvasflowImageUploading){
          if(typeof suppressSave !== "undefined") suppressSave = true;
          setTimeout(()=>uploadImageObject(obj),50);
        }
      });

      console.log("CanvasFlow: image save race fixed");
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
  s = s.replace("</body>", injected + "\n</body>");
}

fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: image save race fixed.");
