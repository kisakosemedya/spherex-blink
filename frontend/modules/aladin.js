const ALADIN = "https://cdn.jsdelivr.net/npm/aladin-lite@3.8.2/dist/aladin.js";
const SURVEY = "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube";
// The base slice in the DR1 display cube can be blank in Aladin. Select an
// interior channel via the frequency-indexed viewer API.
const MAP_FREQUENCY_HZ = 196e12;

const TEXT = {
  en: {
    title: "Sky map",
    survey: "SPHEREx DR1 all-sky mosaic",
    load: "Load this field",
    error: "The sky map is unavailable. Use the coordinate search to load a field.",
  },
  tr: {
    title: "Gökyüzü haritası",
    survey: "SPHEREx DR1 tüm gökyüzü mozaiği",
    load: "Bu alanı yükle",
    error: "Gökyüzü haritası kullanılamıyor. Alanı koordinat aramasıyla açabilirsiniz.",
  },
};

export function init(app) {
  const text = TEXT[document.documentElement.lang] ?? TEXT.en;
  const container = document.getElementById("map-panel");
  container.innerHTML = `
    <section class="panel">
      <h2>${text.title}</h2>
      <p class="meta"><a href="${SURVEY}/properties">${text.survey}</a></p>
      <div class="sky-map-wrap"><div id="sky-map"></div></div>
      <p class="meta" data-map-position></p>
      <button type="button" disabled>${text.load}</button>
    </section>`;
  const position = container.querySelector("[data-map-position]");
  const button = container.querySelector("button");

  async function showMap() {
    const { default: A } = await import(ALADIN);
    await A.init;
    container.querySelector("#sky-map").addEventListener("AL:Layer.added", (event) => {
      event.detail?.layer?.setFrequency({ value: MAP_FREQUENCY_HZ, unit: "Hz" });
    }, { once: true });
    const aladin = A.aladin("#sky-map", {
      survey: SURVEY, cooFrame: "ICRSd", fov: 2, showCooGridControl: true,
      showSimbadPointerControl: true, showFullscreenControl: true,
    });

    function updatePosition() {
      const [ra, dec] = aladin.getRaDec();
      position.textContent = `RA ${ra.toFixed(5)}° · Dec ${dec.toFixed(5)}° · ${app.state.fov}″`;
    }

    function goToTarget() {
      const { ra, dec } = app.state;
      if (ra != null && dec != null) aladin.gotoRaDec(ra, dec);
      updatePosition();
    }

    aladin.on("positionChanged", updatePosition);
    app.on("target-loading", goToTarget);
    goToTarget();
    button.disabled = false;
    button.onclick = () => {
      const [ra, dec] = aladin.getRaDec();
      app.loadTarget({ ra: Number(ra.toFixed(5)) % 360, dec: Number(dec.toFixed(5)) });
    };
  }

  showMap().catch(() => {
    container.querySelector(".sky-map-wrap").hidden = true;
    button.hidden = true;
    position.textContent = text.error;
  });
}
