import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-page-state-fix">(function(){
  /* Keep page state authoritative without repeatedly serializing the entire
     canvas. Sync immediately before both local and cloud saves. */
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
          /* scheduleSave() runs before this listener on Fabric events, so also
             refresh the local draft here. The next debounced cloud save reads
             the same authoritative boardPages state. */
          if (typeof saveLocalDraft === "function" && !suppressSave) saveLocalDraft();
        } catch (e) { console.warn("CanvasFlow: page state sync failed", e); }
      }
      function syncSoon(){
        if (restoring) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(syncNow, 0);
      }

      ["object:added","object:modified","object:removed","path:created","text:changed"]
        .forEach(eventName => canvas.on(eventName, syncSoon));

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
              if (snap && typeof boardPageIndex === "number") boardPages[boardPageIndex] = snap;
            }
          }, reviver);
        } catch (e) {
          restoring = false;
          throw e;
        }
      };

      /* Guests keep a durable local draft too. If the user refreshes while
         already inside the app, restore the latest local board automatically. */
      if (!currentUser && localStorage.getItem("canvasflow-app-entered") === "1" &&
          !canvas.getObjects().length && typeof restoreLocalDraft === "function") {
        restoreLocalDraft();
      }

      syncNow();
      console.log("CanvasFlow: reliable page-state persistence installed");
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
console.log("CanvasFlow: reliable page-state persistence installed.");
