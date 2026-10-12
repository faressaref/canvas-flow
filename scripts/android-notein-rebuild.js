import fs from "node:fs";

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");
const marker = '<style id="canvasflow-android-notein-rebuild">';

const css = `
<style id="canvasflow-android-notein-rebuild">
/* Android-first CanvasFlow visual rebuild.
   Palette intentionally preserves CanvasFlow's violet, ink and soft-neutral colors.
   CSS only: existing controls, IDs, Firebase, AI, board and save logic remain intact. */
:root{
  --cf-accent:#665ce7;
  --cf-accent-soft:#efedff;
  --cf-ink:#252637;
  --cf-muted:#85899a;
  --cf-line:#e7e8f0;
  --cf-panel:#fff;
  --cf-bg:#f5f6fa;
  --cf-paper:#fffefa;
  --cf-shadow:0 10px 34px rgba(38,35,82,.075);
  --cf-radius:18px;
}
html,body{background:var(--cf-bg)!important;color:var(--cf-ink)!important}
button,input,select,textarea{font-family:inherit}
button{ -webkit-tap-highlight-color:transparent; }
button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #665ce755!important;outline-offset:2px}

/* Library: redesigned as a focused notebook home, retaining original navigation hooks. */
#landing.cf-library{
  display:flex!important;align-items:stretch!important;justify-content:stretch!important;
  width:100%;height:100dvh;min-height:0;overflow:hidden!important;padding:0!important;
  background:var(--cf-bg)!important;color:var(--cf-ink)!important;text-align:left!important;
}
.cf-library-side{
  width:236px;flex:0 0 236px;gap:6px;padding:25px 14px 17px;
  background:#fff;border-right:1px solid var(--cf-line);min-height:0;overflow-y:auto;
}
.cf-brand{padding:0 9px 22px;gap:11px;font-size:18px;letter-spacing:-.65px}
.cf-brand-icon{width:38px;height:38px;flex:0 0 38px;border-radius:13px;background:var(--cf-accent);box-shadow:0 7px 18px #665ce72b;font-size:18px}
.cf-brand em,.cf-mobile-brand em{color:var(--cf-accent)}
.cf-brand small{font-size:8px;letter-spacing:1.65px;margin-top:4px}
.cf-new{min-height:44px;border-radius:13px;padding:12px 14px;background:var(--cf-accent);box-shadow:0 7px 16px #665ce72b;font-size:12px;transition:transform .16s,box-shadow .16s}
.cf-new:active{transform:scale(.98)}
.cf-nav-label{padding:19px 11px 7px;font-size:9px;letter-spacing:1.5px;color:#9b9caf}
.cf-nav,.cf-subject{min-height:42px;padding:10px 12px;border-radius:12px;gap:12px;font-size:12px;color:#666a7e;transition:background .15s,color .15s}
.cf-nav.active{background:var(--cf-accent-soft);color:var(--cf-accent);font-weight:800}
.cf-nav:hover,.cf-subject:hover{background:#f7f6ff}
.cf-side-note{padding:14px;border:1px solid var(--cf-line);background:#fafaff;border-radius:15px;font-size:10px}
.cf-side-note strong{font-size:11px}
.cf-library-main{background:var(--cf-bg);overscroll-behavior:contain}
.cf-library-top{
  height:68px;flex:0 0 68px;padding:0 clamp(16px,3vw,38px);gap:15px;
  background:#ffffffed;border-bottom:1px solid var(--cf-line);backdrop-filter:blur(18px);
}
.cf-mobile-brand{font-size:15px;font-weight:850;letter-spacing:-.5px;align-items:center;gap:8px}
.cf-mobile-brand .cf-brand-icon{width:30px;height:30px;flex-basis:30px;border-radius:10px;font-size:14px}
.cf-top-title{font-size:12px;color:#777b8f;font-weight:700}
.cf-library-top input{width:min(280px,30vw);min-height:40px;padding:0 14px;border:1px solid var(--cf-line);border-radius:13px;background:#f8f8fc;font-size:12px;transition:border-color .15s,box-shadow .15s}
.cf-library-top input:focus{border-color:#b7b1fa;box-shadow:0 0 0 4px #665ce712;outline:none}
.cf-profile{width:38px;height:38px;flex:0 0 38px;border:3px solid white;border-radius:50%;background:var(--cf-accent);color:white;font-weight:850;box-shadow:0 0 0 1px var(--cf-line)}
.cf-library-content{width:min(1200px,100%);margin:0 auto;padding:clamp(20px,3.4vw,42px);gap:25px}
.cf-welcome{display:flex;align-items:center;justify-content:space-between;gap:22px;padding:clamp(22px,3vw,36px);border:1px solid #e9e7ff;border-radius:24px;background:radial-gradient(ellipse at 100% 0%,#efedff 0,transparent 48%),linear-gradient(120deg,#fff 0%,#faf9ff 100%);box-shadow:var(--cf-shadow)}
.cf-eyebrow{font-size:9px;letter-spacing:1.55px;font-weight:850;color:var(--cf-accent);margin-bottom:12px}
.cf-welcome h1{font-size:clamp(25px,3vw,39px);line-height:1.1;letter-spacing:-1.3px;color:var(--cf-ink);margin:0 0 12px}
.cf-welcome p{font-size:12px;line-height:1.7;color:#85899a;margin:0;max-width:450px}
.cf-create{flex:0 0 auto;min-height:45px}
.cf-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:0}
.cf-section-head h2{font-size:16px;letter-spacing:-.35px;margin:0;color:var(--cf-ink)}
.cf-text-button{border:0;background:transparent;color:var(--cf-accent);font-size:11px;font-weight:800;padding:10px;border-radius:10px}
.cf-text-button:hover{background:var(--cf-accent-soft)}
.cf-note-grid{gap:16px;grid-template-columns:repeat(3,minmax(0,1fr))}
.cf-note-card{min-width:0;overflow:hidden;text-align:left;padding:0 0 15px;border:1px solid var(--cf-line);border-radius:18px;background:#fff;box-shadow:0 4px 16px #26234a06;transition:transform .18s,box-shadow .18s,border-color .18s}
.cf-note-card:hover{transform:translateY(-3px);box-shadow:var(--cf-shadow);border-color:#d8d3ff}
.cf-thumb{height:126px;margin:0 0 13px;border-radius:0;border-bottom:1px solid var(--cf-line)}
.cf-note-card strong,.cf-note-card .cf-note-meta{margin-left:15px;margin-right:15px}
.cf-note-card strong{font-size:12px;letter-spacing:-.15px}
.cf-note-meta{font-size:10px;color:var(--cf-muted)}
.cf-pages{gap:5px}
.cf-tool-card{border:1px solid var(--cf-line);border-radius:15px;background:#fff;box-shadow:0 3px 13px #26234a05;transition:transform .16s,border-color .16s}
.cf-tool-card:hover{transform:translateY(-2px);border-color:#d5d0ff}
.cf-library-foot{color:#9a9cad;font-size:10px}
.cf-library-main,.cf-library-content{scrollbar-width:thin;scrollbar-color:#d8d6e9 transparent}

/* Board workspace: calmer editor, distinct floating tool groups, unchanged control IDs. */
#app{background:var(--cf-bg)!important}
#topbar{
  min-height:62px!important;height:auto!important;flex:0 0 auto!important;
  padding:9px 16px!important;gap:10px!important;flex-wrap:wrap;
  background:#ffffffed!important;border-bottom:1px solid var(--cf-line)!important;
  box-shadow:0 4px 20px #25263708!important;backdrop-filter:blur(18px);
}
.brand{font-size:17px!important;letter-spacing:-.7px!important;color:var(--cf-ink)!important}
.brand span{color:var(--cf-accent)!important}
.toolgroup{gap:3px!important;padding:4px!important;border:1px solid var(--cf-line)!important;border-radius:14px!important;background:#f8f8fc!important}
button.tool,.iconbtn{min-width:38px!important;height:38px!important;border-radius:11px!important;color:#666a7e!important;transition:background .15s,color .15s,transform .15s!important}
button.tool:hover,.iconbtn:hover{background:var(--cf-accent-soft)!important;color:var(--cf-accent)!important}
button.tool.active{background:var(--cf-accent)!important;color:#fff!important;box-shadow:0 4px 10px #665ce72e}
.separator{background:var(--cf-line)!important;height:29px!important}
.control{min-height:38px;padding:0 8px;border:1px solid var(--cf-line);border-radius:12px;background:#fff;color:#85899a!important}
input[type=color]{border-radius:9px!important}
input[type=range]{accent-color:var(--cf-accent)!important}
#saveState{padding:7px 11px!important;border:1px solid #dcefe5!important;border-radius:10px!important;background:#f2fbf6!important;font-size:11px!important;font-weight:800!important}
#workspace{background:#eff0f6!important}
#canvasWrap{background-color:#f1f2f8!important;background-image:radial-gradient(#d8d9e8 1px,transparent 1px)!important;background-size:24px 24px!important}
#zoom{border:1px solid var(--cf-line)!important;border-radius:14px!important;background:#fff!important;box-shadow:var(--cf-shadow)!important;padding:5px!important}
#zoom button{border-radius:9px!important}
#hint{border:1px solid var(--cf-line)!important;border-radius:12px!important;box-shadow:var(--cf-shadow)!important}
#aiPanel{border:1px solid var(--cf-line)!important;border-radius:20px!important;box-shadow:0 18px 60px #2526371a!important;overflow:hidden}
.ai-head{background:#fff!important;border-bottom:1px solid var(--cf-line)!important}
.ai-title{color:var(--cf-ink)!important}
.ai-action,.ai-position{border-radius:10px!important}
#boardsModal,#accountChooserModal{backdrop-filter:blur(8px)}
.boards-toolbar{gap:9px!important}
.board-action{border-radius:11px!important}
#boardNameDisplay,.board-name-input{border-radius:10px!important}
.primary{background:var(--cf-accent)!important;border-radius:12px!important;box-shadow:0 5px 14px #665ce72b!important}
.secondary{border-radius:12px!important}

/* Tablet: use available width for the notebook, not oversized phone controls. */
@media (min-width:761px) and (max-width:1100px){
 .cf-library-side{width:208px;flex-basis:208px;padding:20px 11px}
 .cf-library-content{padding:24px;gap:21px}
 .cf-note-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 .cf-welcome{padding:26px}
 #topbar{gap:7px!important;padding:8px 10px!important}
 .brand{font-size:15px!important}
 button.tool,.iconbtn{min-width:36px!important;height:36px!important}
 .toolgroup{gap:1px!important}
 #topbar .control{padding:0 5px}
 #topbar .control span{display:none}
}

/* Phone portrait: compact navigation, thumb-friendly controls and scrollable library. */
@media(max-width:760px){
 #landing.cf-library{flex-direction:column!important;overflow:hidden!important}
 .cf-library-side{display:none!important}
 .cf-library-main{width:100%;height:100%;overflow:auto!important;padding-bottom:env(safe-area-inset-bottom)}
 .cf-library-top{height:58px;flex-basis:58px;position:sticky;top:0;z-index:10;padding:0 14px;gap:9px}
 .cf-mobile-brand{display:flex!important}
 .cf-top-title{display:none!important}
 .cf-library-top input{width:auto;min-width:0;flex:1;height:38px;padding:0 10px;font-size:11px}
 .cf-profile{width:34px;height:34px;flex-basis:34px}
 .cf-library-content{padding:18px 14px 26px;gap:19px}
 .cf-welcome{display:block;padding:22px 19px;border-radius:20px}
 .cf-welcome h1{font-size:28px;letter-spacing:-.9px;line-height:1.08}
 .cf-welcome p{font-size:11px}
 .cf-create{margin-top:17px;width:100%;min-height:46px}
 .cf-section-head h2{font-size:15px}
 .cf-note-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .cf-note-card{border-radius:15px;padding-bottom:12px}
 .cf-thumb{height:92px;margin-bottom:10px}
 .cf-note-card strong{font-size:11px;margin-left:11px;margin-right:11px}
 .cf-note-meta{font-size:9px;margin-left:11px;margin-right:11px}
 .cf-library-foot{font-size:9px}
 #topbar{padding:7px 10px!important;gap:6px!important;min-height:52px!important}
 #topbar .device-switch{display:none!important}
 #topbar .brand{font-size:14px!important;margin-right:0!important}
 #topbar .toolgroup{max-width:100%;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}
 #topbar .toolgroup::-webkit-scrollbar{display:none}
 #topbar .separator{display:none!important}
 #topbar button.tool,#topbar .iconbtn{min-width:40px!important;height:40px!important}
 #topbar .control{min-height:38px;padding:0 5px}
 #topbar .control span{display:none}
 #topbar input[type=range]{width:54px}
 #saveState{font-size:9px!important;padding:6px 7px!important}
 #canvasWrap{background-size:21px 21px!important}
 #aiPanel{max-width:calc(100vw - 16px)!important;border-radius:17px!important}
}

/* Phone landscape and small tablets: protect the drawing area. */
@media(max-width:900px) and (orientation:landscape){
 .cf-library-side{display:none!important}
 .cf-library-main{overflow:auto!important}
 .cf-library-content{padding:13px 18px;gap:14px}
 .cf-welcome{padding:17px 20px}
 .cf-welcome h1{font-size:24px}
 .cf-create{min-height:40px}
 .cf-note-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
 .cf-thumb{height:72px}
 #topbar{flex-wrap:nowrap!important;overflow-x:auto!important;scrollbar-width:none}
 #topbar::-webkit-scrollbar{display:none}
 #topbar .toolgroup{flex-wrap:nowrap!important}
}

/* Reduce motion when the OS asks for it. */
@media(prefers-reduced-motion:reduce){
 *,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}
}
</style>`;

if (!html.includes(marker)) {
  html = html.replace("</head>", css + "\n</head>");
} else {
  const start = html.indexOf(marker);
  const end = html.indexOf("</style>", start);
  if (end !== -1) html = html.slice(0, start) + css + html.slice(end + 8);
}
fs.writeFileSync(file, html, "utf8");
console.log("CanvasFlow Android-first Notein-inspired visual system applied.");
