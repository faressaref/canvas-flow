import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

const injected = `<script id="canvasflow-image-persistence-fix">(function(){
  const isHttp=u=>typeof u==="string"&&/^https?:\\/\\//i.test(u);
  window.canvasflowPrepareFirestorePages=async function(pages){
    if(!Array.isArray(pages))return pages;
    for(const p of pages){
      if(!p||!Array.isArray(p.objects))continue;
      for(const o of p.objects){
        if(o&&isHttp(o.srcUrl))o.src=o.srcUrl;
      }
    }
    return pages;
  };
  console.log("CanvasFlow: fast image persistence fix installed");
})();</script>`;
const marker='<script id="canvasflow-image-persistence-fix">';
const start=s.indexOf(marker);
if(start>=0){const end=s.indexOf("</script>",start);if(end>=0)s=s.slice(0,start)+injected+s.slice(end+9)}else{s=s.replace("</body>",injected+"\n</body>")}
fs.writeFileSync(file,s,"utf8");
console.log("CanvasFlow: stable image persistence helper installed.");
