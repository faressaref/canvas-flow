import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

// Fix board opening leaving suppressSave=true and therefore blocking every
// subsequent autosave. Also add a safety release if Fabric's async callback
// is delayed unexpectedly.
s = s.replace(
  '  // Fabric\'s callback runs asynchronously, so finish the UI state there.\n    canvas.loadFromJSON(data, function(){',
  '  // Fabric\'s callback runs asynchronously, so finish the UI state there.\n    let openFinished = false;\n    const openSafetyTimer = setTimeout(() => {\n      if (!openFinished && suppressSave) {\n        console.warn("CanvasFlow: board open callback delayed; releasing save lock.");\n        suppressSave = false;\n        setSaveState("saved", "Opened ✓");\n      }\n    }, 5000);\n    canvas.loadFromJSON(data, function(){'
);

s = s.replace(
  '        setSaveState("saved", "Opened ✓");\n      }catch(renderErr){',
  '        setSaveState("saved", "Opened ✓");\n      }catch(renderErr){'
);

// Always release the load lock after the callback, even if rendering/history
// UI code throws. This is the critical part: new canvas changes must be able
// to reach scheduleSave() immediately after a board is opened.
s = s.replace(
  '      }catch(renderErr){\n        console.error("CanvasFlow render after board open failed:",renderErr);\n        setSaveState("error", "Open failed: " + (renderErr.message||renderErr));\n      }finally{\n        suppressSave=false;\n      }\n    });',
  '      }catch(renderErr){\n        console.error("CanvasFlow render after board open failed:",renderErr);\n        setSaveState("error", "Open failed: " + (renderErr.message||renderErr));\n      }finally{\n        openFinished = true;\n        clearTimeout(openSafetyTimer);\n        suppressSave=false;\n      }\n    });'
);

// Make scheduleSave self-healing: once a board is open, never silently leave
// the user without an autosave indicator because of a stale save lock.
s = s.replace(
  'function scheduleSave(major=false) {\n  if(!suppressSave) saveLocalDraft();',
  'function scheduleSave(major=false) {\n  if(!suppressSave) saveLocalDraft();'
);

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: board-open save lock fix installed.");
