
import fs from "node:fs";
import path from "node:path";

const file = path.resolve("public/index.html");
let html = fs.readFileSync(file, "utf8");
const marker = '<style id="canvasflow-handwriting-improve-css">';

if (html.includes(marker)) {
  console.log("Handwriting Improve feature already injected.");
  process.exit(0);
}

const styles = `
<style id="canvasflow-handwriting-improve-css">
.cf-handwriting-trigger{font-size:17px!important;min-width:34px}
#cfHandwritingModal{display:none;position:fixed;inset:0;z-index:2147483000;background:rgba(22,22,38,.48);align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:inherit}
#cfHandwritingModal.open{display:flex}
.cfh-card{width:min(790px,100%);max-height:94dvh;overflow:auto;background:#fff;color:#28283c;border:1px solid #e7e7f0;border-radius:20px;box-shadow:0 24px 80px rgba(15,15,35,.28);padding:20px;box-sizing:border-box}
.cfh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:7px}
.cfh-head h2{font-size:20px;margin:0;font-weight:800}
.cfh-head p{font-size:12px;line-height:1.6;color:#73758a;margin:6px 0 0}
.cfh-close{border:0;background:#f2f2f8;border-radius:10px;width:38px;height:38px;font-size:22px;cursor:pointer;flex:none}
.cfh-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:15px 0 10px}
.cfh-controls label{font-size:12px;font-weight:700;display:flex;align-items:center;gap:7px}
.cfh-controls select{border:1px solid #dedfeb;border-radius:9px;padding:9px;background:#fff;color:#303047;font:inherit}
.cfh-btn{border:1px solid #dedfeb;border-radius:10px;padding:9px 13px;background:#fff;color:#303047;font-size:12px;font-weight:700;cursor:pointer}
.cfh-btn.primary{background:#635bdb;color:white;border-color:#635bdb}
.cfh-btn:disabled{opacity:.55;cursor:wait}
#cfhCanvas{display:block;width:100%;height:255px;box-sizing:border-box;background:#fff;border:1px solid #dfe1ed;border-radius:13px;touch-action:none;cursor:crosshair}
.cfh-hint{font-size:11px;color:#818397;margin:8px 2px 12px;line-height:1.5}
#cfhStatus{font-size:12px;color:#686a80;min-height:20px;margin:8px 0}
#cfhResult{display:block;width:100%;box-sizing:border-box;min-height:84px;resize:vertical;border:1px solid #dfe1ed;border-radius:11px;padding:11px;font:16px/1.7 Arial,sans-serif;color:#28283c;background:#fff}
.cfh-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px}
@media(max-width:760px){#cfHandwritingModal{padding:0;align-items:flex-end}.cfh-card{width:100%;max-height:96dvh;border-radius:20px 20px 0 0;padding:16px 13px calc(16px + env(safe-area-inset-bottom));}.cfh-head h2{font-size:18px}#cfhCanvas{height:220px}.cfh-actions .cfh-btn{flex:1;min-width:100px}.cfh-controls{gap:6px}.cfh-controls select{max-width:150px}}
</style>`;

const modal = `
<div id="cfHandwritingModal" aria-hidden="true">
  <section class="cfh-card" role="dialog" aria-modal="true" aria-labelledby="cfhTitle">
    <div class="cfh-head">
      <div><h2 id="cfhTitle">✍ تحسين الخط</h2><p>اكتب بالقلم أو بإصبعك، حوّل الكتابة لنص، وبعدها أضِفه للوحة.</p></div>
      <button type="button" class="cfh-close" id="cfhClose" aria-label="إغلاق">×</button>
    </div>
    <div class="cfh-controls">
      <label for="cfhLanguage">لغة الكتابة
        <select id="cfhLanguage"><option value="auto">تلقائي / عربي وإنجليزي</option><option value="ar">العربية</option><option value="en">English</option></select>
      </label>
      <button type="button" class="cfh-btn" id="cfhUndo">↶ تراجع عن آخر خط</button>
      <button type="button" class="cfh-btn" id="cfhClear">مسح الكل</button>
    </div>
    <canvas id="cfhCanvas" width="1400" height="500" aria-label="مساحة كتابة بخط اليد"></canvas>
    <div class="cfh-hint">اكتب الكلمات بوضوح وعلى سطر واحد أو أكتر. التحويل بيعتمد على خدمة الـAI المتصلة بالتطبيق، وممكن يحتاج تصحيح بسيط بعد التحويل.</div>
    <div id="cfhStatus" role="status" aria-live="polite">اكتب في المساحة بالأعلى، وبعدها اضغط «تحويل لنص».</div>
    <label for="cfhResult" style="display:block;font-size:12px;font-weight:800;margin:8px 0">النص بعد التحويل (تقدر تعدّله)</label>
    <textarea id="cfhResult" dir="auto" placeholder="النص المحوّل هيظهر هنا..."></textarea>
    <div class="cfh-actions">
      <button type="button" class="cfh-btn" id="cfhCancel">إلغاء</button>
      <button type="button" class="cfh-btn primary" id="cfhConvert">✨ تحويل لنص</button>
      <button type="button" class="cfh-btn primary" id="cfhInsert">إضافة للوحة</button>
    </div>
  </section>
</div>`;

const logic = `
<script id="canvasflow-handwriting-improve">
(function(){
  const modal=document.getElementById('cfHandwritingModal');
  const pad=document.getElementById('cfhCanvas');
  if(!modal||!pad)return;
  const ctx=pad.getContext('2d');
  const status=document.getElementById('cfhStatus');
  const result=document.getElementById('cfhResult');
  const convertBtn=document.getElementById('cfhConvert');
  let strokes=[];
  let activeStroke=null;
  let drawing=false;

  function repaint(){
    ctx.clearRect(0,0,pad.width,pad.height);
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,pad.width,pad.height);
    ctx.strokeStyle='#202033';ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';
    strokes.forEach(function(stroke){
      if(!stroke.length)return;
      ctx.beginPath();ctx.moveTo(stroke[0].x,stroke[0].y);
      for(let i=1;i<stroke.length;i++)ctx.lineTo(stroke[i].x,stroke[i].y);
      if(stroke.length===1)ctx.lineTo(stroke[0].x+.1,stroke[0].y+.1);
      ctx.stroke();
    });
  }
  function point(e){
    const r=pad.getBoundingClientRect();
    return {x:(e.clientX-r.left)*pad.width/r.width,y:(e.clientY-r.top)*pad.height/r.height};
  }
  pad.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    e.preventDefault();drawing=true;activeStroke=[];strokes.push(activeStroke);
    activeStroke.push(point(e));pad.setPointerCapture?.(e.pointerId);repaint();
  });
  pad.addEventListener('pointermove',function(e){
    if(!drawing||!activeStroke)return;
    e.preventDefault();activeStroke.push(point(e));repaint();
  });
  function endStroke(){drawing=false;activeStroke=null;}
  pad.addEventListener('pointerup',endStroke);
  pad.addEventListener('pointercancel',endStroke);
  document.getElementById('cfhClear').addEventListener('click',function(){strokes=[];result.value='';repaint();status.textContent='المساحة اتمسحت. اكتب من جديد.';});
  document.getElementById('cfhUndo').addEventListener('click',function(){strokes.pop();repaint();status.textContent='تم التراجع عن آخر خط.';});
  function open(){
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
    strokes=[];result.value='';repaint();status.textContent='اكتب في المساحة بالأعلى، وبعدها اضغط «تحويل لنص».';
  }
  function close(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
  document.getElementById('cfHandwritingOpen')?.addEventListener('click',open);
  document.getElementById('cfHandwritingOpenMobile')?.addEventListener('click',open);
  document.getElementById('cfhClose').addEventListener('click',close);
  document.getElementById('cfhCancel').addEventListener('click',close);
  modal.addEventListener('click',function(e){if(e.target===modal)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))close();});

  convertBtn.addEventListener('click',async function(){
    if(!strokes.some(function(s){return s.length>0;})){status.textContent='اكتب كلمة أو جملة الأول.';return;}
    const endpoint=(document.getElementById('aiEndpoint')?.value||'').trim()||'/api/study';
    const lang=document.getElementById('cfhLanguage').value;
    const langText=lang==='ar'?'The handwriting is Arabic. Transcribe in Arabic script.':lang==='en'?'The handwriting is English. Transcribe in English.':'The handwriting may be Arabic, English, or a mix of both. Detect the script and preserve the original language.';
    convertBtn.disabled=true;status.textContent='جاري قراءة الخط وتحويله لنص...';
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        mode:'transcribe',
        lesson:'TASK: Transcribe the handwritten ink in the attached image exactly. '+langText+' Preserve original words, spelling, punctuation and line breaks as much as possible. Do not summarize, translate, explain, or add commentary. Return only the transcription.',
        images:[pad.toDataURL('image/png')]
      })});
      const data=await response.json().catch(function(){return {};});
      if(!response.ok)throw new Error(data.error||('HTTP '+response.status));
      const text=String(data.output_text||data.text||data.response||'').trim();
      if(!text)throw new Error('الـAI مرجعش نص. جرّب تكتب بشكل أوضح.');
      result.value=text;status.textContent='تم التحويل ✓ راجع النص وعدّله لو محتاج.';
    }catch(err){
      status.textContent='مش قادر أحوّل الخط دلوقتي: '+(err.message||'راجع اتصال الـAI وإعدادات الـEndpoint.');
    }finally{convertBtn.disabled=false;}
  });

  document.getElementById('cfhInsert').addEventListener('click',function(){
    const value=result.value.trim();
    if(!value){status.textContent='حوّل الخط أو اكتب النص في المربع الأول.';return;}
    if(typeof canvas==='undefined'||!window.fabric){status.textContent='اللوحة مش جاهزة دلوقتي.';return;}
    const isArabic=/[\u0600-\u06FF]/.test(value)||document.getElementById('cfhLanguage').value==='ar';
    const center=canvas.getVpCenter?canvas.getVpCenter():canvas.getCenter();
    const box=new fabric.Textbox(value,{
      left:Math.max(0,center.left-260),top:Math.max(0,center.top-70),width:520,
      fontSize:Number(document.getElementById('mobileFontSize')?.value||24),
      fontFamily:'Arial, Inter, sans-serif',fill:document.getElementById('color')?.value||'#202033',
      textAlign:isArabic?'right':'left',direction:isArabic?'rtl':'ltr',splitByGrapheme:false,
      objectRole:'text'
    });
    canvas.add(box);canvas.setActiveObject(box);canvas.requestRenderAll();
    if(typeof scheduleHistorySnapshot==='function')scheduleHistorySnapshot();
    if(typeof scheduleSave==='function')scheduleSave(true);
    close();
  });
  repaint();
})();
</script>`;

if (!html.includes('data-tool="text"')) throw new Error('Could not find desktop text tool insertion point.');
if (!html.includes('id="mobileV2AI"')) throw new Error('Could not find mobile toolbar insertion point.');
html = html.replace('</head>', styles + '\n</head>');
html = html.replace('<button class="tool" data-tool="text" title="Text (T)">T</button>',
  '<button class="tool" data-tool="text" title="Text (T)">T</button>\n        <button class="tool cf-handwriting-trigger" id="cfHandwritingOpen" title="تحسين الخط — تحويل الكتابة اليدوية لنص" aria-label="تحسين الخط">✍</button>');
html = html.replace('<button type="button" id="mobileV2AI"><span class="v2icon">✦</span><span>AI</span></button>',
  '<button type="button" id="mobileV2AI"><span class="v2icon">✦</span><span>AI</span></button>\n    <button type="button" id="cfHandwritingOpenMobile" aria-label="تحسين الخط"><span class="v2icon">✍</span><span>تحسين الخط</span></button>');
html = html.replace('</body>', modal + '\n' + logic + '\n</body>');
fs.writeFileSync(file, html, 'utf8');
console.log('Injected CanvasFlow Handwriting Improve (Arabic/English) UI.');
