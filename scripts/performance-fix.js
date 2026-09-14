import fs from "node:fs";

const file = "public/index.html";
let s = fs.readFileSync(file, "utf8");

// 1) Keep heavy export-only libraries from blocking initial HTML parsing.
s = s.replace(
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>',
  '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
);
s = s.replace(
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>',
  '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>'
);

// 2) Fix Fabric image restore sizing. When an image source was compressed before
// saving, its intrinsic dimensions can differ from the old Fabric dimensions.
// Restore the exact saved visual bounding box so the image and resize frame match.
const imageFix = `<script id="canvasflow-image-restore-fix">(function(){if(!window.fabric||!fabric.Image||fabric.Image.__canvasflowRestoreFix)return;const original=fabric.Image.fromObject;fabric.Image.fromObject=function(object,callback,extraParam){const targetW=Math.abs((Number(object&&object.width)||0)*(Number(object&&object.scaleX)||1));const targetH=Math.abs((Number(object&&object.height)||0)*(Number(object&&object.scaleY)||1));return original.call(this,object,function(img){if(img&&targetW>0&&targetH>0&&img.width>0&&img.height>0){img.set({scaleX:targetW/img.width,scaleY:targetH/img.height});img.setCoords()}if(typeof callback==='function')callback(img)},extraParam)};fabric.Image.__canvasflowRestoreFix=true})();</script>`;
if (!s.includes('id="canvasflow-image-restore-fix"')) {
  s = s.replace("</head>", imageFix + "\n</head>");
}

// 3) Cap the AI note's backing canvas DPR. The displayed CSS size is unchanged,
// but on 2x/3x displays this avoids unnecessarily huge PNGs and render work.
s = s.replace(
  "d=Math.max(1,devicePixelRatio||1)",
  "d=Math.min(1.5,Math.max(1,devicePixelRatio||1))"
);

// 4) Give the browser a connection head start for the CDN libraries.
if (!s.includes("dns-prefetch")) {
  s = s.replace(
    "<title>CanvasFlow — Whiteboard</title>",
    "<title>CanvasFlow — Whiteboard</title>\n  <link rel=\"dns-prefetch\" href=\"//cdnjs.cloudflare.com\">\n  <link rel=\"preconnect\" href=\"https://cdnjs.cloudflare.com\" crossorigin>\n  <link rel=\"dns-prefetch\" href=\"//www.gstatic.com\">\n  <link rel=\"preconnect\" href=\"https://www.gstatic.com\" crossorigin>"
  );
}

fs.writeFileSync(file, s, "utf8");
console.log("CanvasFlow: performance and image-restore optimizations installed.");
