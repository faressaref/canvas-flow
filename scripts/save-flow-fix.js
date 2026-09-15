import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

// IMPORTANT: keep this build patch self-contained. Do not rewrite large
// application functions here; malformed string replacements can prevent the
// whole page (including the landing screen) from booting.
const marker = '<script id="canvasflow-safe-save-runtime">';
const injected = `<script id="canvasflow-safe-save-runtime">(function(){
  function boot(){
    try{
      if(typeof canvas === "undefined" || !canvas){ setTimeout(boot,150); return; }
      if(canvas.__canvasflowSafeSaveRuntime) return;
      canvas.__canvasflowSafeSaveRuntime = true;

      // Board opening must never leave the global save lock stuck.
      const originalLoad = canvas.loadFromJSON.bind(canvas);
      canvas.loadFromJSON = function(json, callback, reviver){
        let finished = false;
        const release = function(){
          if(finished) return;
          finished = true;
          try{ suppressSave = false; }catch(_){ }
          try{ setSaveState("saved", "Opened ✓"); }catch(_){ }
        };
        const timer = setTimeout(release, 4000);
        try{
          return originalLoad(json, function(){
            clearTimeout(timer);
            release();
            if(typeof callback === "function") callback.apply(this, arguments);
          }, reviver);
        }catch(e){
          clearTimeout(timer);
          release();
          throw e;
        }
      };

      // If an image is already backed by a permanent URL, never allow the
      // serializer to keep an old base64 copy in memory.
      const originalToJSON = canvas.toJSON.bind(canvas);
      canvas.toJSON = function(propertiesToInclude){
        const json = originalToJSON(propertiesToInclude);
        if(json && Array.isArray(json.objects)){
          json.objects.forEach(function(o){
            if(o && typeof o.srcUrl === "string" && /^https?:\\/\\//i.test(o.srcUrl)){
              o.src = o.srcUrl;
            }
          });
        }
        return json;
      };

      console.log("CanvasFlow: safe save runtime installed");
    }catch(e){
      console.warn("CanvasFlow: safe save runtime retry",e);
      setTimeout(boot,500);
    }
  }
  boot();
})();</script>`;

const start = s.indexOf(marker);
if(start >= 0){
  const end = s.indexOf("</script>", start);
  if(end >= 0) s = s.slice(0,start) + injected + s.slice(end + 9);
} else {
  s = s.replace("</body>", injected + "\n</body>");
}

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: safe save runtime installed without rewriting app functions.");
