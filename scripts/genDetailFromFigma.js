/* 
  Generate simplified HTML from a Figma file's 'Detail' page (or frame).
  Requirements:
    - env FIGMA_ACCESS_TOKEN=figd_xxx
    - env FIGMA_FILE_KEY=AbC123...
  Usage:
    node scripts/genDetailFromFigma.js
  Output:
    public/detail/figma_detail.html
*/

const fs = require("fs");
const path = require("path");

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN || "";
const FILE_KEY = process.env.FIGMA_FILE_KEY || "QmNZFholTWPSUBHkFwXlcM";
const TARGET_NAME = process.env.FIGMA_PAGE_NAME || "Detail";

if (!FIGMA_TOKEN) {
  console.error("[genDetailFromFigma] FIGMA_ACCESS_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "X-Figma-Token": FIGMA_TOKEN,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error: ${res.status} ${res.statusText}\n${text}`);
  }
  return await res.json();
}

function findPageOrFrameByName(node, name) {
  if (!node) return null;
  if ((node.type === "CANVAS" || node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") && node.name === name) {
    return node;
  }
  const children = node.children || [];
  for (const child of children) {
    const found = findPageOrFrameByName(child, name);
    if (found) return found;
  }
  return null;
}

function cssColorFromPaint(paint) {
  if (!paint || paint.type !== "SOLID" || !paint.color) return null;
  const { r, g, b } = paint.color;
  const alpha = paint.opacity != null ? paint.opacity : 1;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function nodeToHtml(node, pageBounds) {
  const ab = node.absoluteBoundingBox || {};
  const { x = 0, y = 0, width = 0, height = 0 } = ab;
  const left = Math.round(x - pageBounds.x);
  const top = Math.round(y - pageBounds.y);
  const w = Math.max(0, Math.round(width));
  const h = Math.max(0, Math.round(height));

  const baseStyle = [`position:absolute`, `left:${left}px`, `top:${top}px`, `width:${w}px`, `height:${h}px`];

  if (node.type === "TEXT") {
    const fills = node.fills || [];
    let color = "#111827";
    if (fills.length > 0) {
      const c = cssColorFromPaint(fills.find((f) => f.type === "SOLID"));
      if (c) color = c;
    }
    const fontSize = node.style && node.style.fontSize ? node.style.fontSize : 14;
    const fontFamily = node.style && node.style.fontFamily ? node.style.fontFamily : "system-ui, Arial, sans-serif";
    const lineHeightPx = node.style && node.style.lineHeightPx ? node.style.lineHeightPx : Math.round(fontSize * 1.4);
    const fontWeight = node.style && node.style.fontWeight ? node.style.fontWeight : 400;
    const textAlign = node.style && node.style.textAlignHorizontal ? node.style.textAlignHorizontal.toLowerCase() : "left";
    const content = escapeHtml(node.characters || "");
    return `<div style="${baseStyle.join(";")};color:${color};font-size:${fontSize}px;font-family:${escapeHtml(fontFamily)};line-height:${lineHeightPx}px;font-weight:${fontWeight};text-align:${textAlign};white-space:pre-wrap;">${content}</div>`;
  }

  // Rectangles/Frames/etc => simple boxes with background/border
  let bg = null;
  let border = null;
  if (node.fills && node.fills.length > 0) {
    const solid = node.fills.find((f) => f.type === "SOLID");
    if (solid) bg = cssColorFromPaint(solid);
  }
  if (node.strokes && node.strokes.length > 0 && node.strokeWeight != null) {
    const solidS = node.strokes.find((s) => s.type === "SOLID");
    if (solidS) border = `${node.strokeWeight}px solid ${cssColorFromPaint(solidS) || "rgba(0,0,0,0.2)"}`;
  }
  const styleExtra = [
    bg ? `background:${bg}` : null,
    border ? `border:${border}` : null,
    `box-sizing:border-box`,
  ].filter(Boolean);

  const children = node.children || [];
  const inner = children.map((c) => nodeToHtml(c, pageBounds)).join("");
  return `<div style="${baseStyle.concat(styleExtra).join(";")}">${inner}</div>`;
}

async function main() {
  console.log("[genDetailFromFigma] Fetching file:", FILE_KEY);
  const file = await fetchJson(`https://api.figma.com/v1/files/${FILE_KEY}`);
  const root = file.document;

  // 1) 우선 페이지 이름으로 검색, 없으면 프레임 이름으로 검색
  let target = null;
  const pages = (root.children || []).filter((n) => n.type === "CANVAS");
  target = pages.find((p) => p.name === TARGET_NAME) || findPageOrFrameByName(root, TARGET_NAME);
  if (!target) {
    throw new Error(`Target '${TARGET_NAME}' not found in file.`);
  }

  // 페이지 전체 bounding box 근사: 가장 바깥 children의 union
  const allBoxes = [];
  (target.children || []).forEach((n) => {
    if (n.absoluteBoundingBox) allBoxes.push(n.absoluteBoundingBox);
  });
  const pageBounds = allBoxes.length
    ? {
        x: Math.min(...allBoxes.map((b) => b.x || 0)),
        y: Math.min(...allBoxes.map((b) => b.y || 0)),
        width: Math.max(...allBoxes.map((b) => (b.x || 0) + (b.width || 0))),
        height: Math.max(...allBoxes.map((b) => (b.y || 0) + (b.height || 0))),
      }
    : { x: 0, y: 0, width: 1200, height: 800 };
  pageBounds.width -= pageBounds.x;
  pageBounds.height -= pageBounds.y;

  const contentHtml = (target.children || []).map((n) => nodeToHtml(n, pageBounds)).join("");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Figma Detail Export</title>
  <style>
    html, body { margin:0; padding:0; }
    .stage { position:relative; width:${Math.round(pageBounds.width)}px; height:${Math.round(pageBounds.height)}px; margin: 0 auto; background:#ffffff; }
  </style>
</head>
<body>
  <div class="stage">
    ${contentHtml}
  </div>
</body>
</html>`;

  const outDir = path.join(process.cwd(), "public", "detail");
  const outFile = path.join(outDir, "figma_detail.html");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, html, "utf-8");
  console.log("[genDetailFromFigma] Wrote:", path.relative(process.cwd(), outFile));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


