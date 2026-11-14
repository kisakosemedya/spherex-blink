// Contamination flags overlay: tints pixels the SPHEREx pipeline marked as
// suspect. Loads only when switched on, because the first request for a new
// target can take over a minute. Uses only the shared `app` object.

const TEXT = {
  tr: {
    title: "Şüpheli pikseller",
    toggle: "Şüpheli pikselleri göster",
    help: "Teleskobun kendi yazılımı bazı pikselleri güvenilmez olarak işaretler. Boyalı bir bölgede gördüğünüz “yeni cisim” büyük olasılıkla gerçek değildir. Renk ne kadar koyuysa, o ziyaretin pozlarının o kadar çoğunda sorun var demektir.",
    loading: "İşaretler okunuyor. İlk seferde bir iki dakika sürebilir…",
    error: "İşaretlere şu an ulaşılamıyor. Sitenin geri kalanı çalışmaya devam ediyor.",
    clean: "Bu karede işaretli bölge yok.",
    missing: "Bu ziyaretle eşleşen bir kalite maskesi yok.",
    summary: (n, skipped) => `${n} poz incelendi` + (skipped ? `, ${skipped} poz okunamadı` : ""),
    pct: (p) => `alanın %${p}'i`,
  },
  en: {
    title: "Suspect pixels",
    toggle: "Show suspect pixels",
    help: "The telescope's own software marks some pixels as unreliable. A “new object” inside a tinted area is most likely not real. The stronger the tint, the more of that visit's exposures had the problem.",
    loading: "Reading flags. The first time can take a minute or two…",
    error: "Flags are unreachable right now. The rest of the site keeps working.",
    clean: "No flagged area in this frame.",
    missing: "No quality mask matches this visit.",
    summary: (n, skipped) => `${n} exposures checked` + (skipped ? `, ${skipped} could not be read` : ""),
    pct: (p) => `${p}% of the field`,
  },
};

const SVG_NS = "http://www.w3.org/2000/svg";

export function init(app) {
  const lang = (document.documentElement.lang || "tr").slice(0, 2) in TEXT
    ? (document.documentElement.lang || "tr").slice(0, 2) : "tr";
  const t = TEXT[lang];
  const panel = app.addPanel("flags", t.title);
  panel.innerHTML = `
    <label style="display:flex;gap:.5em;align-items:center;cursor:pointer">
      <input type="checkbox" data-flags-toggle> <span>${t.toggle}</span>
    </label>
    <p data-flags-status style="margin:.5em 0 0;min-height:1.2em"></p>
    <ul data-flags-legend style="list-style:none;margin:.5em 0 0;padding:0"></ul>
    <p style="margin:.5em 0 0;opacity:.75;font-size:.9em">${t.help}</p>`;
  const toggle = panel.querySelector("[data-flags-toggle]");
  const status = panel.querySelector("[data-flags-status]");
  const legend = panel.querySelector("[data-flags-legend]");

  const image = document.createElementNS(SVG_NS, "image");
  image.setAttribute("data-layer", "flags");
  image.setAttribute("preserveAspectRatio", "none");
  image.style.pointerEvents = "none";
  image.style.imageRendering = "pixelated";
  app.overlay.insertBefore(image, app.overlay.firstChild); // under star circles

  let data = null;      // response for the current target, or null
  let loadedKey = "";   // which target `data` belongs to
  let requestId = 0;

  const key = () => [app.state.ra, app.state.dec, app.state.det, app.state.fov].join("|");

  function draw() {
    const date = app.state.visits[app.state.frameIndex]?.date;
    const distance = (v) => Math.abs(Date.parse(v.date) - Date.parse(date)) / 86_400_000;
    const visit = date && data?.visits.reduce((best, current) => (
      distance(current) <= 30 && (!best || distance(current) < distance(best)) ? current : best
    ), null);
    if (!toggle.checked || !visit) {
      image.style.display = "none";
      legend.replaceChildren();
      if (toggle.checked && data && date) status.textContent = t.missing;
      return;
    }
    // Place the mask by its sky corners so it follows the core's projection.
    const { ra, dec, fov } = app.state;
    const half = fov / 2 / 3600;
    const dra = half / Math.cos((dec * Math.PI) / 180);
    const nw = app.skyToPixel(ra + dra, dec + half); // east is left, so +RA = left
    const se = app.skyToPixel(ra - dra, dec - half);
    image.setAttribute("x", Math.min(nw.x, se.x));
    image.setAttribute("y", Math.min(nw.y, se.y));
    image.setAttribute("width", Math.abs(se.x - nw.x));
    image.setAttribute("height", Math.abs(se.y - nw.y));
    image.setAttribute("href", visit.png);
    image.style.display = "";

    const rows = data.categories
      .filter((c) => visit.affected_percent[c.id] > 0)
      .map((c) => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex;gap:.5em;align-items:baseline;margin:.15em 0";
        const sw = document.createElement("span");
        sw.style.cssText = `flex:none;width:.8em;height:.8em;border-radius:2px;background:rgb(${c.color.join(",")})`;
        const label = document.createElement("span");
        label.textContent = `${c[lang]} · ${t.pct(visit.affected_percent[c.id])}`;
        li.append(sw, label);
        return li;
      });
    legend.replaceChildren(...rows);
    status.textContent = `${visit.date} · ${rows.length ? t.summary(visit.n_images, 0) : t.clean}`;
  }

  async function load() {
    const { ra, dec, det, fov } = app.state;
    if (ra == null || dec == null) return;
    const id = ++requestId;
    const k = key();
    status.textContent = t.loading;
    try {
      const res = await fetch(`/api/flags?${new URLSearchParams({ ra, dec, det, fov })}`);
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      if (id !== requestId) return; // a newer target was loaded meanwhile
      data = json;
      loadedKey = k;
      status.textContent = "";
    } catch (e) {
      if (id !== requestId) return;
      data = null;
      status.textContent = t.error;
    }
    draw();
  }

  function refresh() {
    if (!toggle.checked || !app.state.visits.length) return draw();
    if (data && loadedKey === key()) return draw();
    data = null;
    draw();
    load();
  }

  toggle.addEventListener("change", refresh);
  app.on("target-loading", () => {
    requestId++;
    data = null;
    status.textContent = "";
    draw();
  });
  app.on("target", refresh);
  app.on("frame", draw);
}
