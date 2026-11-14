// Gaia DR3 overlay: circles on known stars that move with the star from
// visit to visit. Uses only the shared `app` object (see ekip/00_ORTAK_BAGLAM.md).

const TEXT = {
  tr: {
    title: "Bilinen yıldızlar (Gaia)",
    toggle: "Bilinen yıldızları işaretle",
    help: "Dairesi olan nokta bilinen bir yıldızdır. Hareket ettiği hâlde dairesi olmayan nokta ilginçtir. Çok soğuk cisimler görünür ışıkta sönük olduğu için Gaia'da bulunmayabilir.",
    loading: "Gaia kataloğu sorgulanıyor…",
    count: (n, fast) => `${n} bilinen yıldız` + (fast ? `, ${fast} tanesi gözle görülür hızda hareket ediyor (sarı)` : ""),
    none: "Bu alanda Gaia'da kayıtlı yıldız yok.",
    error: "Gaia kataloğuna şu an ulaşılamıyor. Sitenin geri kalanı çalışmaya devam ediyor.",
    tip: (g, pm) => `Gaia yıldızı · parlaklık G=${g ?? "?"} · yılda ${pm}″ hareket`,
  },
  en: {
    title: "Known stars (Gaia)",
    toggle: "Mark known stars",
    help: "A dot with a circle is a known star. A dot that moves but has no circle is interesting. Very cold objects are faint in visible light, so Gaia may not list them.",
    loading: "Querying the Gaia catalogue…",
    count: (n, fast) => `${n} known stars` + (fast ? `, ${fast} moving fast enough to see (yellow)` : ""),
    none: "Gaia lists no stars in this field.",
    error: "The Gaia catalogue is unreachable right now. The rest of the site keeps working.",
    tip: (g, pm) => `Gaia star · brightness G=${g ?? "?"} · moves ${pm}″ per year`,
  },
};

const SVG_NS = "http://www.w3.org/2000/svg";
const FAST_PM = 0.5; // arcsec/yr: above this the motion is visible in SPHEREx

export function init(app) {
  const t = TEXT[(document.documentElement.lang || "tr").slice(0, 2)] || TEXT.tr;
  const panel = app.addPanel("gaia", t.title);
  panel.innerHTML = `
    <label style="display:flex;gap:.5em;align-items:center;cursor:pointer">
      <input type="checkbox" data-gaia-toggle checked> <span>${t.toggle}</span>
    </label>
    <p data-gaia-status style="margin:.5em 0 0;min-height:1.2em"></p>
    <p style="margin:.5em 0 0;opacity:.75;font-size:.9em">${t.help}</p>`;
  const toggle = panel.querySelector("[data-gaia-toggle]");
  const status = panel.querySelector("[data-gaia-status]");

  const layer = document.createElementNS(SVG_NS, "g");
  layer.setAttribute("data-layer", "gaia");
  layer.style.pointerEvents = "none";
  app.overlay.appendChild(layer);

  let stars = [];
  let requestId = 0;

  function draw() {
    layer.replaceChildren();
    if (!toggle.checked) return;
    const i = Math.min(app.state.frameIndex || 0, (app.state.visits || []).length - 1);
    for (const s of stars) {
      const p = s.positions[Math.max(i, 0)];
      if (!p) continue;
      const { x, y } = app.skyToPixel(p.ra, p.dec);
      const c = document.createElementNS(SVG_NS, "circle");
      const fast = s.pm_arcsec_yr >= FAST_PM;
      c.setAttribute("cx", x);
      c.setAttribute("cy", y);
      c.setAttribute("r", fast ? 14 : 9);
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", fast ? "#ffd23f" : "#4cc9f0");
      c.setAttribute("stroke-width", fast ? 2 : 1.25);
      c.style.pointerEvents = "stroke";
      const tip = document.createElementNS(SVG_NS, "title");
      tip.textContent = t.tip(s.g_mag, s.pm_arcsec_yr);
      c.appendChild(tip);
      layer.appendChild(c);
    }
  }

  async function load() {
    const { ra, dec, fov, visits } = app.state;
    const id = ++requestId;
    stars = [];
    draw();
    if (ra == null || dec == null || !visits || !visits.length) return;
    status.textContent = t.loading;
    try {
      const q = new URLSearchParams({ ra, dec, fov, dates: visits.map((v) => v.date).join(",") });
      const res = await fetch(`/api/gaia?${q}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (id !== requestId) return; // a newer target was loaded meanwhile
      stars = data.stars;
      const fast = stars.filter((s) => s.pm_arcsec_yr >= FAST_PM).length;
      status.textContent = stars.length ? t.count(stars.length, fast) : t.none;
    } catch (e) {
      if (id !== requestId) return;
      status.textContent = t.error;
    }
    draw();
  }

  toggle.addEventListener("change", draw);
  app.on("target-loading", () => {
    requestId++;
    stars = [];
    status.textContent = "";
    draw();
  });
  app.on("target", load);
  app.on("frame", draw);
  if (app.state.visits && app.state.visits.length) load();
}
