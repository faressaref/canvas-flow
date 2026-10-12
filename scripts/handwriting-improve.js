import fs from "node:fs";
import path from "node:path";

const file = path.resolve("public/index.html");
let html = fs.readFileSync(file, "utf8");
const tag = '<script src="/handwriting-auto.js"></script>';

if (!html.includes(tag)) {
  html = html.replace("</body>", tag + "\n</body>");
  fs.writeFileSync(file, html, "utf8");
}
console.log("Automatic handwriting-to-text runtime is included.");
