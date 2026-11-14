const ROOT = "/showcase/barnard";
const METHOD = "https://github.com/kisakosemedya/spherex-blink/tree/main/showcase/neossat_barnard";
const TEXT = {
  en: {
    title: "Barnard’s Star across two missions",
    image: "Barnard’s Star in aligned NEOSSat and SPHEREx images",
    measured: (m, y, g) => `Measured: ${m}″ in ${y} years · Gaia DR3 prediction: ${g}″`,
    context: "NEOSSat (CSA), optical, 18 Oct 2019 · SPHEREx (NASA), near-infrared, 26 Aug 2026. Both images share a sky grid for comparing position.",
    method: "Method and source data",
    blink: "Animated comparison",
  },
  tr: {
    title: "İki görevde Barnard Yıldızı",
    image: "Hizalanmış NEOSSat ve SPHEREx görüntülerinde Barnard Yıldızı",
    measured: (m, y, g) => `Ölçülen: ${y} yılda ${m}″ · Gaia DR3 öngörüsü: ${g}″`,
    context: "NEOSSat (CSA), optik, 18 Ekim 2019 · SPHEREx (NASA), yakın kızılötesi, 26 Ağustos 2026. Konum karşılaştırması için iki görüntü aynı gökyüzü ızgarasında.",
    method: "Yöntem ve kaynak veriler",
    blink: "Hareketli karşılaştırma",
  },
};

export function init(app) {
  const lang = document.documentElement.lang;
  const text = TEXT[lang] ?? TEXT.en;
  const panel = app.addPanel("barnard", text.title);
  const section = panel.closest("section");
  section.hidden = true;
  let requested = false;

  function update() {
    section.hidden = app.state.targetId !== "barnard";
    if (section.hidden || requested) return;
    requested = true;
    panel.innerHTML = `
      <a href="${ROOT}/comparison.png"><img class="comparison" src="${ROOT}/comparison.png" alt="${text.image}" loading="lazy"></a>
      <p data-measurement></p>
      <p class="meta">${text.context}</p>
      <p class="meta"><a href="${ROOT}/blink.gif">${text.blink}</a> · <a href="${METHOD}">${text.method}</a></p>`;
    fetch(`${ROOT}/summary.json`).then((response) => {
      if (response.ok) return response.json();
    }).then((data) => {
      if (!data) return;
      const number = (n, digits) => n.toLocaleString(lang, {
        minimumFractionDigits: digits, maximumFractionDigits: digits,
      });
      panel.querySelector("[data-measurement]").textContent = text.measured(
        number(data.measured_arcsec, 1), number(data.years, 2), number(data.gaia_arcsec, 1),
      );
    }).catch(() => { /* The image and source link remain available. */ });
  }

  app.on("target-loading", update);
}
