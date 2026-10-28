// Gera os SVGs em pixel do README (header.svg e footer.svg) no tema do
// portfolio: fundo #141413 com grade de pontos, acento #d97757, texto em pixel
// e o mini Claude animado. O README do GitHub nao carrega fontes externas, por
// isso o texto e desenhado pixel a pixel com uma fonte 5x7 propria.
//
// Uso: node assets/build.mjs
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));

const C = {
  bg: "#141413",
  dot: "#23221f",
  fg: "#faf9f5",
  muted: "#b0aea5",
  line: "#33312c",
  accent: "#d97757",
  accentDark: "#b85f3f",
  soft: "#e39a7a",
  eye: "#1a1412",
};

// Fonte 5x7 (algumas letras estreitas). "X" e pixel aceso.
const FONT = {
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  B: ["XXXX.", "X...X", "X...X", "XXXX.", "X...X", "X...X", "XXXX."],
  C: [".XXX.", "X...X", "X....", "X....", "X....", "X...X", ".XXX."],
  D: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."],
  E: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"],
  F: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "X...."],
  G: [".XXX.", "X...X", "X....", "X.XXX", "X...X", "X...X", ".XXX."],
  H: ["X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  I: ["XXX", ".X.", ".X.", ".X.", ".X.", ".X.", "XXX"],
  J: ["..XXX", "...X.", "...X.", "...X.", "X..X.", "X..X.", ".XX.."],
  K: ["X...X", "X..X.", "X.X..", "XX...", "X.X..", "X..X.", "X...X"],
  L: ["X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"],
  M: ["X...X", "XX.XX", "X.X.X", "X.X.X", "X...X", "X...X", "X...X"],
  N: ["X...X", "XX..X", "X.X.X", "X..XX", "X...X", "X...X", "X...X"],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  Q: [".XXX.", "X...X", "X...X", "X...X", "X.X.X", "X..X.", ".XX.X"],
  R: ["XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"],
  S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  U: ["X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  V: ["X...X", "X...X", "X...X", "X...X", "X...X", ".X.X.", "..X.."],
  W: ["X...X", "X...X", "X...X", "X.X.X", "X.X.X", "XX.XX", "X...X"],
  X: ["X...X", "X...X", ".X.X.", "..X..", ".X.X.", "X...X", "X...X"],
  Y: ["X...X", "X...X", ".X.X.", "..X..", "..X..", "..X..", "..X.."],
  Z: ["XXXXX", "....X", "...X.", "..X..", ".X...", "X....", "XXXXX"],
  0: [".XXX.", "X...X", "X..XX", "X.X.X", "XX..X", "X...X", ".XXX."],
  2: [".XXX.", "X...X", "....X", "...X.", "..X..", ".X...", "XXXXX"],
  6: [".XXX.", "X....", "X....", "XXXX.", "X...X", "X...X", ".XXX."],
  "/": ["....X", "...X.", "...X.", "..X..", ".X...", ".X...", "X...."],
  ".": [".", ".", ".", ".", ".", ".", "X"],
  "!": ["X", "X", "X", "X", "X", ".", "X"],
  "·": [".", ".", ".", "X", ".", ".", "."],
  "-": ["...", "...", "...", "XXX", "...", "...", "..."],
  " ": ["...", "...", "...", "...", "...", "...", "..."],
};

const glyph = (char) => {
  const g = FONT[char];
  if (!g) throw new Error(`Sem glifo para "${char}"`);
  return g;
};

/** Largura do texto em pixels de fonte (sem escala), com 1 coluna entre letras. */
const textCols = (str) => [...str].reduce((sum, ch, i) => sum + glyph(ch)[0].length + (i ? 1 : 0), 0);

/** Texto em pixel como um unico <path>: cada pixel aceso vira um quadrado. */
const text = (str, x, y, scale, color, extra = "") => {
  let d = "";
  let cx = x;
  for (const ch of str) {
    const g = glyph(ch);
    g.forEach((row, ry) =>
      [...row].forEach((cell, rx) => {
        if (cell === "X") d += `M${cx + rx * scale} ${y + ry * scale}h${scale}v${scale}h-${scale}z`;
      })
    );
    cx += (g[0].length + 1) * scale;
  }
  return `<path d="${d}" fill="${color}"${extra}/>`;
};

/** Texto com a sombra deslocada do portfolio (text-shadow 6px 6px var(--line)). */
const shadowText = (str, x, y, scale, color, offset) =>
  text(str, x + offset, y + offset, scale, C.line) + text(str, x, y, scale, color);

// Mini Claude (mesmo sprite do hub/portfolio): o = corpo, d = barriga, k = olhos.
const BODY = [".oooooooo.", ".ookookoo.", "oookookooo", ".dddddddd."];
const LEGS = [".o.o..o.o.", "..o.oo.o.."];
const PX = 5;
const W = 10 * PX;
const H = 5 * PX;

const rects = (rows, colorOf, mirror = false) =>
  rows
    .flatMap((row, ry) =>
      [...row].map((cell, rx) => {
        const color = colorOf(cell);
        if (!color) return "";
        const col = mirror ? row.length - 1 - rx : rx;
        return `<rect x="${col * PX}" y="${ry * PX}" width="${PX}" height="${PX}" fill="${color}"/>`;
      })
    )
    .join("");

/** Corpo do mini Claude com olhos piscando e pernas alternando (andando). */
const critter = (mirror, { walking = true, sleeping = false } = {}) => {
  const body = rects(BODY, (c) => ({ o: C.accent, d: C.accentDark }[c]), mirror);
  // Olhos: piscam por ~5% do ciclo; dormindo ficam fechados (cor do corpo).
  const blink = `<animate attributeName="fill" values="${C.eye};${C.accent}" keyTimes="0;0.95" dur="3.6s" calcMode="discrete" repeatCount="indefinite"/>`;
  const eyes = BODY.flatMap((row, ry) =>
    [...row].map((cell, rx) => {
      if (cell !== "k") return "";
      const col = mirror ? row.length - 1 - rx : rx;
      const attrs = `x="${col * PX}" y="${ry * PX}" width="${PX}" height="${PX}"`;
      return sleeping ? `<rect ${attrs} fill="${C.accent}"/>` : `<rect ${attrs} fill="${C.eye}">${blink}</rect>`;
    })
  ).join("");
  const legRow = (row) => `<g transform="translate(0 ${4 * PX})">${rects([row], (c) => (c === "o" ? C.accent : null), mirror)}</g>`;
  const legs = walking
    ? `<g>${legRow(LEGS[0])}<animate attributeName="opacity" values="1;0" keyTimes="0;0.5" dur="0.32s" calcMode="discrete" repeatCount="indefinite"/></g>` +
      `<g opacity="0">${legRow(LEGS[1])}<animate attributeName="opacity" values="0;1" keyTimes="0;0.5" dur="0.32s" calcMode="discrete" repeatCount="indefinite"/></g>`
    : legRow("..o....o..");
  return body + eyes + legs;
};

const background = (w, h) => `
  <defs>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="11" cy="11" r="1.2" fill="${C.dot}"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#dots)"/>`;

/** Chao tracejado do hero (repeating-linear-gradient 34px / 4px). */
const floor = (w, y) => {
  let d = "";
  for (let x = 0; x < w; x += 38) d += `M${x} ${y}h${Math.min(34, w - x)}v4h-${Math.min(34, w - x)}z`;
  return `<path d="${d}" fill="${C.fg}" opacity="0.85"/>`;
};

const svg = (w, h, title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" role="img" aria-labelledby="t"><title id="t">${title}</title>${body}</svg>\n`;

// ---------- header.svg ----------
{
  const w = 1000;
  const h = 300;
  const floorY = 288;
  const big = 9;
  const oliveiraW = textCols("OLIVEIRA") * big;

  // Mini Claude vai e volta pelo chao em 24s; vira de lado na metade do ciclo
  // e fala "HI!" por alguns segundos em cada ida.
  const walkTop = floorY - H;
  const bubbleText = "HI!";
  const bubbleW = textCols(bubbleText) * 2 + 16;
  const walker = `
  <g>
    <animateTransform attributeName="transform" type="translate" values="40 ${walkTop}; ${w - 40 - W} ${walkTop}; 40 ${walkTop}" keyTimes="0;0.5;1" dur="24s" repeatCount="indefinite"/>
    <g>${critter(false)}<animate attributeName="opacity" values="1;0" keyTimes="0;0.5" dur="24s" calcMode="discrete" repeatCount="indefinite"/></g>
    <g opacity="0">${critter(true)}<animate attributeName="opacity" values="0;1" keyTimes="0;0.5" dur="24s" calcMode="discrete" repeatCount="indefinite"/></g>
    <g opacity="0" transform="translate(${W / 2 - bubbleW / 2} -34)">
      <rect x="3" y="3" width="${bubbleW}" height="26" fill="${C.line}"/>
      <rect width="${bubbleW}" height="26" fill="${C.fg}"/>
      ${text(bubbleText, 8, 6, 2, C.bg)}
      <animate attributeName="opacity" values="0;1;0;1;0" keyTimes="0;0.2;0.32;0.7;0.82" dur="24s" calcMode="discrete" repeatCount="indefinite"/>
    </g>
  </g>`;

  const body = `${background(w, h)}
  ${text("BRENO OLIVEIRA", 40, 26, 3, C.fg)}
  ${text("// SYSTEMS ANALYST · DATA ENGINEER · DATA ARCHITECT", 40, 70, 3, C.muted)}
  ${shadowText("BRENO", 40, 110, big, C.fg, 6)}
  ${shadowText("OLIVEIRA", 40, 186, big, C.accent, 6)}
  <rect x="${40 + oliveiraW + 14}" y="186" width="27" height="63" fill="${C.fg}"><animate attributeName="opacity" values="1;0" keyTimes="0;0.5" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>
  ${walker}
  ${floor(w, floorY)}`;

  writeFileSync(join(OUT, "header.svg"), svg(w, h, "Breno Oliveira, Systems Analyst, Data Engineer and Data Architect", body));
}

// ---------- footer.svg ----------
{
  const w = 1000;
  const h = 110;
  const floorY = 98;
  const x = w - 40 - W;
  const y = floorY - H;

  // Mini Claude dormindo no canto, soltando "z" que sobem e somem.
  const z = (delay) => `
    <g opacity="0">
      ${text("Z", 0, 0, 2, C.fg)}
      <animateTransform attributeName="transform" type="translate" values="${x + W - 8} ${y - 6}; ${x + W + 14} ${y - 40}" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>
    </g>`;

  const body = `${background(w, h)}
  ${text("BUILT BLOCK BY BLOCK.", 40, 22, 3, C.muted)}
  ${text("2026 · BRENO OLIVEIRA", 40, 54, 3, "#6b6962")}
  <g transform="translate(${x} ${y})">${critter(true, { walking: false, sleeping: true })}</g>
  ${z(0)}${z(0.8)}${z(1.6)}
  ${floor(w, floorY)}`;

  writeFileSync(join(OUT, "footer.svg"), svg(w, h, "Mini Claude sleeping on the floor. Built block by block.", body));
}

console.log("header.svg e footer.svg gerados em", OUT);
