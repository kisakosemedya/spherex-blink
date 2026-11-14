// SPHEREx Blink core: search, blink player, difference view, shared `app`
// object for the modules in frontend/modules/ (see ekip/00_ORTAK_BAGLAM.md).

const params = new URLSearchParams(location.search);
const LANG = params.get("lang") === "tr" ? "tr" : "en"; // English unless ?lang=tr
document.documentElement.lang = LANG;

const TEXT = {
  tr: {
    tagline: "Gökyüzünün aynı noktasına farklı tarihlerde bakın, neyin değiştiğini görün.",
    step1: "Bir cisim adı ya da koordinat yazın, ya da aşağıdaki örneklerden birini seçin.",
    step2: "Kareler art arda oynar. Yer değiştiren ya da parlaklığı değişen noktayı arayın.",
    step3: "Emin olamadıysanız “Neyin değiştiğini göster”e basın: sabit yıldızlar kaybolur.",
    searchLabel: "Gökyüzünde nereye bakalım?",
    searchButton: "Göster",
    searchHint: "Örnek: Barnard · 269.4462 4.7688 · 08h55m02.4s -07d14m32s",
    diffButton: "Neyin değiştiğini göster",
    combineButton: "İki ziyareti birleştir",
    dateA: "İlk tarih", dateB: "İkinci tarih",
    previous: "Önceki ziyaret", next: "Sonraki ziyaret",
    combineLegend: (a, b) => `${a} ve ${b} ziyaretlerinin ortalaması.`,
    diffLegend: (a, b) => `${b} eksi ${a}. <b class='new'>Turuncu</b>: ikinci karede daha parlak. <b class='old'>Mavi</b>: ilk karede daha parlak. Küçük farklar koyu görünür.`,
    stageLabel: "SPHEREx oynatıcı. Oynatmak için boşluk, ziyaret seçmek için ok tuşlarını kullanın.",
    speed: "Oynatma hızı", brightness: "Parlaklık", band: "Kızılötesi renk aralığı", fov: "Görüş alanı",
    play: "▶ Oynat", pause: "⏸ Durdur", share: "Bu görünümün bağlantısını kopyala", copied: "Bağlantı kopyalandı",
    exposures: (n) => `${n} poz`,
    loading: "SPHEREx görüntüleri getiriliyor…\nYeni bir bölge için bu bir iki dakika sürebilir.",
    resolving: "Konum aranıyor…",
    notFound: "Bu adı bulamadım. Koordinat yazmayı deneyin (örnek: 269.4462 4.7688).",
    nameDown: "Ad arama servisi şu an yanıt vermiyor. Koordinat yazmayı deneyin (örnek: 269.4462 4.7688).",
    noData: "SPHEREx bu noktayı bu renk aralığında henüz görüntülememiş. Başka bir renk aralığı deneyin.",
    failed: "Görüntüler şu an alınamıyor. Biraz sonra yeniden deneyin.",
    retry: "Yeniden dene",
    partial: "Bazı IRSA koleksiyonları yanıt vermedi. Görüntüler erişilebilen gözlemlerden oluşturuldu.",
    preview: "Önizleme · Ziyaret başına en fazla altı poz.",
    refine: "Daha fazla pozla birleştir",
    dataFrom: (used, available) => `${available} pozdan ${used} tanesi kullanıldı`,
    custom: "Seçtiğiniz bölge",
    customBlurb: "Kareler arasında yer değiştiren ya da parlaklığı değişen bir nokta arayın.",
    meta: (s) => `Sağ açıklık ${s.ra}°, dik açıklık ${s.dec}° · ${s.visits.length} ziyaret · piksel başına 3″ (teleskobun kendi pikseli yaklaşık 6″)`,
    skipped: (n) => ` · ${n} poz okunamadı`,
    credit: "Veri: NASA SPHEREx, NASA/IPAC Infrared Science Archive (IRSA). Bilinen yıldızlar: ESA Gaia DR3. NASA Space Apps Challenge 2026 için yapıldı.",
    otherLang: "English", north: "K", east: "D",
  },
  en: {
    tagline: "Look at the same patch of sky on different dates and see what changed.",
    step1: "Type an object name or coordinates, or pick one of the examples below.",
    step2: "The frames play in a loop. Look for a dot that moves or changes brightness.",
    step3: "Not sure? Press “Show what changed”: stars that stay the same disappear.",
    searchLabel: "Where in the sky shall we look?",
    searchButton: "Show",
    searchHint: "Example: Barnard · 269.4462 4.7688 · 08h55m02.4s -07d14m32s",
    diffButton: "Show what changed",
    combineButton: "Combine two visits",
    dateA: "First date", dateB: "Second date",
    previous: "Previous visit", next: "Next visit",
    combineLegend: (a, b) => `Mean of the ${a} and ${b} visits.`,
    diffLegend: (a, b) => `${b} minus ${a}. <b class='new'>Orange</b>: brighter in the second image. <b class='old'>Blue</b>: brighter in the first image. Small differences look dark.`,
    stageLabel: "SPHEREx player. Space plays or pauses. Arrow keys step through visits.",
    speed: "Playback speed", brightness: "Brightness", band: "Infrared colour range", fov: "Field of view",
    play: "▶ Play", pause: "⏸ Pause", share: "Copy a link to this view", copied: "Link copied",
    exposures: (n) => `${n} exposures`,
    loading: "Fetching SPHEREx images…\nA new region can take a minute or two.",
    resolving: "Looking up the position…",
    notFound: "I could not find that name. Try coordinates (example: 269.4462 4.7688).",
    nameDown: "The name service is not answering right now. Try coordinates (example: 269.4462 4.7688).",
    noData: "SPHEREx has not imaged this spot in this colour range yet. Try another range.",
    failed: "The images cannot be fetched right now. Please try again shortly.",
    retry: "Try again",
    partial: "Some IRSA collections did not respond. These images use the available observations.",
    preview: "Preview · Up to six exposures per visit.",
    refine: "Stack more exposures",
    dataFrom: (used, available) => `Used ${used} of ${available} exposures`,
    custom: "Your region",
    customBlurb: "Look for a dot that moves or changes brightness between frames.",
    meta: (s) => `Right ascension ${s.ra}°, declination ${s.dec}° · ${s.visits.length} visits · 3″ per pixel (the telescope's own pixel is about 6″)`,
    skipped: (n) => ` · ${n} exposures could not be read`,
    credit: "Data: NASA SPHEREx, NASA/IPAC Infrared Science Archive (IRSA). Known stars: ESA Gaia DR3. Built for the NASA Space Apps Challenge 2026.",
    otherLang: "Türkçe", north: "N", east: "E",
  },
};
const t = TEXT[LANG];
const BANDS = { 1: "0,75–1,09", 2: "1,10–1,62", 3: "1,63–2,41", 4: "2,42–3,82", 5: "3,83–4,41", 6: "4,42–5,00" };
const VB = 1000; // overlay viewBox size
const $ = (id) => document.getElementById(id);

// ---- shared app object ---------------------------------------------------
const handlers = {};
const state = {
  name: null, ra: null, dec: null, det: 2, fov: 150,
  visits: [], frameIndex: 0, grid: 50, mode: "blink", playing: false,
};
const app = {
  state,
  overlay: $("overlay"),
  loadTarget,
  pixelValue(visit, x, y) { return frames[visit]?.[y * state.grid + x]; },
  on(event, fn) { (handlers[event] ||= []).push(fn); },
  emit(event, arg) {
    for (const fn of handlers[event] || []) {
      try { fn(arg); } catch (e) { console.error(`module error on "${event}"`, e); }
    }
  },
  addPanel(id, title) {
    const box = document.createElement("section");
    box.className = "panel";
    box.id = `panel-${id}`;
    const h = document.createElement("h2");
    h.textContent = title;
    const body = document.createElement("div");
    box.append(h, body);
    $("panels").appendChild(box);
    return body;
  },
  skyToPixel(ra, dec) { // overlay units; north up, east left
    const k = VB / state.fov;
    const east = ((ra - state.ra + 540) % 360 - 180) * Math.cos((state.dec * Math.PI) / 180) * 3600;
    return { x: VB / 2 - east * k, y: VB / 2 - (dec - state.dec) * 3600 * k };
  },
};

let frames = [];     // Float32Array per visit, row 0 = south
let range = { hi: 1, floor: 0, top: 1 };
let pair = [0, 0];  // visits compared in the difference view
let presets = [];
let timer = null;
let activeRequest;
let activeQuality = "preview";

function newRequest() {
  activeRequest?.abort();
  activeRequest = new AbortController();
  return activeRequest;
}

// ---- static text ---------------------------------------------------------
for (const el of document.querySelectorAll("[data-t]")) if (typeof t[el.dataset.t] === "string") el.innerHTML = t[el.dataset.t];
for (const el of document.querySelectorAll("[data-t-label]")) el.setAttribute("aria-label", t[el.dataset.tLabel]);
$("lang").textContent = t.otherLang;
$("lang").onclick = () => {
  const p = new URLSearchParams(location.search);
  LANG === "en" ? p.set("lang", "tr") : p.delete("lang");
  location.search = p.toString();
};
$("det").replaceChildren(...Object.entries(BANDS).map(([d, range]) => {
  const o = document.createElement("option");
  o.value = d;
  o.textContent = `${LANG === "tr" ? range : range.replace(/,/g, ".")} µm`;
  return o;
}));
$("compass").innerHTML = `
  <g stroke="#ffd23f" stroke-width="3" fill="none" opacity=".8">
    <path d="M940 940 V860 M940 940 H860"/>
  </g>
  <g fill="#ffd23f" font-size="30" font-family="system-ui" opacity=".9">
    <text x="928" y="848">${t.north}</text><text x="826" y="951">${t.east}</text>
  </g>`;

// ---- rendering -----------------------------------------------------------
function percentile(values, p) {
  if (!values.length) return 1;
  values.sort((a, b) => a - b);
  return values[Math.min(values.length - 1, Math.floor(values.length * p))] || 1;
}

function computeRange() {
  const all = [];
  for (const f of frames) for (const v of f) if (Number.isFinite(v)) all.push(v);
  range.hi = Math.max(percentile(all, 0.997), 1e-6);
  // Compare the earliest and latest visits that have enough exposures: a
  // visit with only a few is too noisy and would drown the difference.
  const most = Math.max(...state.visits.map((v) => v.n_images), 1);
  const solid = state.visits.map((v, i) => (v.n_images >= 0.4 * most ? i : -1)).filter((i) => i >= 0);
  pair = solid.length > 1 ? [solid[0], solid[solid.length - 1]] : [0, frames.length - 1];
  computeDifferenceRange();
}

function computeDifferenceRange() {
  const d = [];
  const a = frames[pair[0]], b = frames[pair[1]];
  for (let i = 0; a && b && i < a.length; i++) {
    const v = b[i] - a[i];
    if (Number.isFinite(v)) d.push(Math.abs(v));
  }
  const sigma = 1.4826 * percentile(d, 0.5); // robust noise level of the difference
  range.floor = 2.5 * sigma;
  range.top = Math.max(percentile(d, 0.999), 8 * sigma, 1e-6);
}

function render() {
  const n = state.grid, canvas = $("canvas");
  if (canvas.width !== n) canvas.width = canvas.height = n;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(n, n);
  const gain = Math.pow(10, Number($("stretch").value) / 10); // slider: 0.1x .. 100x
  const diff = state.mode === "diff" && frames.length > 1;
  const combine = state.mode === "combine" && frames.length > 1;
  const cur = frames[state.frameIndex], first = frames[pair[0]], last = frames[pair[1]];
  for (let row = 0; row < n; row++) {
    const src = (n - 1 - row) * n; // flip: canvas row 0 is north
    for (let col = 0; col < n; col++) {
      const o = (row * n + col) * 4;
      let r, g, b;
      if (diff) {
        const v = last[src + col] - first[src + col];
        if (!Number.isFinite(v)) { r = g = b = 46; } else {
          // Below the noise floor a pixel stays dark; above it, it fades in.
          const m = Math.sqrt(Math.max(0, Math.min(1, ((Math.abs(v) - range.floor / gain) / Math.max(range.top - range.floor, 1e-6)) * gain)));
          if (v >= 0) { r = 14 + 241 * m; g = 16 + 154 * m; b = 22 + 18 * m; }
          else { r = 14 + 46 * m; g = 16 + 134 * m; b = 22 + 233 * m; }
        }
      } else if (!cur) { r = g = b = 0; } else {
        const v = combine ? (first[src + col] + last[src + col]) / 2 : cur[src + col];
        // A masked pixel might be saturated or outside valid coverage.
        const s = Number.isFinite(v) ? Math.sqrt(Math.max(0, Math.min(1, (v / range.hi) * gain))) : (combine ? 0.18 : 1);
        r = g = b = 255 * s;
      }
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function showFrame(i) {
  state.frameIndex = i;
  [...$("frames").children].forEach((b, j) => b.setAttribute("aria-pressed", String(j === i && state.mode === "blink")));
  render();
  const v = state.visits[i];
  const date = v?.date_start && v.date_start !== v.date_end ? `${v.date_start} to ${v.date_end}` : v?.date;
  $("frame-data").textContent = v ? [
    date,
    `D${state.det}`,
    v.n_available ? t.dataFrom(v.n_images, v.n_available) : t.exposures(v.n_images),
    v.releases?.join(" / "),
  ].filter(Boolean).join(" · ") : "";
  app.emit("frame", i);
}

function setPlaying(on) {
  state.playing = on && frames.length > 1 && state.mode === "blink";
  $("play").textContent = state.playing ? t.pause : t.play;
  clearInterval(timer);
  if (state.playing) {
    timer = setInterval(() => showFrame((state.frameIndex + 1) % frames.length), Number($("speed").value));
  }
}

function setMode(mode) {
  state.mode = mode;
  const comparing = mode !== "blink";
  $("diff").setAttribute("aria-pressed", String(mode === "diff"));
  $("combine").setAttribute("aria-pressed", String(mode === "combine"));
  $("compare").hidden = !comparing;
  $("diffLegend").hidden = !comparing;
  if (comparing) {
    const [a, b] = pair.map((index) => state.visits[index].date);
    $("diffLegend").innerHTML = mode === "diff" ? t.diffLegend(a, b) : t.combineLegend(a, b);
    setPlaying(false);
    showFrame(pair[1]);
  } else { showFrame(state.frameIndex); }
  syncUrl();
}

// ---- loading a target ----------------------------------------------------
function veil(text, retry = false) {
  $("veil").hidden = !text;
  $("veilText").innerText = text || "";
  $("retry").hidden = !retry;
}

function decode(b64) {
  const bin = atob(b64), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Float32Array(bytes.buffer);
}

function syncUrl() {
  const p = new URLSearchParams();
  p.set("ra", state.ra); p.set("dec", state.dec); p.set("det", state.det); p.set("fov", state.fov);
  if (state.mode !== "blink" && state.visits.length > 1) {
    p.set("mode", state.mode);
    p.set("a", state.visits[pair[0]].date);
    p.set("b", state.visits[pair[1]].date);
  }
  if (LANG === "tr") p.set("lang", "tr");
  history.replaceState(null, "", `?${p}`);
}

function describe(skipped) {
  const preset = presets.find((p) => p.ra === state.ra && p.dec === state.dec);
  state.targetId = preset?.id;
  state.name = preset ? preset.name[LANG] : t.custom;
  $("targetName").textContent = state.name;
  $("targetBlurb").textContent = preset ? preset.blurb[LANG] : t.customBlurb;
  $("targetMeta").textContent = t.meta(state) + (skipped ? t.skipped(skipped) : "");
  [...$("presets").children].forEach((b) => b.setAttribute("aria-pressed", String(preset && b.dataset.id === preset.id)));
}

async function loadTarget(target, quality = "preview") {
  const request = newRequest();
  const { signal } = request;
  activeQuality = quality;
  setPlaying(false);
  frames = [];
  Object.assign(state, { visits: [], frameIndex: 0, mode: "blink" });
  Object.assign(state, { ra: target.ra, dec: target.dec, det: Number(target.det ?? state.det), fov: Number(target.fov ?? state.fov) });
  $("det").value = state.det;
  $("fov").value = state.fov;
  $("frames").replaceChildren();
  $("archive-status").textContent = "";
  $("frame-data").textContent = "";
  $("refine").hidden = true;
  $("diff").setAttribute("aria-pressed", "false");
  $("combine").setAttribute("aria-pressed", "false");
  $("compare").hidden = true;
  $("diffLegend").hidden = true;
  for (const control of ["play", "prev", "next", "diff", "combine"]) $(control).disabled = true;
  describe();
  $("targetMeta").textContent = `RA ${state.ra}° · Dec ${state.dec}° · D${state.det}`;
  render();
  app.emit("target-loading");
  syncUrl();
  veil(t.loading);
  let data;
  try {
    const query = new URLSearchParams({ ra: state.ra, dec: state.dec, det: state.det, fov: state.fov, quality });
    const timeout = setTimeout(() => {
      if (signal.aborted) return;
      request.abort();
      veil(t.failed, true);
    }, 125_000);
    let res;
    try {
      res = await fetch(`/api/frames?${query}`, { signal });
      if (res.ok) data = await res.json();
    } finally {
      clearTimeout(timeout);
    }
    if (signal.aborted) return;
    if (res.status === 404) return veil(t.noData);
    if (!res.ok) return veil(t.failed, true);
  } catch (e) {
    if (!signal.aborted) veil(t.failed, true);
    return;
  }
  if (signal.aborted) return;
  frames = data.visits.map((v) => decode(v.data));
  state.grid = data.grid;
  state.pixelScale = data.arcsec_per_pixel;
  state.visits = data.visits.map(({ data, ...visit }) => visit);
  state.frameIndex = 0;
  state.mode = "blink";
  computeRange();
  if (target.comparison) {
    const selected = target.comparison.dates.map((date) => state.visits.findIndex((visit) => visit.date === date));
    if (selected.every((index) => index >= 0) && selected[0] !== selected[1]) {
      pair = selected;
      computeDifferenceRange();
    }
  }
  $("frames").replaceChildren(...state.visits.map((v, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = `${v.date} · ${t.exposures(v.n_images)}`;
    b.onclick = () => { setPlaying(false); if (state.mode !== "blink") setMode("blink"); showFrame(i); };
    return b;
  }));
  for (const [index, id] of ["dateA", "dateB"].entries()) {
    $(id).replaceChildren(...state.visits.map((visit, i) => new Option(visit.date, i)));
    $(id).value = pair[index];
  }
  for (const control of ["play", "prev", "next", "diff", "combine"]) $(control).disabled = frames.length < 2;
  describe(data.n_skipped);
  const preview = data.quality === "preview";
  $("archive-status").textContent = [preview && t.preview, data.unavailable_collections?.length && t.partial]
    .filter(Boolean).join(" ");
  $("refine").hidden = !preview;
  veil("");
  app.emit("target");
  const mode = frames.length > 1 && target.comparison ? target.comparison.mode : "blink";
  setMode(mode);
  setPlaying(mode === "blink");
}

// ---- controls ------------------------------------------------------------
$("search").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = $("q").value.trim();
  if (!q) return;
  const { signal } = newRequest();
  setPlaying(false);
  veil(t.resolving);
  try {
    const res = await fetch(`/api/resolve?${new URLSearchParams({ q })}`, { signal });
    if (signal.aborted) return;
    if (res.status === 404) return veil(t.notFound);
    if (!res.ok) return veil(t.nameDown);
    const target = await res.json();
    if (!signal.aborted) loadTarget(target);
  } catch (err) {
    if (!signal.aborted) veil(t.nameDown);
  }
});
$("retry").onclick = () => loadTarget(state, activeQuality);
$("refine").onclick = () => loadTarget(state, "full");
$("play").onclick = () => { if (state.mode !== "blink") setMode("blink"); setPlaying(!state.playing); };
$("prev").onclick = () => { setPlaying(false); if (state.mode !== "blink") setMode("blink"); showFrame((state.frameIndex - 1 + frames.length) % frames.length); };
$("next").onclick = () => { setPlaying(false); if (state.mode !== "blink") setMode("blink"); showFrame((state.frameIndex + 1) % frames.length); };
$("diff").onclick = () => setMode(state.mode === "diff" ? "blink" : "diff");
$("combine").onclick = () => setMode(state.mode === "combine" ? "blink" : "combine");
for (const [index, id] of ["dateA", "dateB"].entries()) {
  $(id).onchange = () => {
    const chosen = Number($(id).value);
    if (chosen === pair[1 - index]) {
      $(id).value = pair[index];
      return;
    }
    pair[index] = chosen;
    computeDifferenceRange();
    setMode(state.mode);
  };
}
$("speed").oninput = () => setPlaying(state.playing);
$("stretch").oninput = render;
$("det").onchange = () => loadTarget({ ra: state.ra, dec: state.dec, det: $("det").value, fov: state.fov });
$("fov").onchange = () => loadTarget({ ra: state.ra, dec: state.dec, det: state.det, fov: $("fov").value });
$("share").onclick = async () => {
  try { await navigator.clipboard.writeText(location.href); $("share").textContent = t.copied; }
  catch (e) { prompt("", location.href); }
  setTimeout(() => ($("share").textContent = t.share), 2000);
};
$("stage").addEventListener("keydown", (event) => {
  if (event.target !== $("stage") || frames.length < 2) return;
  const control = { " ": "play", ArrowLeft: "prev", ArrowRight: "next" }[event.key];
  if (control) {
    event.preventDefault();
    $(control).click();
  }
});
$("canvas").addEventListener("click", (e) => {
  if (!state.visits.length) return;
  const box = e.currentTarget.getBoundingClientRect();
  const east = (0.5 - (e.clientX - box.left) / box.width) * state.fov;
  const north = (0.5 - (e.clientY - box.top) / box.height) * state.fov;
  app.emit("click", {
    ra: state.ra + east / 3600 / Math.cos((state.dec * Math.PI) / 180),
    dec: state.dec + north / 3600,
  });
});

// ---- start ---------------------------------------------------------------
async function start() {
  $("play").textContent = t.play;
  presets = await (await fetch("/api/targets")).json();
  $("presets").replaceChildren(...presets.map((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.id = p.id;
    b.textContent = p.name[LANG];
    b.onclick = () => loadTarget(p);
    return b;
  }));
  // Every file in frontend/modules/ is a feature; one failing must not stop the rest.
  const names = await (await fetch("/api/modules")).json();
  for (const name of names) {
    try { (await import(`./modules/${name}`)).init(app); }
    catch (e) { console.error(`module ${name} failed to load`, e); }
  }
  const ra = parseFloat(params.get("ra")), dec = parseFloat(params.get("dec"));
  if (Number.isFinite(ra) && Number.isFinite(dec)) {
    const mode = params.get("mode");
    const comparison = ["diff", "combine"].includes(mode)
      ? { mode, dates: [params.get("a"), params.get("b")] } : null;
    loadTarget({ ra, dec, det: params.get("det") || 2, fov: params.get("fov") || 150, comparison });
  } else {
    loadTarget(presets[0]);
  }
}
start();
