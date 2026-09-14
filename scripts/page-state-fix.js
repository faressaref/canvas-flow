import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-page-state-fix">(function(){
  /*
   * Keep the in-memory page state authoritative.
   * The old flow could leave boardPages one navigation behind because it only
   * refreshed the page snapshot during remote save. That is especially visible
   * with images: Page 1 could be displayed, Page 2 opened, then Page 1 loaded
   * from a stale/empty snapshot.
   *
   * This patch mirrors the active Fabric canvas into boardPages immediately
   * after user mutations. It never runs while loadFromJSON is restoring a page,
   * so loading a page can never overwrite its source with a partially-loaded
   * canvas.
   */
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
        try {
          return canvas.toJSON(["objectRole","srcUrl","nodeId","arrowHead"]);
        } catch (e) {
          console.warn("CanvasFlow: page snapshot failed", e);
          return null;
        }
      }

      function syncNow(){
        if (restoring || typeof boardPageIndex !== "number") return;
        const snap = snapshot();
        if (!snap) return;
        try {
          boardPages[boardPageIndex] = snap;
          lastSnapshot = JSON.stringify(snap);
        } catch (e) {
          console.warn("CanvasFlow: page state sync failed", e);
        }
      }

      function syncSoon(){
        if (restoring) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(syncNow, 0);
      }

      /* Capture the current page before navigation/save code gets a chance to
         replace the canvas. */
      [
        "object:added",
        "object:modified",
        "object:removed",
        "path:created",
        "text:changed"
      ].forEach(function(eventName){
        canvas.on(eventName, syncSoon);
      });

      /* Image uploads can change src/srcUrl asynchronously without emitting a
         Fabric object:modified event. Keep the active page snapshot current
         while an image is being uploaded/restored. */
      setInterval(function(){
        if (restoring || typeof boardPageIndex !== "number") return;
        try {
          const snap = snapshot();
          if (!snap) return;
          const key = JSON.stringify(snap);
          if (key !== lastSnapshot) {
            boardPages[boardPageIndex] = snap;
            lastSnapshot = key;
          }
        } catch (_) {}
      }, 500);

      const originalLoadFromJSON = canvas.loadFromJSON.bind(canvas);
      canvas.loadFromJSON = function(json, callback, reviver){
        restoring = true;
        try {
          return originalLoadFromJSON(json, function(){
            try {
              if (typeof callback === "function") callback.apply(this, arguments);
            } finally {
              restoring = false;
              /* Establish the loaded page as the baseline, but do not replace
                 boardPages with a transient Fabric state during restoration. */
              const snap = snapshot();
              if (snap) lastSnapshot = JSON.stringify(snap);
            }
          }, reviver);
        } catch (e) {
          restoring = false;
          throw e;
        }
      };

      /* The first snapshot makes the fix safe even if the user adds an object
         before the first Fabric event reaches the handler. */
      syncNow();
      console.log("CanvasFlow: page-state persistence fix installed");
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
console.log("CanvasFlow: page-state persistence fix installed.");
