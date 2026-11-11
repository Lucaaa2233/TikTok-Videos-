// Original characters for the series "ZWEI HERZEN" (flat illustration style).
// char(prefix, who, expr) returns an inline SVG (viewBox 600x900, bust).

export const EXPRS = ["normal", "happy", "angry", "shock", "sad", "cold", "embar"];

const C = {
  emir: {
    skin: "#e7b28a", skinDark: "#cf966e", iris: "#4f7a3a", lips: "#b5695a",
    hair: "#8a6a3c", hairDark: "#6e532c", outfit: "#c9a978", outfitDark: "#a98a5a",
    inner: "#24304f", innerDark: "#18213a", lashes: false,
  },
  lara: {
    skin: "#f3c6a5", skinDark: "#dea883", iris: "#6b4226", lips: "#c46a64",
    hair: "#9c4a25", hairDark: "#7a3518", outfit: "#efe4cf", outfitDark: "#d7c8aa",
    inner: "#ffffff", innerDark: "#e6e6e6", lashes: true,
  },
  mila: {
    skin: "#f6d2bb", skinDark: "#e2b597", iris: "#3c6e8f", lips: "#c8102e",
    hair: "#ece2c6", hairDark: "#cfc29e", outfit: "#1b1b1f", outfitDark: "#2c2c33",
    inner: "#8d8f96", innerDark: "#6f7178", lashes: true,
  },
  sophie: {
    skin: "#d9a27c", skinDark: "#c08560", iris: "#3b2618", lips: "#b4605a",
    hair: "#1b1b1f", hairDark: "#000000", outfit: "#7fa7cf", outfitDark: "#5f86ad",
    inner: "#ffffff", innerDark: "#ececec", lashes: true,
  },
};

function hairBack(w, c) {
  switch (w) {
    case "lara":
      return `<path d="M150,330 C112,450 104,580 138,680 C158,724 206,708 214,664 L386,664 C394,708 442,724 462,680 C496,580 488,450 450,330 Z" fill="${c.hairDark}"/>`;
    case "mila":
      return `<path d="M158,318 C146,420 150,505 168,552 L432,552 C450,505 454,420 442,318 Z" fill="${c.hairDark}"/>`;
    case "sophie":
      return `<path d="M360,246 C478,232 512,382 478,530 C462,574 430,530 440,476 C456,384 420,300 350,290 Z" fill="${c.hair}"/>
              <circle cx="398" cy="252" r="16" fill="#e11d48"/>`;
    default:
      return "";
  }
}

function hairFront(w, c) {
  switch (w) {
    case "emir":
      return `<path d="M174,372 C160,252 236,206 310,210 C396,214 444,270 428,372 C412,306 366,276 302,284 C252,290 214,318 196,382 Z" fill="${c.hair}"/>
              <path d="M240,232 C262,258 268,280 262,300" stroke="${c.hairDark}" stroke-width="6" fill="none" stroke-linecap="round"/>
              <path d="M310,214 C350,232 392,262 410,300" stroke="${c.hairDark}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
    case "lara":
      return `<path d="M170,398 C160,258 238,212 306,214 C388,218 442,280 432,404 C420,330 382,292 332,282 C300,326 232,336 190,404 Z" fill="${c.hair}"/>
              <path d="M172,380 C156,470 164,566 186,620 C200,626 210,612 204,596 C192,520 194,452 206,398 Z" fill="${c.hair}"/>
              <path d="M428,380 C444,470 436,566 414,620 C400,626 390,612 396,596 C408,520 406,452 394,398 Z" fill="${c.hair}"/>
              <path d="M330,286 C360,300 396,330 414,372" stroke="${c.hairDark}" stroke-width="5" fill="none" opacity=".6"/>`;
    case "mila":
      return `<path d="M172,366 C176,258 238,218 300,218 C362,218 424,258 428,366 L418,346 L182,346 Z" fill="${c.hair}"/>
              <path d="M170,340 L198,340 L198,548 C186,548 172,540 168,520 Z" fill="${c.hair}"/>
              <path d="M430,340 L402,340 L402,548 C414,548 428,540 432,520 Z" fill="${c.hair}"/>
              <path d="M200,346 L400,346" stroke="${c.hairDark}" stroke-width="4"/>`;
    case "sophie":
      return `<path d="M176,374 C172,258 238,220 300,220 C366,220 428,260 424,374 C404,302 352,274 300,274 C248,274 198,302 176,374 Z" fill="${c.hair}"/>`;
  }
  return "";
}

function outfit(w, c) {
  const body = `<path d="M50,900 C60,724 146,644 300,634 C454,644 540,724 550,900 Z" fill="${c.outfit}"/>`;
  switch (w) {
    case "emir":
      return `${body}
        <path d="M236,640 Q300,656 364,640 L334,900 L266,900 Z" fill="${c.inner}"/>
        <path d="M236,640 Q300,664 364,640" stroke="${c.innerDark}" stroke-width="10" fill="none"/>
        <path d="M236,640 L210,700 L268,860 L250,700 Z" fill="${c.outfitDark}"/>
        <path d="M364,640 L390,700 L332,860 L350,700 Z" fill="${c.outfitDark}"/>
        <circle cx="200" cy="800" r="9" fill="${c.outfitDark}"/><circle cx="400" cy="800" r="9" fill="${c.outfitDark}"/>`;
    case "lara":
      return `${body}
        <path d="M240,640 Q300,668 360,640 L336,900 L264,900 Z" fill="${c.inner}"/>
        <path d="M240,640 L214,712 L272,900 L262,740 Z" fill="${c.outfitDark}"/>
        <path d="M360,640 L386,712 L328,900 L338,740 Z" fill="${c.outfitDark}"/>`;
    case "mila":
      return `<path d="M200,640 C200,600 400,600 400,640 L380,700 L220,700 Z" fill="${c.inner}"/>
        ${body}
        <path d="M244,642 Q300,676 356,642 L330,900 L270,900 Z" fill="${c.inner}"/>
        <path d="M282,690 L276,760 M318,690 L324,760" stroke="#d9d9de" stroke-width="5" stroke-linecap="round"/>
        <path d="M244,642 L196,720 L268,900 L250,740 Z" fill="${c.outfitDark}"/>
        <path d="M356,642 L404,720 L332,900 L350,740 Z" fill="${c.outfitDark}"/>
        <path d="M120,760 C140,720 170,700 200,690" stroke="#44444c" stroke-width="5" fill="none"/>`;
    case "sophie":
      return `${body}
        <path d="M244,640 Q300,672 356,640 L340,900 L260,900 Z" fill="${c.inner}"/>
        <path d="M244,640 L216,708 L270,900 L258,730 Z" fill="${c.outfitDark}"/>
        <path d="M356,640 L384,708 L330,900 L342,730 Z" fill="${c.outfitDark}"/>
        <path d="M110,820 L200,800 M490,820 L400,800" stroke="#b9d2ea" stroke-width="4" stroke-dasharray="10 8"/>`;
  }
}

function expression(p, name, c, on) {
  const br = (d) => `<path d="${d}" stroke="${c.hairDark}" stroke-width="11" stroke-linecap="round" fill="none"/>`;
  const mouthLine = (d, wdt = 7) => `<path d="${d}" stroke="${c.lips}" stroke-width="${wdt}" stroke-linecap="round" fill="none"/>`;
  let s = "";
  switch (name) {
    case "normal":
      s = br("M218,356 Q250,342 282,354") + br("M318,354 Q350,342 382,356") + mouthLine("M268,500 Q300,516 332,500");
      break;
    case "happy":
      s = br("M216,346 Q250,328 284,344") + br("M316,344 Q350,328 384,346") +
        `<path d="M258,492 Q300,552 342,492 Q300,506 258,492 Z" fill="#7a1f24"/><path d="M268,496 Q300,506 332,496 L328,508 Q300,514 272,508 Z" fill="#fff"/>`;
      break;
    case "angry":
      s = br("M214,348 L284,374") + br("M386,348 L316,374") + mouthLine("M266,514 Q300,494 334,514", 8);
      break;
    case "shock":
      s = br("M214,330 Q250,310 284,328") + br("M316,328 Q350,310 386,330") +
        `<ellipse cx="300" cy="510" rx="17" ry="24" fill="#5a1418"/>`;
      break;
    case "sad":
      s = br("M220,368 L284,346") + br("M380,368 L316,346") + mouthLine("M270,514 Q300,498 330,514");
      break;
    case "cold":
      s = br("M216,362 L284,362") + br("M316,362 L384,362") + mouthLine("M274,506 L326,506");
      break;
    case "embar":
      s = br("M220,366 L284,348") + br("M380,366 L316,348") + mouthLine("M272,508 Q286,500 300,508 Q314,516 328,508") +
        `<ellipse cx="226" cy="460" rx="34" ry="18" fill="#ff6b6b" opacity=".45"/><ellipse cx="374" cy="460" rx="34" ry="18" fill="#ff6b6b" opacity=".45"/>`;
      break;
  }
  return `<g id="${p}-x-${name}" opacity="${on ? 1 : 0}">${s}</g>`;
}

export function char(p, who, expr = "normal", { tears = false } = {}) {
  const c = C[who];
  const eye = (x) => `
    <ellipse cx="${x}" cy="404" rx="25" ry="16" fill="#fff"/>
    <circle cx="${x}" cy="405" r="12.5" fill="${c.iris}"/>
    <circle cx="${x}" cy="405" r="6" fill="#111"/>
    <circle cx="${x + 4}" cy="400" r="3.2" fill="#fff"/>
    <path d="M${x - 27},400 Q${x},382 ${x + 27},400" stroke="#2a1a12" stroke-width="${c.lashes ? 6 : 4}" fill="none" stroke-linecap="round"/>`;
  const extras = {
    emir: `<path d="M196,470 Q300,606 404,470 Q392,548 300,566 Q208,548 196,470 Z" fill="#6b5233" opacity=".16"/>`,
    lara: [[232, 448], [246, 458], [222, 462], [368, 448], [354, 458], [378, 462], [290, 440], [310, 440]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#b8734d" opacity=".7"/>`).join("") +
      `<circle cx="178" cy="452" r="10" fill="none" stroke="#e0b44c" stroke-width="4"/><circle cx="422" cy="452" r="10" fill="none" stroke="#e0b44c" stroke-width="4"/>`,
    mila: `<circle cx="422" cy="440" r="6" fill="#c0c0c8"/>`,
    sophie: `<g fill="none" stroke="#1d1d22" stroke-width="6"><circle cx="250" cy="404" r="40"/><circle cx="350" cy="404" r="40"/><path d="M290,400 Q300,392 310,400"/></g>`,
  }[who];
  const tearsSvg = tears
    ? `<g id="${p}-tears" opacity="0"><path d="M228,424 Q220,446 228,456 Q236,446 228,424 Z" fill="#7cc4ff"/><path d="M372,424 Q364,446 372,456 Q380,446 372,424 Z" fill="#7cc4ff"/></g>`
    : "";
  return `<svg viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;overflow:visible">
  ${hairBack(who, c)}
  ${outfit(who, c)}
  <rect x="262" y="520" width="76" height="124" rx="30" fill="${c.skinDark}"/>
  <ellipse cx="177" cy="414" rx="19" ry="31" fill="${c.skinDark}"/>
  <ellipse cx="423" cy="414" rx="19" ry="31" fill="${c.skinDark}"/>
  <ellipse cx="300" cy="400" rx="126" ry="156" fill="${c.skin}"/>
  <ellipse cx="226" cy="462" rx="28" ry="14" fill="#ff8a7a" opacity=".22"/>
  <ellipse cx="374" cy="462" rx="28" ry="14" fill="#ff8a7a" opacity=".22"/>
  <g id="${p}-eyes">${eye(250)}${eye(350)}</g>
  <path d="M300,416 Q288,452 298,462 Q310,464 318,456" stroke="${c.skinDark}" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${EXPRS.map((x) => expression(p, x, c, x === expr)).join("")}
  ${extras}
  <g id="${p}-talk" opacity="0"><ellipse cx="300" cy="507" rx="23" ry="17" fill="#5a1418"/><path d="M284,496 Q300,492 316,496 L314,502 Q300,500 286,502 Z" fill="#fff"/></g>
  ${tearsSvg}
  ${hairFront(who, c)}
</svg>`;
}
