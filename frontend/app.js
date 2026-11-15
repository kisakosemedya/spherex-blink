// Sky Revisit core: pages, language, sky map, observation workspace and the
// shared `app` object used by the feature modules in frontend/modules/.
import { T, TARGET_INFO, FACTS, FAQ, SOURCES } from "./content.js";

const params = new URLSearchParams(location.search);
const LANG = params.get("lang") === "tr" ? "tr" : (params.get("lang") === "en" ? "en" : readStoredLang());
const t = T[LANG];
document.documentElement.lang = LANG;
try { localStorage.setItem("sr-lang", LANG); } catch {}
if (params.get("embed") === "1") document.body.classList.add("embed");

function readStoredLang() {
  try { return localStorage.getItem("sr-lang") === "tr" ? "tr" : "en"; } catch { return "en"; }
}

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dec = (v) => (String(v).split(".")[1] || "").length;
const num = (v, digits = 1) => Number(v).toLocaleString(LANG === "tr" ? "tr-TR" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtDate = (iso) => new Intl.DateTimeFormat(LANG === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ALADIN = "https://cdn.jsdelivr.net/npm/aladin-lite@3.8.2/dist/aladin.js";
const SPHEREX_HIPS = "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube";
const BANDS = { 1: "0.75–1.09", 2: "1.10–1.62", 3: "1.63–2.41", 4: "2.42–3.82", 5: "3.83–4.41", 6: "4.42–5.00" };
const band = (d) => `${LANG === "tr" ? BANDS[d].replace(/\./g, ",") : BANDS[d]} µm`;
const CROP = '<i class="cm tl"></i><i class="cm tr"></i><i class="cm bl"></i><i class="cm br"></i>';
const ICON = {
  blink: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="10" height="10"/><rect x="10" y="10" width="10" height="10"/></svg>',
  diff: '<svg viewBox="0 0 24 24"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>',
  gaia: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.5"/></svg>',
  flags: '<svg viewBox="0 0 24 24"><path d="M6 21V4h11l-2 4 2 4H6"/></svg>',
  curve: '<svg viewBox="0 0 24 24"><path d="M3 17l5-6 4 3 5-8 4 5"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M10 14l4-4M8 11l-2 2a3 3 0 004 4l2-2M16 13l2-2a3 3 0 00-4-4l-2 2"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>',
  ruler: '<svg viewBox="0 0 24 24"><path d="M4 16L16 4l4 4L8 20z"/><path d="M8 12l2 2M11 9l2 2"/></svg>',
  spec: '<svg viewBox="0 0 24 24"><path d="M3 20h18M5 20V9M10 20V5M15 20v-8M20 20v-4"/></svg>',
  temp: '<svg viewBox="0 0 24 24"><path d="M10 4a2 2 0 014 0v10a4 4 0 11-4 0z"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  ne: '<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>',
};
const tr = (path) => path.split(".").reduce((o, k) => o?.[k], t);

// ---------------------------------------------------------------------------
// static text, language links, footer
// ---------------------------------------------------------------------------
function applyStaticText(root = document) {
  for (const el of root.querySelectorAll("[data-t]")) { const v = tr(el.dataset.t); if (typeof v === "string") el.textContent = v; }
  for (const el of root.querySelectorAll("[data-t-ph]")) el.placeholder = tr(el.dataset.tPh);
}
function langHref(lang) {
  const p = new URLSearchParams(location.search);
  p.set("lang", lang);
  return `?${p}`;
}
function renderLang() {
  const links = ["en", "tr"].map((l) => `<a href="${langHref(l)}" hreflang="${l}" lang="${l}" aria-current="${l === LANG}" title="${t.langName[l]}">${l.toUpperCase()}</a>`);
  $("lang").innerHTML = `${links[0]}<span>|</span>${links[1]}`;
  $("lang-mobile").innerHTML = links.join("");
}

let presets = [];
const presetById = (id) => presets.find((p) => p.id === id);

function renderFooter() {
  const tg = presets.map((p) => `<li><a href="?view=target&id=${p.id}" data-link="target" data-id="${p.id}">${esc(p.name[LANG])}</a></li>`).join("");
  $("footer").innerHTML = `
    <div class="footer">
      <img class="watermark" src="assets/logo.png" alt="" aria-hidden="true">
      <div class="footer-grid">
        <div><a class="brand" href="/" data-link="home"><img src="assets/logo.png" alt="Sky Revisit"></a><p class="tagline">${t.foot.tag}</p></div>
        <div><h4>${t.foot.explore}</h4><ul>${tg}</ul></div>
        <div><h4>${t.foot.project}</h4><ul>
          <li><a href="?view=map" data-link="map">${t.nav.map}</a></li>
          <li><a href="?view=guide" data-link="guide">${t.nav.guide}</a></li>
          <li><a href="?view=credits" data-link="credits">${t.nav.credits}</a></li>
          <li><a href="https://github.com/kisakosemedya/spherex-blink">${t.foot.github}</a></li>
          <li><a href="https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/">${t.foot.challenge}</a></li></ul></div>
        <div><h4>${t.foot.data}</h4><ul>
          <li><a href="https://irsa.ipac.caltech.edu/Missions/spherex.html">NASA SPHEREx · IRSA</a></li>
          <li><a href="https://www.cosmos.esa.int/web/gaia/dr3">ESA Gaia DR3</a></li>
          <li><a href="https://data.asc-csa.gc.ca/dataset/neossat">CSA NEOSSat</a></li>
          <li><a href="https://aladin.cds.unistra.fr/AladinLite/">CDS Aladin</a></li></ul>
          <h4 style="margin-top:1.6rem">${t.foot.language}</h4>
          <ul><li><a href="${langHref("en")}" lang="en">English</a></li><li><a href="${langHref("tr")}" lang="tr">Türkçe</a></li></ul></div>
      </div>
      <div class="footer-legal"><span>© 2026 Sky Revisit</span><span>${t.foot.legal}</span></div>
    </div>`;
}

// ---------------------------------------------------------------------------
// real-data thumbnails: blink canvases drawn from the preset frames
// ---------------------------------------------------------------------------
const frameCache = new Map();
function decode(b64) {
  const bin = atob(b64), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Float32Array(bytes.buffer);
}
function percentile(values, p) {
  if (!values.length) return 1;
  values.sort((a, b) => a - b);
  return values[Math.min(values.length - 1, Math.floor(values.length * p))] || 1;
}
async function presetFrames(id) {
  if (frameCache.has(id)) return frameCache.get(id);
  const p = presetById(id);
  const job = fetch(`/api/frames?${new URLSearchParams({ ra: p.ra, dec: p.dec, det: p.det, fov: p.fov, quality: "preview" })}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      const frames = d.visits.map((v) => decode(v.data));
      const all = [];
      for (const f of frames) for (const v of f) if (Number.isFinite(v)) all.push(v);
      const hi = Math.max(percentile(all, 0.997), 1e-6);
      const diffs = [];
      const a = frames[0], b = frames[frames.length - 1];
      for (let i = 0; i < a.length; i++) { const v = b[i] - a[i]; if (Number.isFinite(v)) diffs.push(Math.abs(v)); }
      const sigma = 1.4826 * percentile(diffs, 0.5);
      return { grid: d.grid, frames, hi, floor: 2.5 * sigma, top: Math.max(percentile(diffs, 0.999), 8 * sigma), visits: d.visits.map(({ data, ...v }) => v) };
    });
  frameCache.set(id, job);
  return job;
}
function paint(canvas, set, index, mode = "blink", gain = 1) {
  const n = set.grid;
  canvas.width = canvas.height = n;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(n, n);
  const cur = set.frames[index], a = set.frames[0], b = set.frames[set.frames.length - 1];
  for (let row = 0; row < n; row++) {
    const src = (n - 1 - row) * n;
    for (let col = 0; col < n; col++) {
      const o = (row * n + col) * 4;
      let r, g, bl;
      if (mode === "diff") {
        const v = b[src + col] - a[src + col];
        if (!Number.isFinite(v)) { r = g = bl = 20; } else {
          const m = Math.sqrt(Math.max(0, Math.min(1, (Math.abs(v) - set.floor) / Math.max(set.top - set.floor, 1e-6))));
          if (v >= 0) { r = 8 + 247 * m; g = 8 + 146 * m; bl = 8 + 52 * m; } else { r = 8 + 52 * m; g = 8 + 132 * m; bl = 8 + 247 * m; }
        }
      } else {
        const v = cur[src + col];
        const s = Number.isFinite(v) ? Math.sqrt(Math.max(0, Math.min(1, (v / set.hi) * gain))) : 1;
        r = g = bl = 255 * s;
      }
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = bl; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
const animated = new Set();
const io = new IntersectionObserver((entries) => {
  for (const e of entries) e.target._visible = e.isIntersecting;
}, { rootMargin: "120px" });
function blinkBox(id, { mode = "blink", stamp = true, cross = true, gain = 1 } = {}) {
  return `<div class="blink" data-blink="${id}" data-mode="${mode}" data-gain="${gain}">${cross ? '<i class="cross"></i>' : ""}<canvas aria-hidden="true"></canvas>${stamp ? '<span class="stamp"></span>' : ""}</div>`;
}
function hydrateBlinks(root) {
  for (const img of root.querySelectorAll("img[data-cycle]:not([data-ready])")) {
    img.dataset.ready = "1";
    const list = img.dataset.cycle.split("|");
    list.forEach((src) => { const pre = new Image(); pre.src = src; });
    let k = 0;
    if (!reduced) setInterval(() => { if (img.isConnected && img.offsetParent) { k = (k + 1) % list.length; img.src = list[k]; } }, 1000);
  }
  for (const box of root.querySelectorAll("[data-blink]:not([data-ready])")) {
    box.dataset.ready = "1";
    const canvas = box.querySelector("canvas"), stamp = box.querySelector(".stamp");
    presetFrames(box.dataset.blink).then((set) => {
      box._set = set; box._i = 0;
      paint(canvas, set, 0, box.dataset.mode, Number(box.dataset.gain));
      if (stamp) stamp.textContent = box.dataset.mode === "diff" ? `${set.visits.at(-1).date} − ${set.visits[0].date}` : set.visits[0].date;
      io.observe(box);
      if (box.dataset.mode !== "diff" && set.frames.length > 1) animated.add(box);
    }).catch(() => {});
  }
}
if (!reduced) setInterval(() => {
  for (const box of animated) {
    if (!box.isConnected) { animated.delete(box); continue; }
    if (!box._visible) continue;
    box._i = (box._i + 1) % box._set.frames.length;
    paint(box.querySelector("canvas"), box._set, box._i, "blink", Number(box.dataset.gain));
    const s = box.querySelector(".stamp");
    if (s) s.textContent = box._set.visits[box._i].date;
  }
}, 850);

// ---------------------------------------------------------------------------
// Aladin sky maps (home hero and the Sky map page)
// ---------------------------------------------------------------------------
let aladinLib = null;
async function loadAladin() {
  if (!aladinLib) aladinLib = import(ALADIN).then(async (m) => { await m.default.init; return m.default; });
  return aladinLib;
}
const HIDE = {
  showReticle: false, showZoomControl: false, showLayersControl: false, showGotoControl: false, showFrame: false,
  showCooLocation: false, showFov: false, showProjectionControl: false, showFullscreenControl: false,
  showSimbadPointerControl: false, showCooGridControl: false, showSettingsControl: false, showShareControl: false,
  showContextMenu: false, showStatusBar: false, log: false,
};
function setWavelength(aladin, micron) {
  try { aladin.getBaseImageLayer()?.setFrequency({ value: 299792458 / (micron * 1e-6), unit: "Hz" }); } catch {}
}
async function makeMap(host, { ra, dec, fov, projection = "SIN", micron = 1.53 }) {
  const A = await loadAladin();
  // Aladin sets its own position on the container, so it gets a full-size child.
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  host.appendChild(el);
  el.addEventListener("AL:Layer.added", () => setWavelength(aladin, micron), { once: true });
  const aladin = A.aladin(el, { survey: SPHEREX_HIPS, cooFrame: "ICRSd", fov, target: `${ra} ${dec}`, projection, ...HIDE });
  const cat = A.catalog({ name: "targets", sourceSize: 14, shape: "square", color: "#ffffff" });
  aladin.addCatalog(cat);
  cat.addSources(presets.map((p) => A.source(p.ra, p.dec, { id: p.id, name: p.name[LANG] })));
  return { aladin, A, cat };
}

// ---------------------------------------------------------------------------
// pages
// ---------------------------------------------------------------------------
const rendered = {};
const VIEWS = ["home", "map", "targets", "target", "observations", "guide", "credits"];
let current = null;

function linkAttrs(view, extra = "") { return `href="?view=${view}${extra}" data-link="${view}"`; }
function sectionHead(n, label, lead, rest) {
  return `<span class="num" aria-hidden="true">${n}</span>
    <div class="section-head"><p class="label">${label}</p><p class="statement"><strong>${lead}</strong>${rest}</p></div>`;
}
function tag(kind) { return `<span class="tag">${kind === "varies" ? t.varies : t.moves}</span>`; }
function targetCard(p, i) {
  const info = TARGET_INFO[p.id];
  return `<a class="card crop" ${linkAttrs("target", `&id=${p.id}`)} data-id="${p.id}">${CROP}
    <div style="position:relative">${blinkBox(p.id, { stamp: false })}<span class="card-top">${esc(p.name[LANG])}</span></div>
    <div class="card-body">${tag(info.tag)}<p>${esc(p.blurb[LANG])}</p></div></a>`;
}

function renderHome(el) {
  const ids = presets.map((p) => p.id);
  const steps = t.steps.map(([h, p], i) => `
    <article class="step cut">${i === 2 ? blinkBox("wise0855", { mode: "diff" }) : blinkBox(i === 0 ? "rwaur" : "barnard")}
      <div class="step-body"><span class="mono">0${i + 1}</span><h3>${h}</h3><p>${p}</p></div></article>`).join("");
  const resultTiles = ids.map((id) => {
    const [v, unit, note] = t.results[id];
    return `<div class="tile"><span class="icon-box">${id === "barnard" ? ICON.ruler : (TARGET_INFO[id].tag === "varies" ? ICON.curve : ICON.target)}</span>
      <span class="value">${v}</span><span class="name">${esc(presetById(id).name[LANG])} · ${unit}</span><p>${note}</p></div>`;
  }).join("");
  const stats = t.spherexStats.map(([v, u, n]) => `<div class="tile"><span class="value">${v}${u ? `<small>${u}</small>` : ""}</span><span class="name">${n}</span></div>`).join("");
  const greys = ["#d9d9d9", "#b3b3b3", "#8c8c8c", "#666", "#404040", "#262626"];
  const feats = t.features.map(([icon, h, p]) => `<a class="feature cut" ${linkAttrs("observations")}><span class="icon-box" style="width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--dark)">${ICON[icon].replace("<svg", '<svg style="width:16px;height:16px;stroke:#ccc;fill:none;stroke-width:1.5"')}</span><h3>${h}</h3><p>${p}</p></a>`).join("");
  el.innerHTML = `
  <section class="hero" aria-label="${esc(t.heroTitle)}">
    <div class="hero-map" id="hero-map"></div>
    <div class="hero-shade"></div>
    <div class="frame" aria-hidden="true"></div>
    <div class="hero-inner">
      <div class="hero-tools">
        <a class="icon-btn" ${linkAttrs("observations")} title="${t.blink}">${ICON.blink}</a>
        <a class="icon-btn" ${linkAttrs("observations", "&ra=133.7598&dec=-7.2422&det=6&fov=150&mode=diff")} title="${t.difference}">${ICON.diff}</a>
        <a class="icon-btn" ${linkAttrs("map")} title="${t.nav.map}">${ICON.globe}</a>
        <a class="icon-btn" ${linkAttrs("target", "&id=rdra")} title="${t.features[4][1]}">${ICON.curve}</a>
      </div>
      <p class="hero-note">${t.heroText}</p>
      <div class="hero-title"><p class="label">${t.heroLabel}</p><h1 class="display display--xl">${t.heroTitle}</h1></div>
      <div class="hero-side"><p>${t.heroMeta.join(" · ")}</p><div class="row"><a class="btn btn--primary" ${linkAttrs("observations")}>${t.open}</a><a class="btn" ${linkAttrs("map")}>${t.nav.map}</a></div></div>
      <div class="strip">
        <span class="clock" id="clock"></span>
        <a ${linkAttrs("targets")} class="btn--plain" style="gap:.6rem">› ${t.nav.targets}</a>
        <a ${linkAttrs("guide")}>${t.stripGuide} ▶</a>
      </div>
    </div>
    <span class="map-credit">${t.mapCredit}</span>
  </section>

  <section class="section"><div class="wrap">
    <span class="num" aria-hidden="true">Ø1</span>
    <div class="split">
      <div><p class="label">${t.s1Label}</p><p class="statement"><strong>${t.s1Lead}</strong>${t.s1Rest}</p>
        <div class="row" style="margin-top:2rem"><a class="btn" ${linkAttrs("target", "&id=barnard")}>${esc(presetById("barnard").name[LANG])}</a></div></div>
      <figure class="gif-frame crop is-on">${CROP}<img src="assets/barnard/0.png" data-cycle="assets/barnard/0.png|assets/barnard/1.png|assets/barnard/2.png|assets/barnard/3.png" alt="${esc(t.s1Caption)}" loading="lazy" width="450" height="486"><figcaption>${t.s1Caption}</figcaption></figure>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø2", t.s2Label, t.steps[0][0] + " → " + t.steps[2][0] + ".", "")}
    <div class="steps">${steps}</div>
    <div class="row" style="margin-top:2rem"><a class="btn btn--primary" ${linkAttrs("observations")}>${t.open}</a><a class="btn" ${linkAttrs("guide")}>${t.nav.guide}</a></div>
  </div></section>

  <section class="section" style="padding-bottom:calc(var(--section) + 4rem)"><span class="ghost" aria-hidden="true">TARGETS</span><div class="wrap">
    ${sectionHead("Ø3", t.s3Label, t.s3Lead, t.s3Rest)}
    <div class="cards">${presets.map(targetCard).join("")}</div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø4", t.s4Label, t.s4Lead, t.s4Rest)}
    <div class="split">
      <div class="tiles tiles-2" style="align-self:stretch"><img class="bg-img" src="assets/barnard/3.png" alt="" aria-hidden="true">
        <div class="tile"><span class="icon-box">${ICON.ruler}</span><span class="value">${num(71.2)}<small>″</small></span><span class="name">${t.measured}</span><p>NEOSSat 2019 → SPHEREx 2026</p></div>
        <div class="tile"><span class="icon-box">${ICON.gaia}</span><span class="value">${num(71.2)}<small>″</small></span><span class="name">${t.predicted}</span><p>${num(6.85, 2)} ${t.years}</p></div>
      </div>
      <div class="timeline" style="grid-template-columns:1fr;margin:0">${t.timeline.map(([y, p, s]) => `<div class="tline cut" style="min-height:0"><span class="year">${y}</span><p>${p}</p><span class="mono">${s}</span></div>`).join("")}</div>
    </div>
    <div class="row" style="margin-top:2rem"><a class="btn" ${linkAttrs("target", "&id=barnard")}>${esc(presetById("barnard").name[LANG])}</a><a class="btn" href="https://github.com/kisakosemedya/spherex-blink/tree/main/showcase/neossat_barnard">${t.method}</a></div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø5", t.s5Label, t.s5Lead, t.s5Rest)}
    <div class="tiles tiles-5">${resultTiles}</div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø6", t.s6Label, t.s6Lead, t.s6Rest)}
    <div class="tiles tiles-3">${stats}</div>
    <div class="detstrip" role="group" aria-label="${t.detector}">${[1, 2, 3, 4, 5, 6].map((d, i) => `<button type="button" data-det="${d}" style="background:${greys[i]};color:${i < 3 ? "#000" : "#fff"}" aria-pressed="${d === 6}">D${d}</button>`).join("")}</div>
    <p class="detnote" id="detnote">${t.detectors[6]}</p>
    <p class="muted small"><a href="https://irsa.ipac.caltech.edu/Missions/spherex.html">${t.statSource}</a></p>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø7", t.s7Label, t.features.map((f) => f[1]).slice(0, 3).join(" · ") + ".", "")}
    <div class="features">${feats}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <span class="num" aria-hidden="true">Ø8</span>
    <div class="deck" id="deck-home"></div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø9", t.s9Label, t.s9Title, "")}
    <div class="row"><button class="btn btn--primary" type="button" id="random-field">${t.random}</button><a class="btn" ${linkAttrs("map")}>${t.coords}</a></div>
  </div></section>

  <section class="section"><div class="wrap">
    ${sectionHead("Ø10", t.s10Label, FAQ[LANG][0][0], "")}
    <div class="faq">${FAQ[LANG].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
  </div></section>

  <section class="closing">
    <div class="float a crop is-on">${CROP}${blinkBox("barnard", { stamp: false, cross: false })}</div>
    <div class="float b crop is-on">${CROP}${blinkBox("epsindb", { stamp: false, cross: false })}</div>
    <div class="float c crop is-on">${CROP}${blinkBox("wise0855", { stamp: false, cross: false, mode: "diff" })}</div>
    <p class="label">${t.closeLabel}</p>
    <h2 class="display">${t.closeTitle}</h2>
    <div class="icons"><span class="icon-btn">${ICON.blink}</span><span class="icon-btn">${ICON.diff}</span><span class="icon-btn">${ICON.globe}</span></div>
    <p>${t.closeText}</p>
    <div class="acts"><a class="btn" ${linkAttrs("guide")}>${t.nav.guide}</a><a class="btn btn--primary" ${linkAttrs("observations")}>${t.open}</a></div>
  </section>`;

  deck(el.querySelector("#deck-home"), t.s8Label, FACTS[LANG]);
  el.querySelector(".detstrip").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    el.querySelectorAll(".detstrip button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    el.querySelector("#detnote").textContent = t.detectors[b.dataset.det];
  });
  el.querySelector("#random-field").onclick = () => {
    const ra = Math.random() * 360, dec = Math.asin(Math.random() * 2 - 1) * 180 / Math.PI;
    navigate("observations", { ra: ra.toFixed(4), dec: dec.toFixed(4), det: 2, fov: 150 });
  };
  const clock = el.querySelector("#clock");
  const tick = () => { clock.textContent = `${t.stripData} // ${new Date().toISOString().slice(11, 16)} UTC`; };
  tick(); setInterval(tick, 20_000);
  heroMap(el.querySelector("#hero-map"));
}

async function heroMap(el) {
  try {
    const { aladin } = await makeMap(el, { ra: 269.45, dec: 4.77, fov: 70, projection: "SIN", micron: 1.53 });
    aladin.on("objectClicked", (o) => { const id = o?.data?.id; if (id) navigate("target", { id }); });
    if (!reduced) {
      let ra = 269.45, idle = true;
      el.addEventListener("pointerdown", () => { idle = false; });
      el.addEventListener("wheel", () => { idle = false; }, { passive: true });
      setInterval(() => { if (idle && current === "home") { ra = (ra - 0.04 + 360) % 360; aladin.gotoRaDec(ra, 4.77); } }, 60);
    }
  } catch {
    el.innerHTML = `<canvas class="hero-fallback" aria-hidden="true"></canvas>`;
    presetFrames("barnard").then((set) => paint(el.querySelector("canvas"), set, 0)).catch(() => {});
  }
}

function deck(el, label, items, counterOnly = false) {
  let i = 0;
  el.innerHTML = `<div><p class="label">${label}</p><div class="deck-count" aria-hidden="true"><span data-i>Ø1</span><small>/ ${String(items.length).padStart(2, "0")}</small></div>
    <div class="deck-nav"><button class="icon-btn" type="button" data-prev><span class="sr">${t.prev}</span>${ICON.arrowL}</button><button class="icon-btn" type="button" data-next><span class="sr">${t.next}</span>${ICON.arrowR}</button></div></div>
    <div class="deck-stage" aria-live="polite">${items.map((f, k) => `<article class="deck-card cut crop" data-k="${k}">${CROP}<span class="mono">${String(k + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}</span><p>${f}</p></article>`).join("")}</div>`;
  const show = () => {
    el.querySelector("[data-i]").textContent = String(i + 1).padStart(2, "0").replace(/^0/, "Ø");
    el.querySelectorAll(".deck-card").forEach((c) => {
      const pos = (Number(c.dataset.k) - i + items.length) % items.length;
      c.dataset.pos = pos <= 2 ? String(pos) : "hide";
      c.classList.toggle("is-on", pos === 0);
      c.setAttribute("aria-hidden", String(pos !== 0));
    });
  };
  el.querySelector("[data-prev]").onclick = () => { i = (i - 1 + items.length) % items.length; show(); };
  el.querySelector("[data-next]").onclick = () => { i = (i + 1) % items.length; show(); };
  show();
}

function renderTargets(el) {
  const rows = presets.map((p) => {
    const info = TARGET_INFO[p.id];
    return `<tr><td><a ${linkAttrs("target", `&id=${p.id}`)}>${esc(p.name[LANG])}</a></td><td>${info.kind[LANG]}</td>
      <td class="mono">${info.dist ? `${num(info.dist, dec(info.dist))} ${t.ly}` : "—"}</td><td class="mono">${info.pm ? `${num(info.pm, dec(info.pm))}${t.perYear}` : t.varies}</td><td class="mono">D${p.det} · ${band(p.det)}</td></tr>`;
  }).join("");
  el.innerHTML = `
  <header class="page-head"><span class="num" aria-hidden="true">Ø3</span><div class="wrap" style="position:relative">
    <p class="label">${t.targetsLabel}</p><h1 class="display">${t.targetsTitle}</h1><p class="lead">${t.targetsText}</p></div></header>
  <section class="section" style="padding-top:3rem;padding-bottom:calc(var(--section) + 4rem)"><span class="ghost" aria-hidden="true">TARGETS</span><div class="wrap">
    <div class="cards">${presets.map(targetCard).join("")}</div></div></section>
  <section class="section"><div class="wrap"><div class="table-scroll"><table class="compare-table">
    <thead><tr><th>${t.table.name}</th><th>${t.table.kind}</th><th>${t.table.dist}</th><th>${t.table.pm}</th><th>${t.table.det}</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
}

function renderTarget(el, id) {
  const p = presetById(id) || presets[0];
  const info = TARGET_INFO[p.id];
  const idx = presets.indexOf(p), nextP = presets[(idx + 1) % presets.length];
  const stats = [
    [ICON.target, info.dist ? `${num(info.dist, dec(info.dist))}<small>${t.ly}</small>` : "—", t.statDist],
    [ICON.ruler, info.pm ? `${num(info.pm, dec(info.pm))}<small>″/yr</small>` : `<small>${t.varies}</small>`, t.statPm],
    [ICON.temp, `<span style="font-size:.5em">${info.kind[LANG]}</span>`, t.statKind],
    [ICON.spec, `D${p.det}`, `${t.statDet} · ${band(p.det)}`],
  ].map(([ic, v, n]) => `<div class="tile"><span class="icon-box">${ic}</span><span class="value">${v}</span><span class="name">${n}</span></div>`).join("");
  const proof = p.id === "barnard" ? `
    <section class="section"><div class="wrap">${sectionHead("Ø4", t.s4Label, t.s4Lead, t.s4Rest)}
      <div class="split"><figure class="gif-frame crop is-on">${CROP}<img src="assets/barnard/0.png" data-cycle="assets/barnard/0.png|assets/barnard/1.png|assets/barnard/2.png|assets/barnard/3.png" alt="${esc(t.s1Caption)}" loading="lazy" width="450" height="486"><figcaption>${t.s1Caption}</figcaption></figure>
      <div class="timeline" style="grid-template-columns:1fr;margin:0">${t.timeline.map(([y, pp, s]) => `<div class="tline cut" style="min-height:0"><span class="year">${y}</span><p>${pp}</p><span class="mono">${s}</span></div>`).join("")}</div></div></div></section>` : "";
  el.innerHTML = `
  <section class="cover">${blinkBox(p.id, { stamp: false, cross: false })}<div class="hero-shade"></div>
    <div class="cover-inner"><div><p class="label">${tag(info.tag)}</p><h1 class="display display--xl">${esc(p.name[LANG])}</h1></div><p>${esc(p.blurb[LANG])}</p></div></section>
  <section class="section"><div class="wrap">
    <span class="num" aria-hidden="true">Ø1</span>
    <div class="tiles tiles-2" style="grid-template-columns:repeat(4,minmax(0,1fr))">${stats}</div>
  </div></section>
  <section class="section"><div class="wrap">
    <div class="section-head"><p class="label">${t.lookFor}</p><p class="statement"><strong>${info.look[LANG]}</strong></p></div>
    <div class="ws-embed" id="ws-slot-target"></div>
    <div class="row" style="margin-top:1.25rem"><a class="btn" ${linkAttrs("observations", `&ra=${p.ra}&dec=${p.dec}&det=${p.det}&fov=${p.fov}`)}>${t.fullWorkspace}</a></div>
  </div></section>
  ${proof}
  <section class="section"><div class="wrap"><span class="num" aria-hidden="true">Ø${p.id === "barnard" ? 5 : 4}</span><div class="deck" id="deck-target"></div></div></section>
  <section class="section"><div class="wrap"><p class="label">${t.nextTarget}</p>
    <a class="card crop" style="max-width:520px" ${linkAttrs("target", `&id=${nextP.id}`)}>${CROP}<div style="position:relative">${blinkBox(nextP.id, { stamp: false })}<span class="card-top">${esc(nextP.name[LANG])} →</span></div></a></div></section>`;
  // the tile row with four tiles needs its own breakpoint
  const row = el.querySelector(".tiles");
  const fix = () => { row.style.gridTemplateColumns = innerWidth < 640 ? "1fr" : innerWidth < 1000 ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))"; };
  fix(); addEventListener("resize", fix);
  deck(el.querySelector("#deck-target"), t.didYouKnow, info.facts[LANG]);
}

function renderGuide(el) {
  const visuals = [blinkBox("barnard"), null, null, blinkBox("wise0855", { mode: "diff" }), blinkBox("rdra"), null];
  const greys = ["#d9d9d9", "#b3b3b3", "#8c8c8c", "#666", "#404040", "#262626"];
  const strip = `<div class="detstrip">${[1, 2, 3, 4, 5, 6].map((d, i) => `<button type="button" tabindex="-1" style="background:${greys[i]};color:${i < 3 ? "#000" : "#fff"}">D${d}</button>`).join("")}</div>`;
  const steps = `<div class="steps" style="grid-template-columns:1fr">${t.steps.map(([h, p], i) => `<div class="tline cut" style="min-height:0"><span class="mono">0${i + 1}</span><h3 style="margin:0;font:500 1.1rem var(--body);text-transform:uppercase">${h}</h3><p>${p}</p></div>`).join("")}</div>`;
  el.innerHTML = `
  <header class="page-head"><div class="wrap"><p class="label">${t.guideLabel}</p><h1 class="display">${t.guideTitle}</h1></div></header>
  ${t.chapters.map(([h, p], i) => `
  <section class="section"><span class="num" aria-hidden="true">Ø${i + 1}</span><div class="wrap">
    <div class="split" style="align-items:start">
      <div><p class="label">${String(i + 1).padStart(2, "0")} · ${h}</p><p class="statement" style="font-size:clamp(1.1rem,2vw,1.8rem)"><strong>${h}.</strong> ${p}</p></div>
      <div>${visuals[i] ? `<div class="crop is-on" style="max-width:520px;margin-left:auto">${CROP}${visuals[i]}</div>` : (i === 1 ? steps : i === 2 ? strip + `<p class="detnote">${t.detectors[6]}</p>` : `<div class="timeline" style="grid-template-columns:1fr">${t.timeline.map(([y, pp, s]) => `<div class="tline cut" style="min-height:0"><span class="year">${y}</span><p>${pp}</p><span class="mono">${s}</span></div>`).join("")}</div>`)}</div>
    </div></div></section>`).join("")}
  <section class="section"><div class="wrap">${sectionHead("Ø7", t.s10Label, FAQ[LANG][3][0], "")}
    <div class="faq">${FAQ[LANG].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>`;
}

function renderCredits(el) {
  const rows = presets.map((p) => `<tr><td>${esc(p.name[LANG])}</td><td class="mono">${t.results[p.id][0]}</td><td>${t.results[p.id][1]}</td><td class="muted">${t.results[p.id][2]}</td></tr>`).join("");
  el.innerHTML = `
  <header class="page-head"><div class="wrap"><p class="label">${t.creditsLabel}</p><h1 class="display">${t.creditsTitle}</h1></div></header>
  <section class="section"><span class="num" aria-hidden="true">Ø1</span><div class="wrap">
    <div class="tiles tiles-3">${t.measuredBox.map(([h, p], i) => `<div class="tile"><span class="icon-box">${[ICON.ruler, ICON.gaia, ICON.flags][i]}</span><span class="name" style="font-size:1rem">${h}</span><p>${p}</p></div>`).join("")}</div></div></section>
  <section class="section"><span class="num" aria-hidden="true">Ø2</span><div class="wrap">
    <div class="section-head"><p class="label">${t.s5Label}</p><p class="statement"><strong>${t.s5Lead}</strong>${t.s5Rest}</p></div>
    <div class="table-scroll"><table class="compare-table"><tbody>${rows}</tbody></table></div></div></section>
  <section class="section"><span class="num" aria-hidden="true">Ø3</span><div class="wrap">
    <div class="section-head"><p class="label">${t.sources}</p><div class="features" style="grid-template-columns:repeat(3,minmax(0,1fr))">${SOURCES.map(([n, u]) => `<a class="feature cut" href="${u}" style="min-height:7rem"><h3>${n}</h3><p class="mono" style="font-size:.7rem;word-break:break-all">${u.replace(/^https:\/\//, "")}</p></a>`).join("")}</div></div>
    <p class="muted" style="max-width:52rem">${t.ack}</p>
    <p class="muted" style="max-width:52rem">${t.aiNote}</p></div></section>`;
}

// ---------------------------------------------------------------------------
// sky map page
// ---------------------------------------------------------------------------
const SURVEYS = [["SPHEREx", SPHEREX_HIPS], ["2MASS", "CDS/P/2MASS/color"], ["AllWISE", "CDS/P/allWISE/color"], ["DSS2", "CDS/P/DSS2/color"]];
function renderMap(el) {
  el.innerHTML = `
  <section class="mapview">
    <div class="hero-map" id="sky-map"></div>
    <div class="reticle" aria-hidden="true"></div>
    <div class="map-zoom"><button class="icon-btn" type="button" id="z-in"><span class="sr">+</span><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button><button class="icon-btn" type="button" id="z-out"><span class="sr">−</span><svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button></div>
    <div class="map-ui">
      <div class="panel"><p class="label">${t.mapLabel}</p><h1>${t.mapTitle}</h1><p class="muted small" style="margin:0">${t.mapText}</p></div>
      <div class="panel"><h2>${t.layers}</h2><div class="seg" id="surveys">${SURVEYS.map(([n], i) => `<button class="btn btn--sm btn--plain" type="button" data-s="${i}" aria-pressed="${i === 0}">${n}</button>`).join("")}</div>
        <h2 style="margin-top:1.1rem">${t.wavelength} · <span class="mono" id="wl">1.53 µm</span></h2>
        <input type="range" id="wl-range" min="0.75" max="5" step="0.01" value="1.53" style="width:100%">
        <div class="seg" style="margin-top:.6rem">${t.hl.map(([n, w]) => `<button class="btn btn--sm btn--plain" type="button" data-wl="${w}">${n} ${w}</button>`).join("")}</div></div>
      <div class="panel"><h2>${t.coordTab}</h2>
        <form class="coord-form" id="coord-form">
          <label>RA (°)<input id="c-ra" inputmode="decimal" required><small>${t.raHelp}</small></label>
          <label>Dec (°)<input id="c-dec" inputmode="decimal" required><small>${t.decHelp}</small></label>
          <label>${t.fov} (″)<select id="c-fov">${[90, 150, 200, 300, 600].map((f) => `<option ${f === 150 ? "selected" : ""}>${f}</option>`).join("")}</select><small>${t.fovHelp}</small></label>
          <label>${t.detector}<select id="c-det">${[1, 2, 3, 4, 5, 6].map((d) => `<option value="${d}" ${d === 2 ? "selected" : ""}>D${d} · ${band(d)}</option>`).join("")}</select><small>${t.detHelp}</small></label>
          <p class="muted small" style="grid-column:1/-1;margin:0">${t.wiki}</p>
          <div class="row" style="grid-column:1/-1">${["N", "S", "E", "W"].map((d) => `<button class="icon-btn" type="button" data-step="${d}" title="${t.step}">${d}</button>`).join("")}<button class="btn btn--sm" type="button" id="c-random">${t.random}</button></div>
          <button class="btn btn--primary" type="submit" style="grid-column:1/-1">${t.open}</button>
        </form></div>
      <div class="panel"><h2>${t.nav.targets}</h2><div class="seg">${presets.map((p) => `<button class="btn btn--sm" type="button" data-goto="${p.id}">${esc(p.name[LANG])}</button>`).join("")}</div></div>
    </div>
    <div class="field-panel panel" id="field-panel"><h2>${t.selected}</h2><p class="mono small" id="field-coords" style="margin:0 0 1rem"></p>
      <div class="row"><button class="btn btn--primary btn--sm" type="button" id="field-open">${t.open}</button></div></div>
    <span class="map-credit" style="bottom:1rem;left:var(--gutter);right:auto">${t.mapCredit}</span>
  </section>`;
  const raI = el.querySelector("#c-ra"), decI = el.querySelector("#c-dec");
  const setField = (ra, dec) => {
    raI.value = (((ra % 360) + 360) % 360).toFixed(4); decI.value = Number(dec).toFixed(4);
    el.querySelector("#field-coords").textContent = `RA ${raI.value}° · Dec ${decI.value}° · ${el.querySelector("#c-fov").value}″`;
  };
  const open = () => navigate("observations", { ra: raI.value, dec: decI.value, det: el.querySelector("#c-det").value, fov: el.querySelector("#c-fov").value });
  el.querySelector("#coord-form").addEventListener("submit", (e) => { e.preventDefault(); open(); });
  el.querySelector("#field-open").onclick = open;
  setField(269.4462, 4.7688);
  makeMap(el.querySelector("#sky-map"), { ra: 269.4462, dec: 4.7688, fov: 24, micron: 1.53 }).then(({ aladin }) => {
    mapState.aladin = aladin;
    aladin.on("positionChanged", (pos) => { const [ra, dec] = aladin.getRaDec(); setField(ra, dec); });
    aladin.on("objectClicked", (o) => { const id = o?.data?.id; if (id) navigate("target", { id }); });
    el.querySelector("#z-in").onclick = () => aladin.setFoV(aladin.getFov()[0] / 1.6);
    el.querySelector("#z-out").onclick = () => aladin.setFoV(Math.min(aladin.getFov()[0] * 1.6, 180));
    el.querySelectorAll("[data-goto]").forEach((b) => (b.onclick = () => { const p = presetById(b.dataset.goto); aladin.gotoRaDec(p.ra, p.dec); aladin.setFoV(0.5); el.querySelector("#c-det").value = p.det; el.querySelector("#c-fov").value = p.fov; setField(p.ra, p.dec); }));
    const wl = (v) => { el.querySelector("#wl").textContent = `${num(v, 2)} µm`; el.querySelector("#wl-range").value = v; setWavelength(aladin, Number(v)); };
    el.querySelector("#wl-range").oninput = (e) => wl(e.target.value);
    el.querySelectorAll("[data-wl]").forEach((b) => (b.onclick = () => wl(b.dataset.wl)));
    el.querySelectorAll("#surveys [data-s]").forEach((b) => (b.onclick = () => {
      el.querySelectorAll("#surveys [data-s]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const url = SURVEYS[b.dataset.s][1];
      if (b.dataset.s === "0") el.querySelector("#sky-map").addEventListener("AL:Layer.added", () => setWavelength(aladin, Number(el.querySelector("#wl-range").value)), { once: true });
      aladin.setImageSurvey(url);
    }));
    el.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => {
      const step = Number(el.querySelector("#c-fov").value) / 3600;
      let ra = Number(raI.value), dec = Number(decI.value);
      const k = Math.cos((dec * Math.PI) / 180) || 1;
      if (b.dataset.step === "N") dec += step; if (b.dataset.step === "S") dec -= step;
      if (b.dataset.step === "E") ra += step / k; if (b.dataset.step === "W") ra -= step / k;
      aladin.gotoRaDec(ra, dec); setField(ra, dec);
    }));
    el.querySelector("#c-random").onclick = () => { const ra = Math.random() * 360, dec = Math.asin(Math.random() * 2 - 1) * 180 / Math.PI; aladin.gotoRaDec(ra, dec); setField(ra, dec); };
  }).catch(() => {
    el.querySelector("#sky-map").innerHTML = `<div style="display:grid;place-items:center;height:100%;color:var(--gray);padding:2rem;text-align:center">${t.mapError}</div>`;
  });
}
const mapState = {};

// ---------------------------------------------------------------------------
// observation workspace (the blink player)
// ---------------------------------------------------------------------------
const handlers = {};
const state = { name: null, ra: null, dec: null, det: 2, fov: 150, visits: [], frameIndex: 0, grid: 50, mode: "blink", playing: false };
const VB = 1000;
const PANES = { gaia: "pane-layers", flags: "pane-layers", lightcurve: "pane-measure", barnard: "pane-measure" };
const app = {
  state, overlay: $("overlay"), loadTarget,
  pixelValue(visit, x, y) { return frames[visit]?.[y * state.grid + x]; },
  on(event, fn) { (handlers[event] ||= []).push(fn); },
  emit(event, arg) { for (const fn of handlers[event] || []) { try { fn(arg); } catch (e) { console.error(`module error on "${event}"`, e); } } },
  addPanel(id, title) {
    const box = document.createElement("section");
    box.className = "module-panel"; box.id = `panel-${id}`;
    const h = document.createElement("h2"); h.textContent = title;
    const body = document.createElement("div");
    box.append(h, body);
    $(PANES[id] || "pane-layers").appendChild(box);
    return body;
  },
  skyToPixel(ra, dec) {
    const k = VB / state.fov;
    const east = ((ra - state.ra + 540) % 360 - 180) * Math.cos((state.dec * Math.PI) / 180) * 3600;
    return { x: VB / 2 - east * k, y: VB / 2 - (dec - state.dec) * 3600 * k };
  },
};

let frames = [];
let range = { hi: 1, floor: 0, top: 1 };
let pair = [0, 0];
let timer = null, activeRequest, activeQuality = "preview", factTimer = null;

function newRequest() { activeRequest?.abort(); activeRequest = new AbortController(); return activeRequest; }

$("det").replaceChildren(...Object.keys(BANDS).map((d) => new Option(`D${d} · ${band(d)}`, d)));
$("compass").innerHTML = `<g stroke="#fff" stroke-width="2" fill="none" opacity=".7"><path d="M955 955 V880 M955 955 H880"/></g>
  <g fill="#fff" font-size="26" font-family="IBM Plex Mono, monospace" opacity=".8"><text x="946" y="868">${LANG === "tr" ? "K" : "N"}</text><text x="850" y="964">${LANG === "tr" ? "D" : "E"}</text></g>`;

function computeRange() {
  const all = [];
  for (const f of frames) for (const v of f) if (Number.isFinite(v)) all.push(v);
  range.hi = Math.max(percentile(all, 0.997), 1e-6);
  const most = Math.max(...state.visits.map((v) => v.n_images), 1);
  const solid = state.visits.map((v, i) => (v.n_images >= 0.4 * most ? i : -1)).filter((i) => i >= 0);
  pair = solid.length > 1 ? [solid[0], solid[solid.length - 1]] : [0, frames.length - 1];
  computeDifferenceRange();
}
function computeDifferenceRange() {
  const d = [], a = frames[pair[0]], b = frames[pair[1]];
  for (let i = 0; a && b && i < a.length; i++) { const v = b[i] - a[i]; if (Number.isFinite(v)) d.push(Math.abs(v)); }
  const sigma = 1.4826 * percentile(d, 0.5);
  range.floor = 2.5 * sigma;
  range.top = Math.max(percentile(d, 0.999), 8 * sigma, 1e-6);
}
function render() {
  const n = state.grid, canvas = $("canvas");
  if (canvas.width !== n) canvas.width = canvas.height = n;
  const ctx = canvas.getContext("2d"), img = ctx.createImageData(n, n);
  const gain = Math.pow(10, Number($("stretch").value) / 10);
  const diff = state.mode === "diff" && frames.length > 1;
  const cur = frames[state.frameIndex], first = frames[pair[0]], last = frames[pair[1]];
  for (let row = 0; row < n; row++) {
    const src = (n - 1 - row) * n;
    for (let col = 0; col < n; col++) {
      const o = (row * n + col) * 4;
      let r, g, b;
      if (diff) {
        const v = last[src + col] - first[src + col];
        if (!Number.isFinite(v)) { r = g = b = 30; } else {
          const m = Math.sqrt(Math.max(0, Math.min(1, ((Math.abs(v) - range.floor / gain) / Math.max(range.top - range.floor, 1e-6)) * gain)));
          if (v >= 0) { r = 8 + 247 * m; g = 8 + 146 * m; b = 8 + 52 * m; } else { r = 8 + 52 * m; g = 8 + 132 * m; b = 8 + 247 * m; }
        }
      } else if (!cur) { r = g = b = 5; } else {
        const v = cur[src + col];
        const s = Number.isFinite(v) ? Math.sqrt(Math.max(0, Math.min(1, (v / range.hi) * gain))) : 1;
        r = g = b = 255 * s;
      }
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
function showFrame(i) {
  state.frameIndex = i;
  [...$("frames").children].forEach((b, j) => b.setAttribute("aria-pressed", String(j === i && state.mode !== "diff")));
  render();
  const v = state.visits[i];
  $("stage-date").textContent = state.mode === "diff" && state.visits.length > 1
    ? `${state.visits[pair[1]].date} − ${state.visits[pair[0]].date}` : (v ? `${v.date} · D${state.det}` : "");
  app.emit("frame", i);
}
function setPlaying(on) {
  state.playing = on && frames.length > 1 && state.mode !== "diff";
  $("play").textContent = state.playing ? t.pause : t.play;
  clearInterval(timer);
  if (state.playing) {
    timer = setInterval(() => {
      if (state.mode === "compare") showFrame(state.frameIndex === pair[0] ? pair[1] : pair[0]);
      else showFrame((state.frameIndex + 1) % frames.length);
    }, Number($("speed").value));
  }
}
function setMode(mode) {
  state.mode = mode;
  for (const [m, id] of [["blink", "m-blink"], ["compare", "m-compare"], ["diff", "m-diff"]]) $(id).setAttribute("aria-pressed", String(mode === m));
  $("compare-row").hidden = mode === "blink";
  $("legend").hidden = mode === "blink";
  if (mode !== "blink" && state.visits.length > 1) {
    const [a, b] = pair.map((index) => state.visits[index].date);
    $("legend").innerHTML = mode === "diff" ? t.diffLegend(a, b) : t.compareLegend(a, b);
  }
  if (mode === "diff") { setPlaying(false); showFrame(pair[1]); }
  else if (mode === "compare") { showFrame(pair[0]); setPlaying(true); }
  else showFrame(state.frameIndex);
  syncUrl();
}
function veil(text, { retry = false, busy = false } = {}) {
  $("veil").hidden = !text;
  $("veil-text").innerText = text || "";
  $("retry").hidden = !retry;
  $("spinner").hidden = !busy;
  clearInterval(factTimer);
  const fact = $("veil-fact");
  fact.innerHTML = "";
  if (busy) {
    let k = Math.floor(Math.random() * FACTS[LANG].length);
    const showFact = () => { fact.innerHTML = `<b>${t.loadingFacts}</b>${FACTS[LANG][k]}`; k = (k + 1) % FACTS[LANG].length; };
    showFact(); factTimer = setInterval(showFact, 6000);
  }
}
function syncUrl() {
  if (current !== "observations") return;
  const p = new URLSearchParams();
  p.set("view", "observations");
  p.set("ra", state.ra); p.set("dec", state.dec); p.set("det", state.det); p.set("fov", state.fov);
  if (state.mode !== "blink" && state.visits.length > 1) { p.set("mode", state.mode); p.set("a", state.visits[pair[0]].date); p.set("b", state.visits[pair[1]].date); }
  p.set("lang", LANG);
  if (params.get("embed") === "1") p.set("embed", "1");
  history.replaceState(history.state, "", `?${p}`);
  renderShare();
}
function describe(skipped) {
  const preset = presets.find((p) => p.ra === state.ra && p.dec === state.dec);
  state.targetId = preset?.id;
  state.name = preset ? preset.name[LANG] : t.custom;
  $("ws-name").textContent = state.name;
  const info = preset && TARGET_INFO[preset.id];
  const meta = `RA ${state.ra}° · Dec ${state.dec}° · D${state.det} · ${state.fov}″`;
  $("ws-meta").textContent = meta;
  $("pane-target").innerHTML = `
    <div>${info ? tag(info.tag) : ""}<h2 style="margin-top:.8rem">${esc(state.name)}</h2></div>
    <p>${esc(preset ? preset.blurb[LANG] : t.customBlurb)}</p>
    ${info ? `<div class="mini-stats">
      <div><b>${info.dist ? num(info.dist, dec(info.dist)) : "—"}</b><span>${t.statDist}${info.dist ? ` · ${t.ly}` : ""}</span></div>
      <div><b>${info.pm ? num(info.pm, dec(info.pm)) : "—"}</b><span>${t.statPm} · ″/yr</span></div>
      <div><b>D${preset.det}</b><span>${t.statDet}</span></div>
      <div><b>${state.visits.length || "–"}</b><span>${LANG === "tr" ? "Ziyaret" : "Visits"}</span></div></div>
      <p><strong>${t.lookFor}.</strong> ${info.look[LANG]}</p>
      ${current !== "target" ? `<a class="btn btn--sm" ${linkAttrs("target", `&id=${preset.id}`)}>${esc(preset.name[LANG])} →</a>` : ""}` : ""}
    <p class="mono small muted">${meta}${skipped ? ` · ${t.skipped(skipped)}` : ""}</p>`;
}
function renderShare() {
  const url = new URL(location.href);
  if (current === "target") { url.search = new URLSearchParams({ view: "observations", ra: state.ra, dec: state.dec, det: state.det, fov: state.fov, lang: LANG }).toString(); }
  const link = url.toString();
  const embedUrl = new URL(link); embedUrl.searchParams.set("embed", "1");
  const v = state.visits;
  const report = `${state.name} — Sky Revisit\nRA ${state.ra}°, Dec ${state.dec}°, D${state.det} (${band(state.det)}), ${state.fov}″\n${v.length ? `${v[0].date} → ${v.at(-1).date}, ${v.length} visits` : ""}\n${link}`;
  $("pane-share").innerHTML = `<p>${t.shareHelp}</p>
    <div class="row"><button class="btn btn--sm btn--primary" type="button" data-copy="link">${t.copy}</button><button class="btn btn--sm" type="button" data-copy="embed">${t.embed}</button><button class="btn btn--sm" type="button" data-copy="report">${t.report}</button></div>
    <textarea readonly aria-label="${t.report}">${esc(report)}</textarea>`;
  const values = { link, embed: `<iframe src="${embedUrl}" width="720" height="720" style="border:0" title="Sky Revisit"></iframe>`, report };
  $("pane-share").querySelectorAll("[data-copy]").forEach((b) => (b.onclick = async () => {
    try { await navigator.clipboard.writeText(values[b.dataset.copy]); const old = b.textContent; b.textContent = t.copied; setTimeout(() => (b.textContent = old), 1800); } catch { prompt("", values[b.dataset.copy]); }
  }));
}
function sameField(target) {
  return state.ra === Number(target.ra) && state.dec === Number(target.dec) && state.det === Number(target.det ?? state.det) && state.fov === Number(target.fov ?? state.fov) && frames.length;
}
async function loadTarget(target, quality = "preview") {
  const request = newRequest(), { signal } = request;
  activeQuality = quality;
  setPlaying(false);
  frames = [];
  Object.assign(state, { visits: [], frameIndex: 0, mode: "blink" });
  Object.assign(state, { ra: Number(target.ra), dec: Number(target.dec), det: Number(target.det ?? state.det), fov: Number(target.fov ?? state.fov) });
  $("det").value = state.det; $("fov").value = state.fov;
  $("frames").replaceChildren(); $("archive-status").textContent = ""; $("refine").hidden = true;
  $("compare-row").hidden = true; $("legend").hidden = true;
  for (const c of ["play", "prev", "next", "m-blink", "m-compare", "m-diff"]) $(c).disabled = true;
  describe(); render();
  app.emit("target-loading");
  syncUrl();
  veil(t.loading, { busy: true });
  let data, res;
  try {
    const query = new URLSearchParams({ ra: state.ra, dec: state.dec, det: state.det, fov: state.fov, quality });
    const timeout = setTimeout(() => { if (!signal.aborted) { request.abort(); veil(t.failed, { retry: true }); } }, 150_000);
    try { res = await fetch(`/api/frames?${query}`, { signal }); if (res.ok) data = await res.json(); } finally { clearTimeout(timeout); }
    if (signal.aborted) return;
    if (res.status === 404) return veil(t.noData);
    if (!res.ok) return veil(t.failed, { retry: true });
  } catch { if (!signal.aborted) veil(t.failed, { retry: true }); return; }
  if (signal.aborted) return;
  frames = data.visits.map((v) => decode(v.data));
  state.grid = data.grid; state.pixelScale = data.arcsec_per_pixel;
  state.visits = data.visits.map(({ data, ...visit }) => visit);
  computeRange();
  if (target.comparison) {
    const sel = target.comparison.dates.map((d) => state.visits.findIndex((v) => v.date === d));
    if (sel.every((i) => i >= 0) && sel[0] !== sel[1]) { pair = sel; computeDifferenceRange(); }
  }
  $("frames").replaceChildren(...state.visits.map((v, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `${v.date}<small>${v.n_available ? t.used(v.n_images, v.n_available) : t.exposures(v.n_images)}</small>`;
    b.onclick = () => { setPlaying(false); if (state.mode !== "blink") setMode("blink"); showFrame(i); };
    return b;
  }));
  for (const [index, id] of ["dateA", "dateB"].entries()) {
    $(id).replaceChildren(...state.visits.map((v, i) => new Option(v.date, i)));
    $(id).value = pair[index];
  }
  for (const c of ["play", "prev", "next", "m-blink", "m-compare", "m-diff"]) $(c).disabled = frames.length < 2;
  $("m-blink").disabled = false;
  describe(data.n_skipped);
  const preview = data.quality === "preview";
  $("archive-status").textContent = [preview && t.preview, data.unavailable_collections?.length && t.partial].filter(Boolean).join(" ");
  $("refine").hidden = !preview;
  veil("");
  app.emit("target");
  const mode = frames.length > 1 && target.comparison ? target.comparison.mode : "blink";
  setMode(mode === "combine" ? "compare" : mode);
  if (mode === "blink") setPlaying(!reduced);
}

$("retry").onclick = () => loadTarget(state, activeQuality);
$("refine").onclick = () => loadTarget(state, "full");
$("play").onclick = () => { if (state.mode === "diff") setMode("blink"); setPlaying(!state.playing); };
$("prev").onclick = () => { setPlaying(false); if (state.mode !== "blink") setMode("blink"); showFrame((state.frameIndex - 1 + frames.length) % frames.length); };
$("next").onclick = () => { setPlaying(false); if (state.mode !== "blink") setMode("blink"); showFrame((state.frameIndex + 1) % frames.length); };
$("m-blink").onclick = () => setMode("blink");
$("m-compare").onclick = () => setMode("compare");
$("m-diff").onclick = () => setMode("diff");
$("adv-toggle").onclick = () => { const open = $("adv").hidden; $("adv").hidden = !open; $("adv-toggle").setAttribute("aria-expanded", String(open)); };
for (const [index, id] of ["dateA", "dateB"].entries()) {
  $(id).onchange = () => {
    const chosen = Number($(id).value);
    if (chosen === pair[1 - index]) { $(id).value = pair[index]; return; }
    pair[index] = chosen; computeDifferenceRange(); setMode(state.mode);
  };
}
$("speed").oninput = () => setPlaying(state.playing);
$("stretch").oninput = render;
$("det").onchange = () => loadTarget({ ra: state.ra, dec: state.dec, det: $("det").value, fov: state.fov });
$("fov").onchange = () => loadTarget({ ra: state.ra, dec: state.dec, det: state.det, fov: $("fov").value });
$("stage").addEventListener("keydown", (e) => {
  if (frames.length < 2) return;
  const c = { " ": "play", ArrowLeft: "prev", ArrowRight: "next", d: "m-diff", D: "m-diff" }[e.key];
  if (c) { e.preventDefault(); $(c).click(); }
  if (/^[1-6]$/.test(e.key)) { $("det").value = e.key; $("det").onchange(); }
});
$("canvas").addEventListener("click", (e) => {
  if (!state.visits.length) return;
  const box = e.currentTarget.getBoundingClientRect();
  const east = (0.5 - (e.clientX - box.left) / box.width) * state.fov;
  const north = (0.5 - (e.clientY - box.top) / box.height) * state.fov;
  selectTab("measure");
  app.emit("click", { ra: state.ra + east / 3600 / Math.cos((state.dec * Math.PI) / 180), dec: state.dec + north / 3600 });
});
function selectTab(name) {
  for (const n of ["target", "layers", "measure", "share"]) {
    $(`tab-${n}`).setAttribute("aria-selected", String(n === name));
    $(`pane-${n}`).hidden = n !== name;
  }
  if (name === "share") renderShare();
}
for (const n of ["target", "layers", "measure", "share"]) $(`tab-${n}`).onclick = () => selectTab(n);

// ---------------------------------------------------------------------------
// router
// ---------------------------------------------------------------------------
function placeWorkspace(slot) {
  const ws = $("ws");
  if (slot && ws.parentElement !== slot) slot.appendChild(ws);
}
function readRoute(search = location.search) {
  const p = new URLSearchParams(search);
  let view = p.get("view");
  if (!VIEWS.includes(view)) view = p.get("ra") && p.get("dec") ? "observations" : "home";
  return { view, p };
}
function show(view, p) {
  current = view;
  for (const v of VIEWS) $(`view-${v}`).hidden = v !== view;
  document.querySelectorAll(".menu a").forEach((a) => a.setAttribute("aria-current", a.dataset.link === view || (view === "target" && a.dataset.link === "targets") ? "page" : "false"));
  const el = $(`view-${view}`);
  const titles = { home: t.heroTitle, map: t.nav.map, targets: t.nav.targets, guide: t.nav.guide, credits: t.nav.credits, observations: t.open };
  if (view === "target") {
    const id = presetById(p.get("id")) ? p.get("id") : presets[0].id;
    if (el.dataset.id !== id) { renderTarget(el, id); el.dataset.id = id; hydrateBlinks(el); }
    placeWorkspace(el.querySelector("#ws-slot-target"));
    const pr = presetById(id);
    if (!sameField(pr)) loadTarget(pr); else describe();
    document.title = `${pr.name[LANG]} · Sky Revisit`;
  } else {
    if (!rendered[view]) {
      ({ home: renderHome, map: renderMap, targets: renderTargets, guide: renderGuide, credits: renderCredits, observations: (e) => { e.innerHTML = ""; } })[view](el);
      rendered[view] = true; hydrateBlinks(el);
    }
    document.title = `${titles[view]} · Sky Revisit`;
  }
  if (view === "observations") {
    placeWorkspace(el);
    const ra = parseFloat(p.get("ra")), dec = parseFloat(p.get("dec"));
    const target = Number.isFinite(ra) && Number.isFinite(dec)
      ? { ra, dec, det: p.get("det") || 2, fov: p.get("fov") || 150, comparison: ["diff", "combine", "compare"].includes(p.get("mode")) ? { mode: p.get("mode"), dates: [p.get("a"), p.get("b")] } : null }
      : (state.ra != null ? null : presets[0]);
    if (target && !sameField(target)) loadTarget(target);
    else { describe(); syncUrl(); }
  }
  $("nav").classList.toggle("solid", view !== "home" && view !== "target");
  $("menu").classList.remove("open");
  $("menu-toggle").setAttribute("aria-expanded", "false");
}
function navigate(view, extra = {}) {
  const p = new URLSearchParams({ view, ...extra, lang: LANG });
  if (view === "home") p.delete("view");
  history.pushState({}, "", `?${p}`);
  show(view, p);
  scrollTo({ top: 0, behavior: "instant" });
}
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-link]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  const url = new URL(a.href, location.href);
  const extra = Object.fromEntries(url.searchParams);
  delete extra.view; delete extra.lang;
  navigate(a.dataset.link, extra);
});
addEventListener("popstate", () => { const { view, p } = readRoute(); show(view, p); });
addEventListener("scroll", () => { if (current === "home" || current === "target") $("nav").classList.toggle("solid", scrollY > innerHeight * 0.6); }, { passive: true });
$("menu-toggle").onclick = () => { const open = !$("menu").classList.contains("open"); $("menu").classList.toggle("open", open); $("menu-toggle").setAttribute("aria-expanded", String(open)); };

// ---------------------------------------------------------------------------
// search with suggestions
// ---------------------------------------------------------------------------
const FAMOUS = ["Proxima Centauri", "Wolf 359", "Luhman 16", "61 Cygni", "Kapteyn's Star", "M42", "M31", "Vega"];
function suggestions(q) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const pres = presets.filter((p) => p.name[LANG].toLowerCase().includes(s) || p.aliases.some((a) => a.includes(s))).map((p) => ({ label: p.name[LANG], id: p.id }));
  const fam = FAMOUS.filter((f) => f.toLowerCase().includes(s)).map((f) => ({ label: f, q: f }));
  return [...pres, ...fam].slice(0, 6);
}
$("q").addEventListener("input", () => {
  const items = suggestions($("q").value);
  $("suggest").hidden = !items.length;
  $("suggest").innerHTML = items.map((it) => `<li role="option"><button type="button" data-id="${it.id || ""}" data-q="${esc(it.q || "")}">${esc(it.label)}</button></li>`).join("");
});
$("suggest").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  $("suggest").hidden = true;
  if (b.dataset.id) { $("q").value = ""; navigate("target", { id: b.dataset.id }); }
  else { $("q").value = b.dataset.q; $("search").requestSubmit(); }
});
document.addEventListener("click", (e) => { if (!e.target.closest("#search")) $("suggest").hidden = true; });
$("search").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = $("q").value.trim();
  if (!q) return;
  $("suggest").hidden = true;
  navigate("observations", state.ra != null ? { ra: state.ra, dec: state.dec, det: state.det, fov: state.fov } : {});
  setPlaying(false);
  veil(t.resolving, { busy: true });
  const { signal } = newRequest();
  try {
    const res = await fetch(`/api/resolve?${new URLSearchParams({ q })}`, { signal });
    if (signal.aborted) return;
    if (res.status === 404) return veil(t.notFound);
    if (!res.ok) return veil(t.nameDown);
    const target = await res.json();
    if (target.source === "preset") return navigate("target", { id: target.id });
    navigate("observations", { ra: target.ra, dec: target.dec, det: target.det || state.det || 2, fov: target.fov || 150 });
  } catch { if (!signal.aborted) veil(t.nameDown); }
});

// ---------------------------------------------------------------------------
// guide (non-blocking tips)
// ---------------------------------------------------------------------------
const TOUR_TARGETS = ["#q", ".nav-open.btn--primary", "#m-diff", "#tab-share"];
function tour(start = 0) {
  let i = start;
  const box = $("tour");
  const step = () => {
    document.querySelectorAll(".tour-target").forEach((x) => x.classList.remove("tour-target"));
    const target = document.querySelector(TOUR_TARGETS[i]);
    if (target && target.offsetParent) target.classList.add("tour-target");
    box.innerHTML = `<span class="mono">${String(i + 1).padStart(2, "0")} / 04</span><p>${t.tourSteps[i]}</p>
      <div class="row"><button type="button" data-skip>${t.skip}</button><button type="button" class="go" data-go>${i === 3 ? t.done : t.nextStep}</button></div>`;
    box.hidden = false;
    box.querySelector("[data-skip]").onclick = end;
    box.querySelector("[data-go]").onclick = () => { if (i === 3) return end(); i++; if (i === 2 && current !== "observations") navigate("observations"); step(); };
  };
  const end = () => { box.hidden = true; document.querySelectorAll(".tour-target").forEach((x) => x.classList.remove("tour-target")); try { localStorage.setItem("sr-tour", "1"); } catch {} };
  step();
}
$("tour-btn").onclick = () => tour(0);

// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------
async function start() {
  applyStaticText();
  renderLang();
  $("play").textContent = t.play;
  presets = await (await fetch("/api/targets")).json();
  renderFooter();
  const names = await (await fetch("/api/modules")).json();
  for (const name of names) {
    try { (await import(`./modules/${name}`)).init(app); } catch (e) { console.error(`module ${name} failed to load`, e); }
  }
  const { view, p } = readRoute();
  show(view, p);
  let seen = false;
  try { seen = localStorage.getItem("sr-tour") === "1"; } catch {}
  if (!seen && params.get("tour") !== "0" && params.get("embed") !== "1") setTimeout(() => tour(0), 1600);
}
start();
