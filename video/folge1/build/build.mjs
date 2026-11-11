// Generates index.html + compositions/*.html for "ZWEI HERZEN – Folge 1: Der Juwelier".
// Run: node build/build.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { char, EXPRS } from "./chars.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(ROOT, "compositions"), { recursive: true });

const W = 1080, H = 1920;

// ---------- timeline code helper ----------
class TL {
  constructor() { this.lines = []; this.state = {}; }
  add(s) { this.lines.push(s); return this; }
  // switch a character's expression at time t
  face(p, to, t) {
    const from = this.state[p] ?? "normal";
    if (from === to) return this;
    this.add(`tl.fromTo("#${p}-x-${from}",{opacity:1},{opacity:0,duration:0.14,ease:"none"},${t});`);
    this.add(`tl.fromTo("#${p}-x-${to}",{opacity:0},{opacity:1,duration:0.14,ease:"none"},${t});`);
    this.state[p] = to;
    return this;
  }
  init(p, e) { this.state[p] = e; return this; }
  blink(p, t) {
    this.add(`tl.fromTo("#${p}-eyes",{scaleY:1},{scaleY:0.1,duration:0.07,transformOrigin:"50% 50%",ease:"none"},${t});`);
    this.add(`tl.fromTo("#${p}-eyes",{scaleY:0.1},{scaleY:1,duration:0.08,transformOrigin:"50% 50%",ease:"none",immediateRender:false},${(t + 0.07).toFixed(2)});`);
    return this;
  }
  // gentle idle breathing on a wrapper (finite)
  breathe(sel, dur, amp = 6, period = 1.6, offset = 0) {
    for (let t = offset; t < dur - 0.05; t += period) {
      const half = Math.min(period / 2, (dur - t) / 2);
      this.add(`tl.fromTo("${sel}",{y:0},{y:${-amp},duration:${half.toFixed(2)},ease:"sine.inOut",immediateRender:${t === offset}},${t.toFixed(2)});`);
      this.add(`tl.fromTo("${sel}",{y:${-amp}},{y:0,duration:${half.toFixed(2)},ease:"sine.inOut",immediateRender:false},${(t + half).toFixed(2)});`);
    }
    return this;
  }
  push(sel, dur, to = 1.06, from = 1) {
    this.add(`tl.fromTo("${sel}",{scale:${from}},{scale:${to},duration:${dur},ease:"none",transformOrigin:"50% 45%"},0);`);
    return this;
  }
  code() {
    // every later tween on the same target must not immediate-render its from-values
    const seen = new Set();
    return this.lines.map((l) => {
      const m = l.match(/^tl\.fromTo\("([^"]+)"/);
      if (!m) return l;
      if (seen.has(m[1])) {
        if (/immediateRender:/.test(l)) l = l.replace(/immediateRender:(true|false)/, "immediateRender:false");
        else l = l.replace(/\},([0-9.]+)\);$/, ",immediateRender:false},$1);");
      }
      seen.add(m[1]);
      return l;
    }).join("\n    ");
  }
}

function sceneFile(id, dur, css, markup, tl) {
  return `<template>
  <style>
    #root { position:absolute; inset:0; overflow:hidden; background:#111; font-family:Inter, sans-serif; }
    #root .abs { position:absolute; }
    #${id}-cam { position:absolute; inset:0; }
    ${css}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}" data-layout-allow-overflow data-layout-allow-overlap>
    <div id="${id}-cam">
${markup}
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${tl.code()}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

const person = (p, who, expr, style, opts) =>
  `<div id="${p}" class="abs" style="${style}">${char(p, who, expr, opts)}</div>`;

// ---------- backgrounds ----------
const bgCafe = (id) => `<svg class="abs" style="inset:0" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="${id}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2dcc0"/><stop offset="1" stop-color="#d9b48b"/></linearGradient>
  <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6f0"/><stop offset="1" stop-color="#e8f4fa"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-wall)"/>
  <rect x="70" y="230" width="940" height="1000" rx="14" fill="url(#${id}-sky)"/>
  <g fill="#c9b8a4"><rect x="90" y="620" width="230" height="610"/><rect x="340" y="520" width="260" height="710" fill="#d8c7b0"/><rect x="620" y="680" width="380" height="550" fill="#bfae98"/></g>
  <g fill="#9fc2d8" opacity=".8">${Array.from({ length: 18 }, (_, i) => `<rect x="${110 + (i % 6) * 150}" y="${700 + Math.floor(i / 6) * 150}" width="56" height="80" rx="4"/>`).join("")}</g>
  <g stroke="#6b4a33" stroke-width="22" fill="none"><rect x="70" y="230" width="940" height="1000" rx="14"/><path d="M540,230 V1230 M70,700 H1010"/></g>
  <g fill="#7aa35a"><circle cx="160" cy="1190" r="70"/><circle cx="230" cy="1160" r="60"/><rect x="150" y="1190" width="100" height="70" fill="#a0603a"/></g>
</svg>`;

const bgStreet = (id, dusk = false) => `<svg class="abs" style="left:0;top:0;width:${W * 2}px;height:${H}px" id="${id}-street" viewBox="0 0 ${W * 2} ${H}">
  <defs><linearGradient id="${id}-sk" x1="0" y1="0" x2="0" y2="1">${dusk
    ? `<stop offset="0" stop-color="#3b2a5c"/><stop offset=".55" stop-color="#d9708a"/><stop offset="1" stop-color="#f6b26b"/>`
    : `<stop offset="0" stop-color="#8ec9f0"/><stop offset="1" stop-color="#dff1fb"/>`}</linearGradient></defs>
  <rect width="${W * 2}" height="${H}" fill="url(#${id}-sk)"/>
  ${Array.from({ length: 8 }, (_, i) => {
    const x = i * 270, h = 900 + ((i * 137) % 300), y = 1500 - h;
    const cols = dusk ? ["#5b4a6e", "#6d5a7e", "#4f4060"] : ["#e8d8c0", "#f1e6d2", "#d9c4a3"];
    const win = dusk ? "#ffd27a" : "#9fc2d8";
    return `<rect x="${x}" y="${y}" width="270" height="${h}" fill="${cols[i % 3]}" stroke="#00000022" stroke-width="4"/>` +
      Array.from({ length: 12 }, (_, j) => `<rect x="${x + 40 + (j % 3) * 70}" y="${y + 60 + Math.floor(j / 3) * 150}" width="44" height="80" rx="4" fill="${win}" opacity="${dusk ? ((i + j) % 3 ? 0.9 : 0.3) : 0.85}"/>`).join("");
  }).join("")}
  <rect y="1500" width="${W * 2}" height="420" fill="${dusk ? "#3a3346" : "#a8a29a"}"/>
  ${Array.from({ length: 40 }, (_, i) => `<rect x="${(i % 20) * 108 + (Math.floor(i / 20) % 2) * 54}" y="${1530 + Math.floor(i / 20) * 70}" width="96" height="56" rx="10" fill="${dusk ? "#2e2838" : "#958f87"}"/>`).join("")}
  ${[300, 1100, 1900].map((x) => `<rect x="${x}" y="900" width="16" height="620" fill="#2b2b30"/><circle cx="${x + 8}" cy="890" r="30" fill="${dusk ? "#ffe6a3" : "#3a3a40"}"/>`).join("")}
</svg>`;

const bgStore = (id) => `<svg class="abs" style="inset:0" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs><radialGradient id="${id}-spot" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#1f6a6f"/><stop offset="1" stop-color="#0a2427"/></radialGradient>
  <linearGradient id="${id}-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfeff0" stop-opacity=".55"/><stop offset="1" stop-color="#7fb7ba" stop-opacity=".25"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#${id}-spot)"/>
  <g stroke="#c9a54a" stroke-width="6" opacity=".7"><path d="M0,300 H${W}"/><path d="M0,1280 H${W}"/></g>
  <g fill="#c9a54a" opacity=".85" font-family="Playfair Display" font-size="64" letter-spacing="14"><text x="540" y="250" text-anchor="middle">JUWELIER</text></g>
  ${[180, 540, 900].map((x) => `<ellipse cx="${x}" cy="330" rx="60" ry="14" fill="#fff6d0" opacity=".9"/><path d="M${x - 60},330 L${x - 220},1300 L${x + 220},1300 L${x + 60},330 Z" fill="#fff6d0" opacity=".06"/>`).join("")}
  ${[150, 400, 680, 930].map((x, i) => `<rect x="${x - 70}" y="${520 + (i % 2) * 40}" width="140" height="200" rx="12" fill="#0d3134" stroke="#c9a54a" stroke-width="4"/><circle cx="${x}" cy="${620 + (i % 2) * 40}" r="22" fill="none" stroke="#e8c766" stroke-width="7"/>`).join("")}
</svg>`;

const counter = (id, top = 1420) => `<svg class="abs" style="left:0;top:${top}px;width:${W}px;height:${H - top}px" viewBox="0 0 ${W} ${H - top}">
  <rect x="0" y="0" width="${W}" height="${H - top}" fill="#0b2b2e"/>
  <rect x="0" y="0" width="${W}" height="200" fill="#d6f0f1" opacity=".22"/>
  <rect x="0" y="0" width="${W}" height="8" fill="#e8c766"/>
  <rect x="300" y="40" width="480" height="120" rx="14" fill="#1a1a1e"/>
  ${[360, 450, 540, 630, 720].map((x, i) => `<circle cx="${x}" cy="100" r="26" fill="none" stroke="#e8c766" stroke-width="9"/><path d="M${x - 12},72 L${x},56 L${x + 12},72 Z" fill="#dff6ff" class="${id}-gem" data-i="${i}"/>`).join("")}
  <path d="M60,30 L200,30 M880,40 L1040,40" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round"/>
</svg>`;

const sparkles = (id, pts) => pts.map(([x, y, s], i) =>
  `<svg id="${id}-sp${i}" class="abs" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px" viewBox="0 0 40 40"><path d="M20,0 L24,16 L40,20 L24,24 L20,40 L16,24 L0,20 L16,16 Z" fill="#fff8d6"/></svg>`).join("");
const twinkle = (tl, id, n, dur) => {
  for (let i = 0; i < n; i++) {
    for (let t = (i * 0.37) % 1.2; t < dur - 0.6; t += 1.3) {
      tl.add(`tl.fromTo("#${id}-sp${i}",{scale:0.2,opacity:0},{scale:1,opacity:1,duration:0.25,ease:"power2.out",immediateRender:${t < 1.2}},${t.toFixed(2)});`);
      tl.add(`tl.fromTo("#${id}-sp${i}",{scale:1,opacity:1},{scale:0.2,opacity:0,duration:0.3,ease:"power2.in",immediateRender:false},${(t + 0.3).toFixed(2)});`);
    }
  }
};

const vignette = (id, strength = 0.55) => `<div id="${id}-vig" class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)"></div>`;

// Mini photo used on Lara's phone (Emir + Sophie in the store)
const miniPhoto = (id) => `<div class="abs" style="inset:0;overflow:hidden;border-radius:22px">
  ${bgStore(id + "m")}
  <div class="abs" style="left:-10px;top:60px;width:300px">${char(id + "-pe", "emir", "happy")}</div>
  <div class="abs" style="left:230px;top:70px;width:290px">${char(id + "-ps", "sophie", "happy")}</div>
  <svg class="abs" style="left:150px;top:420px;width:240px;height:120px" viewBox="0 0 240 120"><path d="M20,100 C70,40 170,40 220,100" stroke="#e7b28a" stroke-width="34" fill="none" stroke-linecap="round"/><circle cx="120" cy="58" r="30" fill="#d9a27c"/></svg>
</div>`;

const files = {};

// ---------- S1 Café (0–5) ----------
{
  const id = "s1", tl = new TL().init("s1-lara", "normal");
  const m = `${bgCafe(id)}
      ${person("s1-lara", "lara", "normal", "left:150px;top:560px;width:780px")}
      <svg class="abs" style="left:0;top:1430px;width:${W}px;height:490px" viewBox="0 0 ${W} 490"><rect width="${W}" height="490" fill="#7a4a2e"/><rect width="${W}" height="26" fill="#9a6340"/></svg>
      <svg class="abs" style="left:700px;top:1290px;width:220px;height:200px" viewBox="0 0 220 200"><path d="M20,40 L180,40 L160,190 L40,190 Z" fill="#fff"/><path d="M180,70 C230,70 230,140 172,140" stroke="#fff" stroke-width="18" fill="none"/><ellipse cx="100" cy="42" rx="80" ry="14" fill="#c08a5b"/><path d="M80,40 C90,10 110,10 120,40" stroke="#fff" stroke-width="6" fill="none" opacity=".6"/></svg>
      <div id="s1-phone" class="abs" style="left:250px;top:1300px;width:240px;height:150px;border-radius:26px;background:#111;border:6px solid #333"><div id="s1-glow" class="abs" style="inset:6px;border-radius:18px;background:linear-gradient(135deg,#4fd1ff,#a46bff);opacity:0"></div></div>
      <div id="s1-ring" class="abs" style="left:300px;top:1255px;width:140px;height:140px;border-radius:50%;border:8px solid #fff;opacity:0"></div>
      ${vignette(id, 0.35)}`;
  tl.push("#s1-cam", 5, 1.07);
  tl.breathe("#s1-lara", 5, 5, 1.8);
  tl.add(`tl.fromTo("#s1-glow",{opacity:0},{opacity:1,duration:0.15},0.5);`);
  tl.add(`tl.fromTo("#s1-ring",{opacity:0.9,scale:0.6},{opacity:0,scale:1.8,duration:0.7,ease:"power2.out"},0.5);`);
  tl.add(`tl.fromTo("#s1-phone",{y:0,rotation:0},{y:-90,x:-60,rotation:-8,duration:0.5,ease:"power3.out"},1.0);`);
  tl.blink("s1-lara", 0.3).face("s1-lara", "shock", 1.4).blink("s1-lara", 3.6);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S2 Handy-Chat (5–10) ----------
{
  const id = "s2", tl = new TL();
  const m = `<div class="abs" style="inset:0;background:linear-gradient(160deg,#2a1e18,#4a2f22 60%,#1b1411)"></div>
      <div id="s2-phone" class="abs" style="left:210px;top:190px;width:660px;height:940px;border-radius:64px;background:#0d0d10;border:10px solid #2c2c32;box-shadow:0 40px 90px rgba(0,0,0,.6);overflow:hidden">
        <div class="abs" style="left:0;top:0;right:0;height:150px;background:#1c1c22;display:flex;align-items:center;gap:22px;padding:40px 30px 0">
          <div style="width:84px;height:84px;border-radius:50%;overflow:hidden;background:#3b3b44;flex:none"><div style="width:120px;margin:-6px 0 0 -18px">${char("s2-av", "mila", "normal")}</div></div>
          <div style="color:#fff;font-size:38px;font-weight:700">Mila 🖤<div style="font-size:24px;font-weight:400;color:#9a9aa6">online</div></div>
        </div>
        <div id="s2-photo" class="abs" style="left:150px;top:190px;width:470px;height:520px;border-radius:26px;background:#1f6a6f;border:8px solid #2f6f4f">${miniPhoto("s2")}</div>
        <div id="s2-voice" class="abs" style="left:110px;top:740px;width:510px;height:120px;border-radius:34px;background:#2f6f4f;display:flex;align-items:center;gap:16px;padding:0 26px">
          <div style="width:0;height:0;border-left:34px solid #fff;border-top:22px solid transparent;border-bottom:22px solid transparent;flex:none"></div>
          ${Array.from({ length: 22 }, (_, i) => `<div id="s2-b${i}" style="width:8px;height:${20 + ((i * 37) % 50)}px;background:#d6f5e3;border-radius:4px;flex:none"></div>`).join("")}
          <div style="color:#d6f5e3;font-size:26px;margin-left:auto">0:04</div>
        </div>
      </div>`;
  tl.add(`tl.fromTo("#s2-phone",{y:120,scale:0.92,opacity:0},{y:0,scale:1,opacity:1,duration:0.45,ease:"power3.out"},0);`);
  tl.add(`tl.fromTo("#s2-photo",{scale:0.6,opacity:0},{scale:1,opacity:1,duration:0.35,ease:"back.out(1.6)"},0.4);`);
  tl.add(`tl.fromTo("#s2-voice",{scale:0.6,opacity:0},{scale:1,opacity:1,duration:0.35,ease:"back.out(1.6)"},1.2);`);
  for (let i = 0; i < 22; i++)
    for (let t = 1.6 + i * 0.05; t < 4.6; t += 0.6)
      tl.add(`tl.fromTo("#s2-b${i}",{scaleY:1},{scaleY:${(0.4 + ((i * 7 + Math.round(t * 10)) % 10) / 6).toFixed(2)},duration:0.3,yoyo:true,repeat:1,ease:"sine.inOut",immediateRender:false},${t.toFixed(2)});`);
  tl.add(`tl.fromTo("#s2-photo",{scale:1},{scale:1.08,duration:2,ease:"sine.inOut",immediateRender:false},2.8);`);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S3 Straße (10–15) ----------
{
  const id = "s3", tl = new TL().init("s3-lara", "angry");
  const m = `${bgStreet(id)}
      ${person("s3-lara", "lara", "angry", "left:130px;top:620px;width:820px")}
      <svg class="abs" style="left:640px;top:1230px;width:260px;height:300px" viewBox="0 0 260 300"><path d="M40,0 C40,-10 200,-10 200,0" stroke="#3a2a20" stroke-width="12" fill="none"/><rect x="20" y="60" width="220" height="230" rx="30" fill="#5a2a1e"/><path d="M60,60 C60,-40 200,-40 200,60" stroke="#3a2a20" stroke-width="14" fill="none"/></svg>
      ${vignette(id, 0.35)}`;
  tl.add(`tl.fromTo("#s3-street",{x:0},{x:-700,duration:5,ease:"none"},0);`);
  for (let t = 0; t < 4.9; t += 0.5) {
    tl.add(`tl.fromTo("#s3-lara",{y:0,rotation:-1},{y:-18,rotation:1,duration:0.25,ease:"sine.out",immediateRender:${t === 0}},${t.toFixed(2)});`);
    tl.add(`tl.fromTo("#s3-lara",{y:-18,rotation:1},{y:0,rotation:-1,duration:0.25,ease:"sine.in",immediateRender:false},${(t + 0.25).toFixed(2)});`);
  }
  tl.blink("s3-lara", 2.2);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S4 Juwelier: Emir & Sophie (15–20) ----------
{
  const id = "s4", tl = new TL().init("s4-emir", "happy").init("s4-sophie", "happy");
  const m = `${bgStore(id)}
      ${person("s4-emir", "emir", "happy", "left:-40px;top:640px;width:640px")}
      ${person("s4-sophie", "sophie", "happy", "left:470px;top:680px;width:620px")}
      ${counter(id)}
      ${sparkles(id, [[360, 1440, 50], [560, 1450, 40], [740, 1440, 46], [200, 520, 34], [880, 600, 30]])}
      ${vignette(id, 0.4)}`;
  tl.push("#s4-cam", 5, 1.05);
  tl.breathe("#s4-emir", 5, 5, 1.7);
  tl.breathe("#s4-sophie", 5, 6, 1.5, 0.3);
  tl.add(`tl.fromTo("#s4-sophie",{rotation:0},{rotation:-4,duration:0.3,yoyo:true,repeat:3,ease:"sine.inOut",transformOrigin:"50% 100%"},0.6);`);
  tl.blink("s4-emir", 1.1).blink("s4-sophie", 2.4).blink("s4-emir", 3.9);
  twinkle(tl, id, 5, 5);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S5 Tür geht auf: Lara (20–25) ----------
{
  const id = "s5", tl = new TL().init("s5-lara", "angry");
  const m = `<div class="abs" style="inset:0;background:#0b2427"></div>
      <div class="abs" style="left:190px;top:330px;width:700px;height:1590px;background:#2a1a10;border-radius:8px"></div>
      <div id="s5-light" class="abs" style="left:220px;top:360px;width:640px;height:1560px;background:radial-gradient(ellipse at 50% 40%,#fffbe8,#f6d48a 55%,#c98d3a)"></div>
      ${person("s5-lara", "lara", "angry", "left:150px;top:560px;width:780px")}
      <div id="s5-door" class="abs" style="left:220px;top:360px;width:640px;height:1560px;background:linear-gradient(90deg,#5a3a22,#7a5030);border-right:10px solid #3a2414;transform-origin:0% 50%"><div class="abs" style="left:540px;top:760px;width:30px;height:90px;border-radius:12px;background:#e8c766"></div><div class="abs" style="left:70px;top:120px;width:500px;height:600px;border:8px solid #4a2e1a;border-radius:10px;background:rgba(207,239,240,.25)"></div></div>
      <svg id="s5-bell" class="abs" style="left:480px;top:250px;width:120px;height:120px" viewBox="0 0 120 120"><path d="M60,10 L60,26" stroke="#c9a54a" stroke-width="6"/><path d="M24,90 C24,40 40,26 60,26 C80,26 96,40 96,90 Z" fill="#e8c766"/><circle cx="60" cy="98" r="10" fill="#c9a54a"/></svg>
      ${vignette(id, 0.5)}`;
  tl.add(`tl.fromTo("#s5-door",{scaleX:1},{scaleX:0.08,duration:0.7,ease:"power3.inOut"},0.15);`);
  tl.add(`tl.fromTo("#s5-bell",{rotation:-18},{rotation:18,duration:0.18,yoyo:true,repeat:5,ease:"sine.inOut",transformOrigin:"50% 10%"},0.15);`);
  tl.add(`tl.fromTo("#s5-lara",{scale:0.9,y:40},{scale:1.04,y:0,duration:3.5,ease:"power2.out"},0.4);`);
  tl.blink("s5-lara", 2.7);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S6 Emir erschrickt, versteckt Box (25–30) ----------
{
  const id = "s6", tl = new TL().init("s6-emir", "happy").init("s6-sophie", "happy");
  const m = `${bgStore(id)}
      ${person("s6-sophie", "sophie", "happy", "left:560px;top:760px;width:520px;filter:brightness(.8)")}
      ${person("s6-emir", "emir", "happy", "left:60px;top:560px;width:760px")}
      <svg id="s6-box" class="abs" style="left:400px;top:1260px;width:200px;height:170px" viewBox="0 0 200 170"><rect x="10" y="60" width="180" height="100" rx="18" fill="#b0122a"/><rect x="10" y="20" width="180" height="56" rx="18" fill="#d81b3a"/><rect x="10" y="62" width="180" height="8" fill="#7a0c1d"/></svg>
      ${counter(id, 1500)}
      ${vignette(id, 0.45)}`;
  tl.push("#s6-cam", 5, 1.06);
  tl.face("s6-emir", "shock", 0.2).face("s6-sophie", "shock", 0.6);
  tl.add(`tl.fromTo("#s6-emir",{x:0,rotation:0},{x:-30,rotation:-3,duration:0.25,ease:"power3.out"},0.2);`);
  tl.add(`tl.fromTo("#s6-box",{x:0,y:0,rotation:0,opacity:1},{x:-420,y:120,rotation:-30,opacity:0,duration:0.55,ease:"power3.in"},0.7);`);
  tl.breathe("#s6-sophie", 5, 4, 1.6, 0.2);
  tl.blink("s6-emir", 2.5).blink("s6-sophie", 3.2);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S7 Lara zeigt: „Wer ist die?!“ (30–35) ----------
{
  const id = "s7", tl = new TL().init("s7-lara", "angry");
  const m = `${bgStore(id)}
      ${[60, 860].map((x, i) => `<div id="s7-c${i}" class="abs" style="left:${x}px;top:${760 + i * 30}px;width:220px;height:500px;border-radius:110px 110px 20px 20px;background:#05191b;opacity:.75"></div>`).join("")}
      ${person("s7-lara", "lara", "angry", "left:110px;top:540px;width:820px", { tears: true })}
      <svg id="s7-arm" class="abs" style="left:620px;top:1080px;width:440px;height:330px" viewBox="0 0 440 330"><path d="M20,320 C80,220 200,160 330,120" stroke="#efe4cf" stroke-width="90" fill="none" stroke-linecap="round"/><ellipse cx="350" cy="112" rx="44" ry="34" fill="#f3c6a5"/><path d="M380,104 L440,82" stroke="#f3c6a5" stroke-width="22" stroke-linecap="round"/></svg>
      ${counter(id, 1560)}
      ${vignette(id, 0.5)}`;
  tl.add(`tl.fromTo("#s7-arm",{rotation:25,opacity:0},{rotation:0,opacity:1,duration:0.3,ease:"back.out(2)",transformOrigin:"5% 95%"},0.3);`);
  tl.add(`tl.fromTo("#s7-cam",{x:0},{x:-14,duration:0.05,yoyo:true,repeat:5,ease:"none"},0.35);`);
  tl.add(`tl.fromTo("#s7-c0",{rotation:0},{rotation:8,duration:0.5,ease:"power2.out",transformOrigin:"50% 100%"},0.8);`);
  tl.add(`tl.fromTo("#s7-c1",{rotation:0},{rotation:-8,duration:0.5,ease:"power2.out",transformOrigin:"50% 100%"},1.1);`);
  tl.add(`tl.fromTo("#s7-lara-tears",{opacity:0,y:0},{opacity:1,y:24,duration:1.6,ease:"sine.in"},1.6);`);
  tl.breathe("#s7-lara", 5, 7, 0.9);
  tl.blink("s7-lara", 3.4);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S8 Sophie: „Seine Schwester“ (35–40) ----------
{
  const id = "s8", tl = new TL().init("s8-sophie", "embar");
  const hand = (x) => `<svg class="abs s8-hand" style="left:${x}px;top:1150px;width:200px;height:300px" viewBox="0 0 200 300"><path d="M100,300 L100,170" stroke="#7fa7cf" stroke-width="80"/><ellipse cx="100" cy="120" rx="64" ry="78" fill="#d9a27c"/>${[50, 80, 110, 140].map((fx) => `<rect x="${fx - 11}" y="20" width="22" height="80" rx="11" fill="#d9a27c"/>`).join("")}</svg>`;
  const m = `${bgStore(id)}
      ${person("s8-sophie", "sophie", "embar", "left:140px;top:580px;width:800px")}
      <div id="s8-hands">${hand(60)}${hand(820)}</div>
      ${counter(id, 1560)}
      ${vignette(id, 0.4)}`;
  tl.push("#s8-cam", 5, 1.05);
  tl.add(`tl.fromTo("#s8-hands",{y:300,opacity:0},{y:0,opacity:1,duration:0.4,ease:"back.out(1.6)"},0.2);`);
  tl.face("s8-sophie", "happy", 1.6);
  tl.add(`tl.fromTo("#s8-sophie",{rotation:0},{rotation:3,duration:0.4,yoyo:true,repeat:3,ease:"sine.inOut",transformOrigin:"50% 100%"},1.6);`);
  tl.blink("s8-sophie", 1.0).blink("s8-sophie", 3.6);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S9 Laras Gesicht kippt (40–45) ----------
{
  const id = "s9", tl = new TL().init("s9-lara", "angry");
  const m = `${bgStore(id)}
      ${person("s9-lara", "lara", "angry", "left:40px;top:420px;width:1000px")}
      <div id="s9-dark" class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,.85) 90%);opacity:0"></div>`;
  tl.push("#s9-cam", 5, 1.16);
  tl.face("s9-lara", "shock", 0.6).face("s9-lara", "embar", 2.6);
  tl.add(`tl.fromTo("#s9-dark",{opacity:0},{opacity:1,duration:2,ease:"sine.inOut"},0.4);`);
  for (let t = 0.8; t < 4.8; t += 0.85)
    tl.add(`tl.fromTo("#s9-cam",{x:0},{x:4,duration:0.08,yoyo:true,repeat:1,ease:"none",immediateRender:false},${t.toFixed(2)});`);
  tl.blink("s9-lara", 2.2).blink("s9-lara", 4.2);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S10 Emir mit Ring (45–50) ----------
{
  const id = "s10", tl = new TL().init("s10-emir", "sad");
  const m = `${bgStore(id)}
      ${person("s10-emir", "emir", "sad", "left:90px;top:520px;width:900px")}
      <div id="s10-box" class="abs" style="left:640px;top:930px;width:400px;height:343px">
        <svg class="abs" style="inset:0" viewBox="0 0 420 360">
          <path d="M60,150 L360,150 L340,110 L80,110 Z" fill="#7a0c1d"/>
          <path d="M60,40 L360,40 L360,150 L60,150 Z" fill="#d81b3a"/>
          <path d="M80,60 L340,60 L340,140 L80,140 Z" fill="#f2e6ea"/>
          <rect x="40" y="170" width="340" height="170" rx="26" fill="#b0122a"/>
          <rect x="70" y="180" width="280" height="70" rx="14" fill="#f2e6ea"/>
          <circle cx="210" cy="200" r="40" fill="none" stroke="#e8c766" stroke-width="12"/>
          <path d="M184,160 L210,128 L236,160 L210,176 Z" fill="#dff6ff" stroke="#9fdcff" stroke-width="3"/>
        </svg>
        ${sparkles(id, [[180, 90, 50], [260, 120, 34], [140, 150, 28]])}
      </div>
      ${vignette(id, 0.55)}`;
  tl.push("#s10-cam", 5, 1.06);
  tl.add(`tl.fromTo("#s10-box",{y:260,opacity:0},{y:0,opacity:1,duration:0.8,ease:"power3.out"},0.2);`);
  tl.breathe("#s10-emir", 5, 4, 2.0);
  tl.blink("s10-emir", 1.8).blink("s10-emir", 4.0);
  twinkle(tl, id, 3, 5);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S11 Draußen, Nachricht von Mila (50–55) ----------
{
  const id = "s11", tl = new TL().init("s11-emir", "sad").init("s11-lara", "embar");
  const m = `${bgStreet(id, true)}
      ${person("s11-emir", "emir", "sad", "left:-60px;top:760px;width:600px")}
      ${person("s11-lara", "lara", "embar", "left:520px;top:860px;width:560px")}
      <div id="s11-lock" class="abs" style="left:150px;top:220px;width:780px;height:1080px;border-radius:70px;background:linear-gradient(170deg,#1f2a44,#4a2f5c 60%,#2a1a33);border:12px solid #18181c;box-shadow:0 50px 120px rgba(0,0,0,.7);overflow:hidden">
        <div style="text-align:center;color:#fff;margin-top:90px;font-size:40px;font-weight:400;opacity:.85">Samstag, 14. November</div>
        <div style="text-align:center;color:#fff;font-size:170px;font-weight:700;line-height:1">17:42</div>
        <div id="s11-notif" style="margin:70px 36px 0;padding:30px 32px;border-radius:40px;background:rgba(255,255,255,.88);color:#111">
          <div style="display:flex;justify-content:space-between;font-size:30px;color:#555"><span style="font-weight:700;color:#111">Mila 🖤</span><span>jetzt</span></div>
          <div style="font-size:40px;line-height:1.3;margin-top:12px;font-weight:600">Hat’s geklappt? Jetzt sag ihm endlich die Wahrheit über <span style="background:#e11d2e;color:#fff;padding:0 8px;border-radius:8px">letzten Samstag</span> 😬</div>
        </div>
      </div>
      ${vignette(id, 0.45)}`;
  tl.add(`tl.fromTo("#s11-street",{x:0},{x:-240,duration:5,ease:"none"},0);`);
  tl.add(`tl.fromTo("#s11-lock",{y:1400,opacity:1},{y:0,opacity:1,duration:0.55,ease:"power3.out"},0.9);`);
  tl.add(`tl.fromTo("#s11-notif",{scale:0.7,opacity:0},{scale:1,opacity:1,duration:0.35,ease:"back.out(1.8)"},1.6);`);
  tl.add(`tl.fromTo("#s11-lock",{rotation:0},{rotation:-2,duration:0.06,yoyo:true,repeat:5,ease:"none",immediateRender:false},1.6);`);
  tl.breathe("#s11-lara", 5, 4, 1.6);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- S12 Emir kalt + Endcard (55–60) ----------
{
  const id = "s12", tl = new TL().init("s12-emir", "sad");
  const m = `${bgStreet(id, true)}
      ${person("s12-emir", "emir", "sad", "left:-10px;top:380px;width:1100px")}
      ${vignette(id, 0.6)}
      <div id="s12-flash" class="abs" style="inset:0;background:#fff;opacity:0"></div>
      <div id="s12-end" class="abs" style="inset:0;background:rgba(8,8,12,.82);opacity:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
        <div id="s12-t2" style="color:#fff;font-family:'Archivo Black';font-size:190px;line-height:1;-webkit-text-stroke:6px #000;paint-order:stroke fill">TEIL 2?</div>
        <div id="s12-arrow" style="font-size:150px">👇</div>
        <div style="color:#e8c766;font-size:44px;font-weight:700;letter-spacing:6px">ZWEI HERZEN · FOLGE 1</div>
      </div>`;
  tl.push("#s12-cam", 3.3, 1.14);
  tl.face("s12-emir", "cold", 0.6);
  tl.blink("s12-emir", 1.6);
  tl.add(`tl.fromTo("#s12-flash",{opacity:0},{opacity:0.9,duration:0.06,ease:"none"},3.3);`);
  tl.add(`tl.fromTo("#s12-flash",{opacity:0.9},{opacity:0,duration:0.4,ease:"power2.out",immediateRender:false},3.36);`);
  tl.add(`tl.fromTo("#s12-end",{opacity:0},{opacity:1,duration:0.25,ease:"none"},3.3);`);
  tl.add(`tl.fromTo("#s12-t2",{scale:1.6,opacity:0},{scale:1,opacity:1,duration:0.35,ease:"back.out(2)"},3.35);`);
  tl.add(`tl.fromTo("#s12-arrow",{y:0},{y:30,duration:0.3,yoyo:true,repeat:3,ease:"sine.inOut"},3.6);`);
  files[id] = { dur: 5, html: sceneFile(id, 5, "", m, tl) };
}

// ---------- Captions (0–60) ----------
const CAPS = [
  [0.9, 3.9, "LARA", "DAS KANN *NICHT* SEIN"],
  [5.7, 4.1, "MILA · SPRACHNACHRICHT", "IST DAS NICHT *DEIN* EMIR?"],
  [10.4, 4.4, "LARA", "ER HAT GESAGT, ER IST *BEIM TRAINING*"],
  [15.5, 4.3, "SOPHIE", "DER HIER! SIE WIRD *AUSRASTEN*"],
  [20.9, 3.9, "LARA", "*EMIR.*"],
  [25.5, 4.3, "EMIR", "LARA?! WAS *MACHST* DU HIER?"],
  [30.4, 4.4, "LARA", "WER IST *DIE?!*"],
  [35.4, 4.4, "SOPHIE", "HI … ICH BIN SOPHIE. SEINE *SCHWESTER.*"],
  [41.0, 3.8, "LARA", "SEINE … *SCHWESTER?*"],
  [45.5, 4.3, "EMIR", "DER WAR FÜR SAMSTAG. ICH WOLLTE DICH *FRAGEN.*"],
  [55.4, 2.8, "EMIR", "LARA … WAS IST *LETZTEN SAMSTAG* PASSIERT?"],
];
const COLORS = { LARA: "#ff8a4c", EMIR: "#4cc3ff", SOPHIE: "#b38bff", MILA: "#ff4c8b" };
{
  const tl = new TL();
  const groups = CAPS.map(([s, d, who, text], gi) => {
    let wi = 0;
    const parts = text.split(/(\*[^*]+\*)/).filter(Boolean).map((seg) => {
      const key = seg.startsWith("*");
      const words = seg.replace(/\*/g, "").trim().split(/\s+/).filter(Boolean);
      const html = words.map((w) => `<span id="cap${gi}-w${wi++}" class="w">${w}</span>`).join(" ");
      return key ? `<span class="key">${html}</span>` : html;
    });
    const n = wi;
    const step = Math.min(0.22, 1.3 / n);
    for (let i = 0; i < n; i++)
      tl.add(`tl.fromTo("#cap${gi}-w${i}",{opacity:0,scale:0.6,y:20},{opacity:1,scale:1,y:0,duration:0.16,ease:"back.out(2.5)"},${(s + 0.05 + i * step).toFixed(2)});`);
    tl.add(`tl.fromTo("#cap${gi}-who",{opacity:0,x:-30},{opacity:1,x:0,duration:0.2,ease:"power3.out"},${s.toFixed(2)});`);
    const col = COLORS[who.split(" ")[0]];
    return `<div id="cap${gi}" class="clip capg" data-start="${s}" data-duration="${d}" data-track-index="1">
        <div id="cap${gi}-who" class="who" style="background:${col}">${who}</div>
        <div class="line">${parts.join(" ")}</div>
      </div>`;
  });
  tl.add(`tl.fromTo("#hook-text",{opacity:0,y:-20},{opacity:1,y:0,duration:0.01,ease:"none"},0);`);
  tl.add(`tl.fromTo("#hook-text",{scale:1},{scale:1.04,duration:3,ease:"sine.inOut"},0);`);
  files.captions = {
    dur: 60,
    html: `<template>
  <style>
    #root { position:absolute; inset:0; pointer-events:none; font-family:Inter, sans-serif; }
    .capg { position:absolute; left:60px; right:60px; top:1330px; display:flex; flex-direction:column; align-items:center; gap:18px; }
    .who { color:#111; font-weight:900; font-size:34px; letter-spacing:4px; padding:8px 22px; border-radius:14px; }
    .line { text-align:center; color:#fff; font-weight:900; font-size:76px; line-height:1.18; -webkit-text-stroke:12px #000; paint-order:stroke fill; text-shadow:0 8px 24px rgba(0,0,0,.5); }
    .w { display:inline-block; }
    .key .w { background:#e11d2e; color:#fff; -webkit-text-stroke:0; padding:0 14px; border-radius:12px; text-shadow:none; }
    #hook-text { position:absolute; left:60px; right:60px; top:230px; text-align:center; color:#fff; font-weight:900; font-size:64px; line-height:1.15; -webkit-text-stroke:10px #000; paint-order:stroke fill; }
  </style>
  <div id="root" data-composition-id="captions" data-width="${W}" data-height="${H}" data-layout-allow-overlap>
    <div id="hook" class="clip" data-start="0" data-duration="3.4" data-track-index="0"><div id="hook-text">Sie dachte, er betrügt sie… 💔</div></div>
    ${groups.join("\n    ")}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${tl.code()}
    window.__timelines["captions"] = tl;
  </script>
</template>
`,
  };
}

// ---------- write files ----------
for (const [id, f] of Object.entries(files)) writeFileSync(join(ROOT, "compositions", `${id}.html`), f.html);

const scenes = Array.from({ length: 12 }, (_, i) => `s${i + 1}`);
const hosts = scenes.map((id, i) => `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${i * 5}" data-duration="5" data-track-index="0" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:1"></div>`).join("\n");

writeFileSync(join(ROOT, "index.html"), `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      html, body { margin:0; width:${W}px; height:${H}px; overflow:hidden; background:#000; }
      #root { position:relative; width:100%; height:100%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="60" data-width="${W}" data-height="${H}">
${hosts}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="60" data-track-index="1" data-track-kind="captions" data-width="${W}" data-height="${H}" style="z-index:5"></div>
      <audio id="soundtrack" class="clip" src="assets/soundtrack.wav" data-start="0" data-duration="60" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
console.log("built", Object.keys(files).length, "compositions");
