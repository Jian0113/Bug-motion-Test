// Web-ART: Bug behaviors system (cyberpunk glitch aesthetics)
// Each behavior returns a cleanup function.
// Behaviors act within a provided root element to avoid global DOM pollution.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rr = (a, b) => a + Math.random() * (b - a);

export const BUGS = [
  { id: "bug-alpha",  name: "Alpha Ghost",       behaviors: ["typography", "glitch"], color: "#6ee7ff" },
  { id: "bug-beta",   name: "Beta Fork",         behaviors: ["duplicate", "reposition"], color: "#f472b6" },
  { id: "bug-gamma",  name: "Gamma Noise",       behaviors: ["bgCode"], color: "#60a5fa" },
  { id: "bug-delta",  name: "Delta Drift",       behaviors: ["reposition", "glitch"], color: "#f59e0b" },
  { id: "bug-epsilon",name: "Epsilon Echo",      behaviors: ["duplicate", "typography"], color: "#34d399" },
  { id: "bug-zeta",   name: "Zeta Fracture",     behaviors: ["glitch", "bgCode"], color: "#a78bfa" },
  { id: "bug-eta",    name: "Eta Scatter",       behaviors: ["reposition"], color: "#fb7185" },
  { id: "bug-theta",  name: "Theta Warp",        behaviors: ["typography", "bgCode"], color: "#67e8f9" },
  { id: "bug-iota",   name: "Iota Splitter",     behaviors: ["duplicate", "glitch"], color: "#fca5a5" },
  { id: "bug-kappa",  name: "Kappa Phase",       behaviors: ["glitch"], color: "#c084fc" },
  { id: "bug-lambda", name: "Lambda Jitter",     behaviors: ["typography"], color: "#fbbf24" },
  { id: "bug-mu",     name: "Mu Divergence",     behaviors: ["reposition", "bgCode"], color: "#22d3ee" },
];

// Utilities to find nodes within root
function qsa(root, selector) {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

// Split text nodes into spans to allow letter-level distortion (non-destructive)
function wrapLetters(node, className = "g-letter") {
  if (!node) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeValue && n.nodeValue.trim().length > 0) textNodes.push(n);
  }
  for (const t of textNodes) {
    const parent = t.parentNode;
    if (!parent) continue;
    const frag = document.createDocumentFragment();
    const str = t.nodeValue;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const span = document.createElement("span");
      span.className = className;
      span.textContent = ch;
      frag.appendChild(span);
    }
    parent.replaceChild(frag, t);
  }
}

// Behavior: Typography Distortion (letter jitter, skew, weight flicker)
function behaviorTypography({ root, intensity = 1 }) {
  const scope = root || document.body;
  wrapLetters(scope, "g-letter");
  let rafId = 0;
  const tick = () => {
    const letters = qsa(scope, ".g-letter");
    const t = performance.now() * 0.002;
    const amp = clamp(intensity, 0.2, 5);
    for (let i = 0; i < letters.length; i += Math.floor(1 + 2 / amp)) {
      const el = letters[i];
      const dx = Math.sin((t + i) * 0.9) * amp;
      const dy = Math.cos((t + i) * 0.7) * amp * 0.6;
      const skew = Math.sin((t + i) * 1.4) * amp * 0.4;
      el.style.display = "inline-block";
      el.style.transform = `translate(${dx}px, ${dy}px) skew(${skew}deg)`;
      el.style.willChange = "transform";
      if ((i + Math.floor(t)) % 25 === 0) {
        el.style.color = `hsl(${(t * 40 + i) % 360}deg 90% 70%)`;
      }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

// Behavior: Glitch Filter (contrast/saturate/hue + scanline jitter)
function behaviorGlitch({ root, intensity = 1 }) {
  const scope = root || document.body;
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.mixBlendMode = "screen";
  overlay.style.zIndex = "5";
  scope.appendChild(overlay);

  let rafId = 0;
  const tick = () => {
    const t = performance.now() * 0.001;
    const level = clamp(intensity, 0.2, 5);
    const tx = Math.sin(t * 15) * level * 2;
    const ty = Math.cos(t * 11) * level * 2;
    overlay.style.transform = `translate(${tx}px, ${ty}px)`;
    overlay.style.filter = `contrast(${1 + level * 0.6}) saturate(${1 + level * 0.8}) hue-rotate(${(t * 90) % 360}deg)`;
    overlay.style.background =
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, rgba(0,0,0,0) 2px 4px)," +
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0) 1px 2px)";
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    overlay.remove();
  };
}

// Behavior: Random Repositioning (float child elements)
function behaviorRandomReposition({ root, intensity = 1 }) {
  const scope = root || document.body;
  const targets = qsa(scope, "[data-reposition]"); // opt-in selectors
  targets.forEach((el) => {
    el.style.position = "relative";
  });
  let rafId = 0;
  const bases = targets.map(() => ({ x: rr(-2, 2), y: rr(-2, 2), s: rr(0.5, 1.4) }));
  const tick = () => {
    const t = performance.now() * 0.001;
    const amp = clamp(intensity, 0.2, 5);
    targets.forEach((el, i) => {
      const b = bases[i];
      const dx = Math.sin(t * (0.8 + b.s)) * (3 + amp * 2) + b.x;
      const dy = Math.cos(t * (1.1 + b.s)) * (2 + amp * 1.5) + b.y;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.willChange = "transform";
    });
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

// Behavior: Text Duplication (ghost echoes)
function behaviorTextDuplication({ root, intensity = 1 }) {
  const scope = root || document.body;
  const hosts = qsa(scope, "[data-duplicate]");
  const clones = [];
  hosts.forEach((el) => {
    const ghost = el.cloneNode(true);
    ghost.style.position = "absolute";
    ghost.style.left = "0";
    ghost.style.top = "0";
    ghost.style.pointerEvents = "none";
    ghost.style.opacity = "0.12";
    ghost.style.filter = "blur(0.5px)";
    ghost.style.mixBlendMode = "screen";
    el.style.position = "relative";
    el.appendChild(ghost);
    clones.push({ el, ghost });
  });
  let rafId = 0;
  const tick = () => {
    const t = performance.now() * 0.002;
    const amp = clamp(intensity, 0.2, 5);
    clones.forEach(({ ghost }, i) => {
      const dx = Math.sin(t * (1.1 + i * 0.07)) * amp * 2;
      const dy = Math.cos(t * (0.9 + i * 0.09)) * amp * 2;
      ghost.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(rafId);
    clones.forEach(({ ghost }) => ghost.remove());
  };
}

// Behavior: Background Code Distortion (random glyph mutations)
function behaviorBackgroundCode({ root, intensity = 1 }) {
  const scope = root || document.body;
  const lines = qsa(scope, ".bg-code-line");
  const sources = lines.map((l) => l.textContent || "");
  const charset = "{}[]()<>;:=+-*/_#$%!&|^~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let rafId = 0;
  const tick = () => {
    const level = clamp(intensity, 0.2, 5);
    for (let i = 0; i < lines.length; i++) {
      if (Math.random() > 0.2) continue;
      const src = sources[i];
      if (!src) continue;
      const arr = src.split("");
      const mutateCount = Math.max(1, Math.floor((src.length * 0.02) * level));
      for (let k = 0; k < mutateCount; k++) {
        const idx = Math.floor(Math.random() * arr.length);
        arr[idx] = charset[Math.floor(Math.random() * charset.length)];
      }
      lines[i].textContent = arr.join("");
      lines[i].style.color = `hsl(${(performance.now() * 0.02 + i * 11) % 360} 90% ${50 + Math.sin(i) * 10}%)`;
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

export const BEHAVIOR_IMPL = {
  typography: behaviorTypography,
  glitch: behaviorGlitch,
  reposition: behaviorRandomReposition,
  duplicate: behaviorTextDuplication,
  bgCode: behaviorBackgroundCode,
};

export function startBehaviorsForBugs({ bugIds = [], root, intensity = 1 }) {
  const cleanups = [];
  for (const id of bugIds) {
    const bug = BUGS.find((b) => b.id === id);
    if (!bug) continue;
    for (const b of bug.behaviors) {
      const fn = BEHAVIOR_IMPL[b];
      if (typeof fn === "function") {
        cleanups.push(fn({ root, intensity }));
      }
    }
  }
  return () => cleanups.forEach((c) => c && c());
}


