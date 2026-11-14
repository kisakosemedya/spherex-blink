const TEXT = {
  en: {
    title: "Brightness over time",
    help: "Select a point in the image to measure another source.",
    flux: "Relative signal (% of first visit)",
    aperture: "Background-subtracted signal within 9″.",
    wings: "Masked core. Signal measured in the same 15″–30″ ring in every visit.",
    note: "Quick look. Visit stacks can sample different wavelengths within the same detector.",
    missing: "This point lacks enough shared, usable pixels or a positive reference signal.",
  },
  tr: {
    title: "Zaman içinde parlaklık",
    help: "Başka bir kaynağı ölçmek için görüntüden bir nokta seçin.",
    flux: "Göreli sinyal (ilk ziyaretin yüzdesi)",
    aperture: "Arka plan çıkarıldı. Sinyal 9″ yarıçap içinde ölçüldü.",
    wings: "Merkez maskeli. Sinyal her ziyarette aynı 15″–30″ halkasında ölçüldü.",
    note: "Ön inceleme. Ziyaret yığınları aynı dedektör içinde farklı dalga boylarını örnekleyebilir.",
    missing: "Bu noktada yeterli ortak piksel veya pozitif referans sinyali bulunamadı.",
  },
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2;
};

function measure(app, coordinates) {
  const { visits, grid, pixelScale } = app.state;
  const point = app.skyToPixel(coordinates.ra, coordinates.dec);
  const cx = point.x / 1000 * grid - 0.5;
  const cy = (1 - point.y / 1000) * grid - 0.5;
  const source = [];
  const wings = [];
  const localSky = [];
  const outerSky = [];
  let sourceTotal = 0;
  const extent = Math.ceil(45 / pixelScale);
  for (let y = Math.ceil(cy - extent); y <= Math.floor(cy + extent); y++) {
    for (let x = Math.ceil(cx - extent); x <= Math.floor(cx + extent); x++) {
      const distance = Math.hypot(x - cx, y - cy) * pixelScale;
      if (distance <= 9) sourceTotal++;
      if (x < 0 || y < 0 || x >= grid || y >= grid || distance > 45) continue;
      const values = visits.map((_, i) => app.pixelValue(i, x, y));
      if (!values.every(Number.isFinite)) continue;
      if (distance <= 9) source.push(values);
      if (distance >= 12 && distance <= 21) localSky.push(values);
      if (distance >= 15 && distance <= 30) wings.push(values);
      if (distance >= 33) outerSky.push(values);
    }
  }
  const useWings = source.length < 0.8 * sourceTotal;
  const pixels = useWings ? wings : source;
  const sky = useWings ? outerSky : localSky;
  if (pixels.length < 12 || sky.length < 12) return null;

  const fluxes = visits.map((_, i) => {
    const background = median(sky.map((values) => values[i]));
    return pixels.reduce((sum, values) => sum + values[i] - background, 0);
  });
  if (!(fluxes[0] > 0)) return null;
  return { useWings, relative: fluxes.map((flux) => 100 * flux / fluxes[0]) };
}

function draw(canvas, dates, relative) {
  const ctx = canvas.getContext("2d");
  const left = 48, right = canvas.width - 15, top = 16, bottom = canvas.height - 20;
  const min = Math.min(0, ...relative);
  const max = Math.max(100, ...relative);
  const times = dates.map((date) => Date.parse(date));
  const span = times.at(-1) - times[0];
  const x = (i) => left + (right - left) * (span > 0 ? (times[i] - times[0]) / span : i / (times.length - 1));
  const y = (v) => bottom - (v - min) / (max - min) * (bottom - top);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px system-ui";
  for (const tick of [min, 100, ...(max > 110 ? [max] : [])]) {
    ctx.fillStyle = "#9aa5b5";
    ctx.fillText(`${Math.round(tick)}%`, 1, y(tick) + 5);
    ctx.strokeStyle = "#2a3140";
    ctx.beginPath();
    ctx.moveTo(left, y(tick));
    ctx.lineTo(right, y(tick));
    ctx.stroke();
  }
  ctx.strokeStyle = "#4cc9f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  relative.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
  ctx.stroke();
  for (const [i, v] of relative.entries()) {
    ctx.beginPath();
    ctx.arc(x(i), y(v), 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#4cc9f0";
    ctx.fill();
  }
}

export function init(app) {
  const lang = document.documentElement.lang;
  const text = TEXT[lang] ?? TEXT.en;
  const panel = app.addPanel("lightcurve", text.title);
  const section = panel.closest("section");
  section.hidden = true;
  panel.innerHTML = `
    <p class="meta">${text.help}</p>
    <canvas class="lightcurve" width="430" height="110" role="img" aria-label="${text.flux}"></canvas>
    <ul class="lightcurve-values"></ul>
    <p class="meta" data-method></p>
    <p class="meta">${text.note}</p>`;
  const canvas = panel.querySelector("canvas");
  const list = panel.querySelector("ul");
  const method = panel.querySelector("[data-method]");
  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });

  function show(coordinates) {
    if (app.state.visits.length < 2) return;
    section.hidden = false;
    const result = measure(app, coordinates);
    canvas.hidden = !result;
    list.replaceChildren();
    method.textContent = result ? (result.useWings ? text.wings : text.aperture) : text.missing;
    if (!result) return;
    const dates = app.state.visits.map((visit) => visit.date);
    draw(canvas, dates, result.relative);
    for (const [index, value] of result.relative.entries()) {
      const item = document.createElement("li");
      item.textContent = `${dates[index]} · ${number.format(value)}%`;
      list.appendChild(item);
    }
  }

  app.on("target-loading", () => { section.hidden = true; });
  app.on("target", () => {
    if (["rwaur", "rdra"].includes(app.state.targetId)) show(app.state);
  });
  app.on("click", show);
}
