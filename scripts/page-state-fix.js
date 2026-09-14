import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-page-state-fix">(function(){
  /* Keep page state authoritative without repeatedly serializing the entire
     canvas. The previous 500ms poll was expensive for image-heavy boards and
     could make Saving... appear stuck. */
  function boot(){
    try {
      if (typeof canvas === "undefined" || !canvas || typeof boardPages === "undefined") {
        setTimeout(boot, 100);
        return;
      }
      if (canvas.__canvasflowPageStateFixInstalled) return;
      canvas.__canvasflowPageStateFixInstalled = true;

      let restoring = false;
      let syncTimer = null;
      let lastSnapshot = "";

      function snapshot(){
        try { return canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]); }
        catch (e) { console.warn("CanvasFlow: page snapshot failed", e); return null; }
      }
      function syncNow(){
        if (restoring || typeof boardPageIndex !== "number") return;
        const snap = snapshot();
        if (!snap) return;
        try {
          boardPages[boardPageIndex] = snap;
          lastSnapshot = JSON.stringify(snap);
        } catch (e) { console.warn("CanvasFlow: page state sync failed", e); }
      }
      function syncSoon(){
        if (restoring) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(syncNow, 0);
      }

      ["object:added","object:modified","object:removed","path:created","text:changed"]
        .forEach(eventName => canvas.on(eventName, syncSoon));

      /* Explicitly sync after asynchronous image work. The image persistence
         code calls scheduleSave after replacing the source with its permanent
         URL, so no high-frequency polling is necessary. */
      window.addEventListener("canvasflow:image-persisted", syncSoon);

      const originalLoadFromJSON = canvas.loadFromJSON.bind(canvas);
      canvas.loadFromJSON = function(json, callback, reviver){
        restoring = true;
        try {
          return originalLoadFromJSON(json, function(){
            try {
              if (typeof callback === "function") callback.apply(this, arguments);
            } finally {
              restoring = false;
              const snap = snapshot();
              if (snap) lastSnapshot = JSON.stringify(snap);
            }
          }, reviver);
        } catch (e) {
          restoring = false;
          throw e;
        }
      };

      syncNow();
      console.log("CanvasFlow: page-state persistence fix installed (no polling)");
    } catch (e) {
      console.warn("CanvasFlow: page-state fix boot failed", e);
      setTimeout(boot, 500);
    }
  }
  boot();
})();</script>`;

const marker = '<script id="canvasflow-page-state-fix">';
const start = s.indexOf(marker);
if (start >= 0) {
  const end = s.indexOf("</script>", start);
  if (end >= 0) s = s.slice(0, start) + injected + s.slice(end + 9);
} else {
  s = s.replace("</body>", injected + "\n</body>");
}

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: page-state persistence fix installed without polling.");
