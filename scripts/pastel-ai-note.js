import fs from "node:fs";
const file="public/index.html";
let s=fs.readFileSync(file,"utf8");
const injected=`
<script id="canvasflow-colorful-ai-renderer">
(function(){
function clean(t){return String(t||"").replace(/\\x60{3}(?:text|markdown|html)?/gi,"").replace(/\\*\\*/g,"").replace(/\\$+/g,"").replace(/\\\\(rightarrow|Rightarrow|leftarrow|Leftarrow)/g,"→").replace(/\\\\(text|mathrm|mathbf)\\{([^}]*)\\}/g,"$2").replace(/^#{1,3}\\s*/gm,"").replace(/^[-*]\\s+/gm,"• ").replace(/\\r/g,"").trim()}
function wrap(ctx,t,w,f){ctx.font=f;const a=String(t).trim().split(/\\s+/).filter(Boolean),o=[];let l="";for(const x of a){const c=l?l+" "+x:x;if(ctx.measureText(c).width>w&&l){o.push(l);l=x}else l=c}if(l)o.push(l);return o.length?o:[""]}
function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function heading(t){return /^(📘|💡|🎯|⚠️|✅|📚|📝|🔑|📌|🧠|[0-9]+[.)]|أولاً|ثانياً|ثالثاً|رابعاً|خامساً|مهم|ملاحظات|أمثلة|مثال|ملخص|الخلاصة|التعريف|القواعد|التطبيقات|الخطوات|مراجعة)/i.test(t)||(t.length<65&&!/[.!؟:]$/.test(t))}
window.addStudyTextToBoard=function(text){
const raw=clean(text),ls=raw.split(/\\n+/).map(x=>x.trim()).filter(Boolean),W=900,p=32,g=14,d=Math.max(1,devicePixelRatio||1);
const cs=[{bg:'#eef7ff',bd:'#cfe5ff',ac:'#3979d8',tx:'#174a91'},{bg:'#eefaf4',bd:'#cceedd',ac:'#2f9a67',tx:'#176b49'},{bg:'#fff5e9',bd:'#ffe0b2',ac:'#e49a20',tx:'#87510a'},{bg:'#f5efff',bd:'#e1d2ff',ac:'#8254d6',tx:'#5b31a8'},{bg:'#fff0f5',bd:'#ffd1df',ac:'#d34d83',tx:'#a82f61'}];
const body='17px Arial,"Noto Sans Arabic",sans-serif',head='700 21px Arial,"Noto Sans Arabic",sans-serif',title='700 28px Arial,"Noto Sans Arabic",sans-serif',small='15px Arial,"Noto Sans Arabic",sans-serif',m=document.createElement('canvas').getContext('2d');
const secs=[];let cur=null;for(const line of ls){if(heading(line)){cur={h:line.replace(/^[-*]\\s+/,''),b:[],c:secs.length%cs.length};secs.push(cur)}else{if(!cur){cur={h:'ملخص الدرس',b:[],c:0};secs.push(cur)}cur.b.push(line)}}
if(!secs.length)secs.push({h:'ملخص الدرس',b:[raw],c:0});
const cards=secs.map(q=>{const z=cs[q.c],rows=[{h:1,l:wrap(m,q.h,W-p*2-58,head)}];q.b.forEach(x=>rows.push({h:0,l:wrap(m,x.replace(/^[-*]\\s+/,'• '),W-p*2-44,body)}));const h=28+rows.reduce((n,r)=>n+r.l.length*(r.h?29:26)+7,0)+18;return{z,rows,h:Math.max(82,h)}});
const HH=92,H=Math.min(6000,Math.max(360,HH+24+cards.reduce((n,x)=>n+x.h+g,0)+28)),c=document.createElement('canvas');c.width=W*d;c.height=H*d;c.style.width=W+'px';c.style.height=H+'px';const x=c.getContext('2d');x.scale(d,d);x.textBaseline='top';x.direction='rtl';x.textAlign='right';
x.fillStyle='#0f1722';x.fillRect(0,0,W,H);x.fillStyle='#182638';rr(x,1,1,W-2,HH,18);x.fill();x.fillStyle='#fff';x.font=title;x.fillText('✦ CanvasFlow — مذكرة شرح الدرس',W-p,20);x.fillStyle='#b8c5d8';x.font=small;x.fillText('ملخص منظم • نقاط مهمة • أمثلة ومراجعة سريعة',W-p,58);
let y=HH+18;cards.forEach(q=>{const X=p,w=W-p*2,r=17;x.fillStyle=q.z.bg;x.strokeStyle=q.z.bd;x.lineWidth=1.4;rr(x,X,y,w,q.h,r);x.fill();x.stroke();x.fillStyle=q.z.ac;rr(x,X+12,y+12,7,q.h-24,4);x.fill();x.beginPath();x.arc(W-p-17,y+23,8,0,Math.PI*2);x.fill();let yy=y+16;q.rows.forEach(row=>{x.font=row.h?head:body;x.fillStyle=row.h?q.z.tx:'#334155';row.l.forEach(t=>{x.fillText(t,W-p-34,yy);yy+=row.h?29:26});yy+=7});y+=q.h+g});
const fy=H-30;x.fillStyle='#eef2ff';rr(x,p,fy,W-p*2,20,7);x.fill();x.fillStyle='#5b63ff';x.font='700 14px Arial,"Noto Sans Arabic",sans-serif';x.textAlign='center';x.fillText('الممارسة المستمرة هي مفتاح الإتقان',W/2,fy+2);
const src=c.toDataURL('image/png'),left=Math.max(90,canvas.getCenter().left-W/2),top=Math.max(80,canvas.getCenter().top-Math.min(350,H/2));fabric.Image.fromURL(src,img=>{img.set({left,top,objectRole:'studyNote',selectable:true,evented:true,cornerStyle:'circle',transparentCorners:false});canvas.add(img);canvas.setActiveObject(img);canvas.requestRenderAll();if(typeof scheduleSave==='function')scheduleSave(true);if(typeof aiPanel!=='undefined')aiPanel.classList.remove('open');if(typeof aiToggle!=='undefined'&&aiToggle)aiToggle.classList.remove('active');},{crossOrigin:'anonymous'});
};})();
</script>`;
if(!s.includes('id="canvasflow-colorful-ai-renderer"'))s=s.replace('</body>',injected+'\n</body>');
fs.writeFileSync(file,s,'utf8');
console.log('CanvasFlow colorful AI renderer installed.');
