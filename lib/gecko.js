import { geckoParams } from "@/lib/params/gecko_move";
export function drawGecko(ctx, state, timeMs) {
  const n = state.segments.length;
  if (n < 2) return;
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2.0;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(state.segments[0].x, state.segments[0].y);
  for (let i = 1; i < n; i++) {
    const p = state.segments[i];
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  const head = state.segments[0];
  const neck = state.segments[1];
  const dx = head.x - neck.x;
  const dy = head.y - neck.y;
  const d = Math.hypot(dx, dy) || 1;
  const tx = dx / d;
  const ty = dy / d;
  const nx = -ty;
  const ny = tx;
  const arrowLen = 20;
  const arrowWidth = 14;
  const leftX = head.x - tx * arrowLen + nx * (arrowWidth * 0.5);
  const leftY = head.y - ty * arrowLen + ny * (arrowWidth * 0.5);
  const rightX = head.x - tx * arrowLen - nx * (arrowWidth * 0.5);
  const rightY = head.y - ty * arrowLen - ny * (arrowWidth * 0.5);
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(leftX, leftY);
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(rightX, rightY);
  ctx.stroke();
}


