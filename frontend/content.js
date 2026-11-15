// Sky Revisit · all visible text, English first, Turkish second.
// Numbers in here come from the project's own measurements
// (showcase/neossat_barnard) or from the catalogue sources named next to them.

export const LANGS = ["en", "tr"];

export const T = {
  en: {
    nav: { map: "Sky map", targets: "Targets", guide: "How it works", credits: "Data & credits" },
    open: "Open observations", tour: "Guide", menu: "Menu", search: "Search a star or RA Dec",
    searchHint: "Barnard's Star · 269.45 4.69 · 17h57m48s +04d41m36s",
    langName: { en: "English", tr: "Türkçe" },

    heroLabel: "NASA SPHEREx · Space Apps 2026 · Planet X",
    heroTitle: "Explore the infrared sky.",
    heroText: "Choose a patch of sky and compare real SPHEREx observations across dates. What moves, brightens or fades stands out.",
    heroMeta: ["Data: NASA SPHEREx DR1 · QR3", "Stars: ESA Gaia DR3", "Archive: CSA NEOSSat", "Map: CDS Aladin Lite"],
    stripData: "SPHEREx DR1 · QR3",
    stripGuide: "How it works",
    mapCredit: "SPHEREx DR1 all-sky mosaic · NASA/JPL-Caltech/IPAC via IRSA · Aladin Lite (CDS)",

    s1Label: "The sky is not still",
    s1Lead: "Nearby stars and cold brown dwarfs creep across the sky.",
    s1Rest: " Since 2025 the SPHEREx telescope photographs the whole sky every six months in 102 infrared colours. Put two dates side by side and the movers give themselves away.",
    s1Caption: "Barnard's Star, 2019 → 2026. Canada's NEOSSat (optical) and NASA's SPHEREx (infrared) on one sky grid.",

    s2Label: "Three steps",
    steps: [
      ["Pick a field", "Search a name, type coordinates or click the sky map."],
      ["Blink the dates", "Each frame is one SPHEREx visit, six months apart, aligned north up."],
      ["See what changed", "The difference view erases everything that stayed the same."],
    ],

    s3Label: "Five test targets",
    s3Lead: "Five objects, five questions.",
    s3Rest: " The challenge asks every tool to show these. Open one and watch.",
    moves: "Moves", varies: "Varies",

    s4Label: "Proof",
    s4Lead: "We measured Barnard's Star with two telescopes.",
    s4Rest: " Canada's NEOSSat saw it in October 2019, NASA's SPHEREx in August 2026. Over 6.85 years it moved 71.2 arcseconds, exactly what ESA's Gaia catalogue predicts.",
    measured: "Measured", predicted: "Gaia DR3 prediction", years: "years apart",
    timeline: [
      ["1930", "Clyde Tombaugh finds Pluto by blinking two photographic plates taken six days apart.", "Lowell Observatory"],
      ["2019", "NEOSSat, the Canadian Space Agency's small telescope, images Barnard's Star in visible light.", "CSA · CADC"],
      ["2026", "SPHEREx sees the same star in the infrared, 71.2″ further north.", "NASA · IRSA"],
    ],
    method: "Method and data",

    s5Label: "Results",
    s5Lead: "What the five fields show.",
    s5Rest: " Measured values come from our own pipeline. Where we have not measured yet, we say so.",
    results: {
      barnard: ["71.2″", "shift in 6.85 years", "NEOSSat 2019 → SPHEREx 2026. Gaia DR3 predicts 71.2″."],
      wise0855: ["D6", "only at 4.4–5.0 µm", "Visible in the longest detector only. Motion not measured yet."],
      epsindb: ["4", "visits", "Drifts south-east across four visits. Motion not measured yet."],
      rwaur: ["3", "visits", "Stays in place, brightness changes. Light curve: click the star."],
      rdra: ["3", "visits", "Fades over the visits. Light curve: click the star."],
    },

    s6Label: "Meet SPHEREx",
    s6Lead: "One small telescope, 102 colours.",
    s6Rest: " NASA's SPHEREx maps the whole sky again and again in near-infrared light our eyes cannot see.",
    spherexStats: [["2025", "", "Launch year"], ["102", "", "Infrared colours"], ["0.75–5", "µm", "Wavelength range"], ["6", "months", "Per full-sky map"], ["6", "", "Detectors"], ["20", "cm", "Telescope"]],
    detectors: {
      1: "0.75–1.09 µm. Closest to visible light; ordinary stars are bright.",
      2: "1.10–1.62 µm. Stars at their brightest; good for moving stars.",
      3: "1.63–2.41 µm. Dust starts to fade, young stars stand out.",
      4: "2.42–3.82 µm. Water ice and the methane band near 3.3 µm.",
      5: "3.83–4.41 µm. Carbon dioxide ice near 4.27 µm.",
      6: "4.42–5.00 µm. Where the coldest brown dwarfs glow brightest.",
    },
    statSource: "Source: NASA/IPAC IRSA SPHEREx mission page",

    s7Label: "What you can do",
    features: [
      ["blink", "Blink", "Play the visits like a flip-book."],
      ["diff", "Difference", "Orange is newer, blue is older. Still stars vanish."],
      ["gaia", "Known stars", "Gaia DR3 circles move with each star to the date of the frame."],
      ["flags", "Suspect pixels", "The telescope's own quality flags, shown on the image."],
      ["curve", "Light curve", "Click a star to see its brightness at every visit."],
      ["share", "Share & embed", "Every view has a link with its coordinates."],
    ],

    s8Label: "Did you know?",
    s9Label: "Try it yourself",
    s9Title: "Pick any spot in the sky.",
    random: "Random field", coords: "Enter coordinates",
    s10Label: "Questions",

    closeLabel: "Get started",
    closeTitle: "Explore the sky.",
    closeText: "Every frame is a real SPHEREx observation. Find something that moves.",

    foot: {
      tag: "A time machine for the SPHEREx sky.",
      explore: "Explore", project: "Project", data: "Data", language: "Language",
      github: "GitHub", challenge: "Space Apps challenge",
      legal: "Not an official NASA website. Built for the NASA Space Apps Challenge 2026.",
    },

    // observation workspace
    tabs: { target: "Target", layers: "Layers", measure: "Measure", share: "Share" },
    blink: "Blink", compare: "Compare A/B", difference: "Difference",
    play: "Play", pause: "Pause", prev: "Previous visit", next: "Next visit",
    speed: "Speed", brightness: "Brightness", detector: "Detector", fov: "Field",
    advanced: "Advanced", dateA: "Date A", dateB: "Date B",
    diffLegend: (a, b) => `${b} minus ${a}. <b class="new">Orange</b>: brighter later. <b class="old">Blue</b>: brighter earlier. Unchanged sky goes dark.`,
    compareLegend: (a, b) => `${a} and ${b} side by side.`,
    exposures: (n) => `${n} exposures`,
    used: (u, a) => `${u} of ${a} exposures`,
    loading: "Looking up SPHEREx observations for this field…",
    resolving: "Looking up the position…",
    notFound: "We could not find that name. Try coordinates, e.g. 269.45 4.69.",
    nameDown: "The name service is not answering. Try coordinates, e.g. 269.45 4.69.",
    noData: "No observations for this field and detector. Try another detector.",
    failed: "The archive could not be reached. Try again.",
    retry: "Try again",
    partial: "Some archive collections did not respond.",
    preview: "Preview from available exposures.",
    refine: "Stack more exposures",
    custom: "Selected field", customBlurb: "Look for a dot that moves or changes brightness between frames.",
    skipped: (n) => `${n} exposures could not be read`,
    copy: "Copy link", copied: "Link copied", embed: "Copy embed code", report: "Copy a report",
    shareHelp: "The link opens this exact field, detector and comparison. Paste the report into an email or a forum post.",
    fullWorkspace: "Open full workspace",
    backToMap: "Back to map",
    measureHelp: "Click any star in the image to measure its brightness at every visit.",

    // map page
    mapLabel: "Sky map", mapTitle: "The whole sky, as SPHEREx sees it.",
    mapText: "Drag to move, scroll to zoom. Select a field, then open its observations.",
    layers: "Survey", wavelength: "Wavelength", highlights: "Highlights",
    hl: [["Starlight", 1.1], ["Water ice", 3.03], ["Methane", 3.3], ["CO₂ ice", 4.27], ["CO", 4.67]],
    selectCenter: "Select map center", selected: "Selected field",
    coordTab: "Coordinates", raHelp: "Right ascension: the sky's longitude, 0–360°.",
    decHelp: "Declination: the sky's latitude, −90° to +90°.", fovHelp: "Field width in arcseconds (60–600).",
    detHelp: "Detector: which slice of infrared light.", wiki: "Tip: copy the numbers from a star's Wikipedia page.",
    step: "Step one field", mapError: "The sky map could not load. Search by name or coordinates.",

    // targets page
    targetsLabel: "Targets", targetsTitle: "Five objects, five questions.",
    targetsText: "The challenge tests every tool on these five. Each has its own page with the observations, the numbers and what to look for.",
    table: { name: "Object", kind: "Type", dist: "Distance", pm: "Motion", det: "Best detector" },

    // target page
    lookFor: "What to look for", didYouKnow: "Did you know?", nextTarget: "Next target",
    statDist: "Distance", statPm: "Proper motion", statKind: "Type", statDet: "Best detector",
    perYear: "″ / yr", ly: "ly",

    // guide page
    guideLabel: "How it works", guideTitle: "The same sky, on different dates.",
    chapters: [
      ["The sky is not still", "Every star moves. Most are so far away that their motion takes lifetimes to notice. A few are close enough that a careful camera sees them shift from one year to the next. The way to catch them is old and simple: compare two pictures of the same sky."],
      ["How the blink is made", "For a chosen field we ask the NASA/IPAC archive for every SPHEREx exposure. We read only the small square we need, remove the background glow, and put every image on one north-up grid. Exposures from the same visit are stacked, so the noise drops and faint stars appear."],
      ["A camera with 102 colours", "SPHEREx's detectors sit behind filters whose colour changes from one edge to the other. As the sky drifts across, each star is measured in many colours. That is why the tool lets you pick a detector: the coldest brown dwarfs only shine in the longest one."],
      ["Reading the difference view", "Subtract an earlier visit from a later one. Anything that stayed the same turns dark. A star that moved leaves an orange spot where it is now and a blue spot where it was. A star that changed brightness lights up in one colour."],
      ["Is it real?", "Before calling something new, check three things: is it inside a suspect-pixel area, does Gaia already know it, and does it appear in more than one visit? Cosmic rays and ghosts appear once; real objects come back."],
      ["Could it find Planet X?", "A distant planet beyond Neptune only reflects sunlight, so it would be extremely faint, likely too faint for a single SPHEREx image. What this method does find well is the Sun's cold, nearby neighbours. Saying clearly what we cannot see is part of doing science."],
    ],

    // credits page
    creditsLabel: "Data & credits", creditsTitle: "Where every pixel comes from.",
    measuredBox: [["Measured", "Every image is a real SPHEREx exposure from NASA/IPAC IRSA. Barnard's Star's 71.2″ shift is our own measurement on NEOSSat and SPHEREx images."],
      ["Predicted", "Circles and the Gaia figure come from ESA Gaia DR3 positions moved to each date with their proper motion."],
      ["Not measured", "Values marked “not measured yet” are left empty on purpose instead of being estimated."]],
    sources: "Sources",
    aiNote: "AI use: code and text were written with AI coding assistants (Claude) and checked by the team by running them on real data.",
    ack: "This project makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration.",

    tourSteps: [
      "Search a star or click the map to choose a field.",
      "Open its observations: every frame is one SPHEREx visit.",
      "Press Difference: unchanged sky goes dark, movers stay.",
      "Found something? Share the exact view with a link.",
    ],
    skip: "Skip", nextStep: "Next", done: "Done",
    loadingFacts: "While the archive answers",
  },

  tr: {
    nav: { map: "Gökyüzü haritası", targets: "Hedefler", guide: "Nasıl çalışır", credits: "Veri ve kaynaklar" },
    open: "Gözlemleri aç", tour: "Rehber", menu: "Menü", search: "Yıldız adı ya da RA Dec ara",
    searchHint: "Barnard's Star · 269.45 4.69 · 17h57m48s +04d41m36s",
    langName: { en: "English", tr: "Türkçe" },

    heroLabel: "NASA SPHEREx · Space Apps 2026 · Planet X",
    heroTitle: "Kızılötesi gökyüzünü keşfet.",
    heroText: "Bir gökyüzü bölgesi seç, gerçek SPHEREx gözlemlerini farklı tarihlerde karşılaştır. Hareket eden, parlayan ya da sönen öne çıkar.",
    heroMeta: ["Veri: NASA SPHEREx DR1 · QR3", "Yıldızlar: ESA Gaia DR3", "Arşiv: CSA NEOSSat", "Harita: CDS Aladin Lite"],
    stripData: "SPHEREx DR1 · QR3",
    stripGuide: "Nasıl çalışır",
    mapCredit: "SPHEREx DR1 tüm gökyüzü mozaiği · NASA/JPL-Caltech/IPAC, IRSA · Aladin Lite (CDS)",

    s1Label: "Gökyüzü durmaz",
    s1Lead: "Yakın yıldızlar ve soğuk kahverengi cüceler gökyüzünde yavaşça kayar.",
    s1Rest: " SPHEREx teleskobu 2025’ten beri bütün gökyüzünü altı ayda bir, 102 kızılötesi renkte fotoğraflıyor. İki tarihi yan yana koyunca hareket edenler kendini ele verir.",
    s1Caption: "Barnard Yıldızı, 2019 → 2026. Kanada’nın NEOSSat’ı (optik) ve NASA’nın SPHEREx’i (kızılötesi) aynı gökyüzü ızgarasında.",

    s2Label: "Üç adım",
    steps: [
      ["Bir bölge seç", "Ad ara, koordinat yaz ya da gökyüzü haritasına tıkla."],
      ["Tarihleri oynat", "Her kare, altı ay arayla bir SPHEREx ziyareti; hepsi kuzey yukarı hizalı."],
      ["Neyin değiştiğini gör", "Fark görüntüsü aynı kalan her şeyi siler."],
    ],

    s3Label: "Beş test hedefi",
    s3Lead: "Beş cisim, beş soru.",
    s3Rest: " Yarışma her aracın bunları göstermesini istiyor. Birini aç ve izle.",
    moves: "Hareket ediyor", varies: "Parlaklığı değişiyor",

    s4Label: "Kanıt",
    s4Lead: "Barnard Yıldızı’nı iki teleskopla ölçtük.",
    s4Rest: " Kanada’nın NEOSSat’ı onu Ekim 2019’da, NASA’nın SPHEREx’i Ağustos 2026’da gördü. 6,85 yılda 71,2 yay saniyesi kaydı; ESA’nın Gaia kataloğunun öngördüğü değerin tam kendisi.",
    measured: "Ölçülen", predicted: "Gaia DR3 öngörüsü", years: "yıl arayla",
    timeline: [
      ["1930", "Clyde Tombaugh, altı gün arayla çekilmiş iki fotoğraf plakasını art arda çevirerek Plüton’u buldu.", "Lowell Gözlemevi"],
      ["2019", "Kanada Uzay Ajansı’nın küçük teleskobu NEOSSat, Barnard Yıldızı’nı görünür ışıkta görüntüledi.", "CSA · CADC"],
      ["2026", "SPHEREx aynı yıldızı kızılötesinde, 71,2″ daha kuzeyde gördü.", "NASA · IRSA"],
    ],
    method: "Yöntem ve veri",

    s5Label: "Sonuçlar",
    s5Lead: "Beş alan ne gösteriyor?",
    s5Rest: " Ölçülen değerler kendi veri hattımızdan geliyor. Henüz ölçmediğimiz yerde bunu açıkça yazıyoruz.",
    results: {
      barnard: ["71,2″", "6,85 yılda kayma", "NEOSSat 2019 → SPHEREx 2026. Gaia DR3 öngörüsü 71,2″."],
      wise0855: ["D6", "yalnızca 4,4–5,0 µm", "Yalnızca en uzun dalga boyunda görünür. Hareketi henüz ölçülmedi."],
      epsindb: ["4", "ziyaret", "Dört ziyarette güneydoğuya kayar. Hareketi henüz ölçülmedi."],
      rwaur: ["3", "ziyaret", "Yerinde durur, parlaklığı değişir. Işık eğrisi için yıldıza tıkla."],
      rdra: ["3", "ziyaret", "Ziyaretler boyunca söner. Işık eğrisi için yıldıza tıkla."],
    },

    s6Label: "SPHEREx ile tanış",
    s6Lead: "Küçük bir teleskop, 102 renk.",
    s6Rest: " NASA’nın SPHEREx’i bütün gökyüzünü, gözümüzün göremediği yakın kızılötesi ışıkta tekrar tekrar haritalıyor.",
    spherexStats: [["2025", "", "Fırlatma yılı"], ["102", "", "Kızılötesi renk"], ["0,75–5", "µm", "Dalga boyu aralığı"], ["6", "ay", "Bir tam gökyüzü haritası"], ["6", "", "Dedektör"], ["20", "cm", "Teleskop"]],
    detectors: {
      1: "0,75–1,09 µm. Görünür ışığa en yakın; sıradan yıldızlar parlak.",
      2: "1,10–1,62 µm. Yıldızlar en parlak hâlinde; hareket eden yıldızlar için iyi.",
      3: "1,63–2,41 µm. Toz sönmeye başlar, genç yıldızlar öne çıkar.",
      4: "2,42–3,82 µm. Su buzu ve 3,3 µm civarındaki metan bandı.",
      5: "3,83–4,41 µm. 4,27 µm civarında karbondioksit buzu.",
      6: "4,42–5,00 µm. En soğuk kahverengi cücelerin en parlak olduğu yer.",
    },
    statSource: "Kaynak: NASA/IPAC IRSA SPHEREx görev sayfası",

    s7Label: "Neler yapabilirsin",
    features: [
      ["blink", "Blink", "Ziyaretleri bir çevirmeli kitap gibi oynat."],
      ["diff", "Fark", "Turuncu yeni, mavi eski. Duran yıldızlar kaybolur."],
      ["gaia", "Bilinen yıldızlar", "Gaia DR3 daireleri her yıldızla birlikte karenin tarihine kayar."],
      ["flags", "Şüpheli pikseller", "Teleskobun kendi kalite işaretleri görüntünün üstünde."],
      ["curve", "Işık eğrisi", "Bir yıldıza tıkla, her ziyaretteki parlaklığını gör."],
      ["share", "Paylaş ve göm", "Her görünümün koordinatlı bir bağlantısı var."],
    ],

    s8Label: "Biliyor muydun?",
    s9Label: "Kendin dene",
    s9Title: "Gökyüzünde istediğin bir yeri seç.",
    random: "Rastgele alan", coords: "Koordinat gir",
    s10Label: "Sorular",

    closeLabel: "Başla",
    closeTitle: "Gökyüzünü keşfet.",
    closeText: "Her kare gerçek bir SPHEREx gözlemi. Hareket eden bir şey bul.",

    foot: {
      tag: "SPHEREx gökyüzü için bir zaman makinesi.",
      explore: "Keşfet", project: "Proje", data: "Veri", language: "Dil",
      github: "GitHub", challenge: "Space Apps görevi",
      legal: "Resmî bir NASA sitesi değildir. NASA Space Apps Challenge 2026 için yapıldı.",
    },

    tabs: { target: "Hedef", layers: "Katmanlar", measure: "Ölçüm", share: "Paylaş" },
    blink: "Blink", compare: "A/B karşılaştır", difference: "Fark",
    play: "Oynat", pause: "Durdur", prev: "Önceki ziyaret", next: "Sonraki ziyaret",
    speed: "Hız", brightness: "Parlaklık", detector: "Dedektör", fov: "Alan",
    advanced: "Gelişmiş", dateA: "Tarih A", dateB: "Tarih B",
    diffLegend: (a, b) => `${b} eksi ${a}. <b class="new">Turuncu</b>: sonra daha parlak. <b class="old">Mavi</b>: önce daha parlak. Değişmeyen gökyüzü koyulaşır.`,
    compareLegend: (a, b) => `${a} ve ${b} yan yana.`,
    exposures: (n) => `${n} poz`,
    used: (u, a) => `${a} pozdan ${u}`,
    loading: "Bu bölgenin SPHEREx gözlemleri aranıyor…",
    resolving: "Konum aranıyor…",
    notFound: "Bu ad bulunamadı. Koordinat dene, ör. 269.45 4.69.",
    nameDown: "Ad servisi yanıt vermiyor. Koordinat dene, ör. 269.45 4.69.",
    noData: "Bu bölge ve dedektör için gözlem bulunamadı. Başka bir dedektör dene.",
    failed: "Arşive ulaşılamadı. Tekrar dene.",
    retry: "Tekrar dene",
    partial: "Bazı arşiv koleksiyonları yanıt vermedi.",
    preview: "Mevcut pozlardan önizleme.",
    refine: "Daha fazla poz birleştir",
    custom: "Seçilen alan", customBlurb: "Kareler arasında yer değiştiren ya da parlaklığı değişen bir nokta ara.",
    skipped: (n) => `${n} poz okunamadı`,
    copy: "Bağlantıyı kopyala", copied: "Bağlantı kopyalandı", embed: "Gömme kodunu kopyala", report: "Rapor kopyala",
    shareHelp: "Bağlantı tam olarak bu alanı, dedektörü ve karşılaştırmayı açar. Raporu bir e-postaya ya da foruma yapıştırabilirsin.",
    fullWorkspace: "Tam çalışma alanını aç",
    backToMap: "Haritaya dön",
    measureHelp: "Her ziyaretteki parlaklığını ölçmek için görüntüde bir yıldıza tıkla.",

    mapLabel: "Gökyüzü haritası", mapTitle: "Bütün gökyüzü, SPHEREx’in gözünden.",
    mapText: "Sürükleyerek gez, tekerlekle yakınlaş. Bir alan seç, sonra gözlemlerini aç.",
    layers: "Tarama", wavelength: "Dalga boyu", highlights: "Öne çıkanlar",
    hl: [["Yıldız ışığı", 1.1], ["Su buzu", 3.03], ["Metan", 3.3], ["CO₂ buzu", 4.27], ["CO", 4.67]],
    selectCenter: "Harita merkezini seç", selected: "Seçilen alan",
    coordTab: "Koordinatlar", raHelp: "Sağ açıklık: gökyüzünün boylamı, 0–360°.",
    decHelp: "Dik açıklık: gökyüzünün enlemi, −90° ile +90° arası.", fovHelp: "Alan genişliği, yay saniyesi (60–600).",
    detHelp: "Dedektör: hangi kızılötesi renk aralığı.", wiki: "İpucu: sayıları yıldızın Wikipedia sayfasından kopyalayabilirsin.",
    step: "Bir alan kaydır", mapError: "Harita açılamadı. Hedef adı veya koordinatla ara.",

    targetsLabel: "Hedefler", targetsTitle: "Beş cisim, beş soru.",
    targetsText: "Yarışma her aracı bu beş cisimle sınıyor. Her birinin gözlemleri, sayıları ve ne aranacağıyla kendi sayfası var.",
    table: { name: "Cisim", kind: "Tür", dist: "Uzaklık", pm: "Hareket", det: "En iyi dedektör" },

    lookFor: "Ne aramalı", didYouKnow: "Biliyor muydun?", nextTarget: "Sonraki hedef",
    statDist: "Uzaklık", statPm: "Öz hareket", statKind: "Tür", statDet: "En iyi dedektör",
    perYear: "″ / yıl", ly: "ışık yılı",

    guideLabel: "Nasıl çalışır", guideTitle: "Aynı gökyüzü, farklı tarihler.",
    chapters: [
      ["Gökyüzü durmaz", "Her yıldız hareket eder. Çoğu o kadar uzaktır ki hareketini fark etmek ömürler alır. Birkaçı ise bir yıldan ötekine dikkatli bir kameranın göreceği kadar yakındır. Onları yakalamanın yolu eski ve basittir: aynı gökyüzünün iki fotoğrafını karşılaştırmak."],
      ["Blink nasıl yapılır", "Seçilen alan için NASA/IPAC arşivinden bütün SPHEREx pozlarını isteriz. Yalnızca gereken küçük kareyi okur, arka plan parıltısını çıkarır ve her görüntüyü kuzey yukarı tek bir ızgaraya koyarız. Aynı ziyaretin pozları üst üste konur; gürültü azalır, sönük yıldızlar belirir."],
      ["102 renkli bir kamera", "SPHEREx’in dedektörleri, rengi bir kenardan ötekine değişen filtrelerin arkasındadır. Gökyüzü kaydıkça her yıldız birçok renkte ölçülür. Bu yüzden araç dedektör seçtirir: en soğuk kahverengi cüceler yalnızca en uzun dalga boyunda parlar."],
      ["Fark görüntüsünü okumak", "Sonraki bir ziyaretten öncekini çıkar. Aynı kalan her şey koyulaşır. Hareket eden bir yıldız şimdiki yerinde turuncu, eski yerinde mavi bir leke bırakır. Parlaklığı değişen bir yıldız tek renkte parlar."],
      ["Gerçek mi?", "Bir şeye yeni demeden önce üç şeye bak: şüpheli piksel alanında mı, Gaia onu zaten biliyor mu, birden fazla ziyarette görünüyor mu? Kozmik ışınlar ve yansımalar bir kez görünür; gerçek cisimler geri gelir."],
      ["Planet X’i bulabilir mi?", "Neptün’ün ötesindeki uzak bir gezegen yalnızca güneş ışığını yansıtır; çok sönük olur, büyük olasılıkla tek bir SPHEREx görüntüsü için fazla sönük. Bu yöntemin iyi bulduğu şey Güneş’in soğuk, yakın komşularıdır. Göremediğimizi açıkça söylemek de bilimin parçası."],
    ],

    creditsLabel: "Veri ve kaynaklar", creditsTitle: "Her pikselin geldiği yer.",
    measuredBox: [["Ölçülen", "Her görüntü NASA/IPAC IRSA’dan gerçek bir SPHEREx pozudur. Barnard Yıldızı’nın 71,2″ kayması NEOSSat ve SPHEREx görüntüleri üzerinde kendi ölçümümüzdür."],
      ["Öngörülen", "Daireler ve Gaia değeri, ESA Gaia DR3 konumlarının öz hareketle her tarihe taşınmasından gelir."],
      ["Ölçülmedi", "“Henüz ölçülmedi” yazan değerler tahmin edilmek yerine bilerek boş bırakıldı."]],
    sources: "Kaynaklar",
    aiNote: "Yapay zekâ kullanımı: kod ve metinler yapay zekâ kodlama asistanlarıyla (Claude) yazıldı ve ekip tarafından gerçek veriyle çalıştırılarak kontrol edildi.",
    ack: "This project makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration.",

    tourSteps: [
      "Bir yıldız ara ya da haritaya tıklayarak bir alan seç.",
      "Gözlemlerini aç: her kare bir SPHEREx ziyareti.",
      "Fark’a bas: değişmeyen gökyüzü koyulaşır, hareket edenler kalır.",
      "Bir şey mi buldun? Görünümü bağlantıyla paylaş.",
    ],
    skip: "Geç", nextStep: "İleri", done: "Tamam",
    loadingFacts: "Arşiv yanıt verirken",
  },
};

// Per-target page content. Distances from Gaia DR3 parallaxes (Barnard 547 mas,
// Eps Indi B system ~276 mas) and the literature for WISE 0855 (~439 mas).
export const TARGET_INFO = {
  barnard: {
    tag: "moves", kind: { en: "Red dwarf (M4)", tr: "Kırmızı cüce (M4)" }, dist: "5.96", pm: "10.39",
    look: {
      en: "The crosshair never moves. Barnard's Star walks north away from it, about 1.7 SPHEREx pixels a year, while the distant stars stay frozen. Its core is too bright for the detector, so it shows as a flat white disc.",
      tr: "Artı işareti hiç kıpırdamaz. Barnard Yıldızı ondan kuzeye doğru, yılda yaklaşık 1,7 SPHEREx pikseli yürür; uzak yıldızlar donmuş gibi kalır. Merkezi dedektör için fazla parlak olduğundan düz beyaz bir disk gibi görünür.",
    },
    facts: {
      en: ["It is the fastest-moving star in our sky: about the width of the full Moon every 180 years.",
        "At about 6 light-years, only the Alpha Centauri stars are closer to the Sun.",
        "It is too faint to see without a telescope, even though it is so close.",
        "E. E. Barnard measured its record motion in 1916."],
      tr: ["Gökyüzümüzün en hızlı yıldızıdır: yaklaşık her 180 yılda bir dolunay genişliği kadar yol alır.",
        "Yaklaşık 6 ışık yılı uzaklıkta; Güneş’e yalnızca Alfa Centauri yıldızları daha yakın.",
        "Bu kadar yakın olmasına rağmen teleskopsuz görülemeyecek kadar sönüktür.",
        "Rekor hareketini 1916’da E. E. Barnard ölçtü."],
    },
  },
  wise0855: {
    tag: "moves", kind: { en: "Y-type brown dwarf", tr: "Y tipi kahverengi cüce" }, dist: "7.4", pm: "8.1",
    look: {
      en: "Switch to detector 6 (4.4–5.0 µm): a faint dot steps west between visits. In the shorter detectors it vanishes; an ordinary star next to it takes over.",
      tr: "Dedektör 6’ya geç (4,4–5,0 µm): sönük bir nokta ziyaretler arasında batıya adım atar. Daha kısa dedektörlerde kaybolur; yanındaki sıradan bir yıldız öne çıkar.",
    },
    facts: {
      en: ["It is the coldest brown dwarf known, about as cold as a winter day on Earth.",
        "Gaia cannot see it: it is almost dark in visible light.",
        "It was discovered in 2014 by comparing NASA WISE images taken at different times, the same idea as this tool."],
      tr: ["Bilinen en soğuk kahverengi cücedir; Dünya’da bir kış günü kadar soğuktur.",
        "Gaia onu göremez: görünür ışıkta neredeyse karanlıktır.",
        "2014’te NASA WISE’ın farklı zamanlarda çektiği görüntüler karşılaştırılarak bulundu; bu aracın fikriyle aynı."],
    },
  },
  epsindb: {
    tag: "moves", kind: { en: "Brown dwarf pair", tr: "Kahverengi cüce çifti" }, dist: "11.8", pm: "4.7",
    look: {
      en: "Use detector 6. Across four visits the dot drifts south-east. SPHEREx sees the two brown dwarfs as a single dot.",
      tr: "Dedektör 6’yı kullan. Dört ziyaret boyunca nokta güneydoğuya kayar. SPHEREx iki kahverengi cüceyi tek nokta olarak görür.",
    },
    facts: {
      en: ["Two brown dwarfs orbit each other, and the pair orbits the star Epsilon Indi A.",
        "It is one of the nearest brown dwarf systems to the Sun.",
        "Brown dwarfs are too small to burn hydrogen like the Sun; they slowly cool forever."],
      tr: ["İki kahverengi cüce birbirinin çevresinde döner, çift de Epsilon Indi A yıldızının çevresinde dolanır.",
        "Güneş’e en yakın kahverengi cüce sistemlerinden biridir.",
        "Kahverengi cüceler Güneş gibi hidrojen yakamayacak kadar küçüktür; sonsuza dek yavaşça soğurlar."],
    },
  },
  rwaur: {
    tag: "varies", kind: { en: "Young variable star", tr: "Genç değişen yıldız" }, dist: null, pm: null,
    look: {
      en: "It stays in place. Press Difference: the centre lights up in one colour because its brightness changed. Click the star for its light curve.",
      tr: "Yerinde durur. Fark’a bas: parlaklığı değiştiği için merkez tek renkte parlar. Işık eğrisi için yıldıza tıkla.",
    },
    facts: {
      en: ["It is a very young star still wrapped in gas and dust.",
        "Dust from its disc sometimes passes in front of it and dims it strongly.",
        "It has a close companion star about 1.5 arcseconds away."],
      tr: ["Hâlâ gaz ve tozla sarılı, çok genç bir yıldızdır.",
        "Diskindeki toz zaman zaman önünden geçer ve onu belirgin biçimde karartır.",
        "Yaklaşık 1,5 yay saniyesi ötede yakın bir eşi vardır."],
    },
  },
  rdra: {
    tag: "varies", kind: { en: "Mira variable", tr: "Mira değişeni" }, dist: null, pm: null,
    look: {
      en: "It does not move. Watch its brightness across the three visits, or click it for the light curve. Its core is saturated, so the curve is measured in the ring around it.",
      tr: "Hareket etmez. Üç ziyaret boyunca parlaklığını izle ya da ışık eğrisi için tıkla. Merkezi doygun olduğundan eğri çevresindeki halkada ölçülür.",
    },
    facts: {
      en: ["It is an old red giant that swells and shrinks in a cycle of about 246 days.",
        "Its visible brightness changes by more than a factor of 100 over one cycle.",
        "SPHEREx returns about every six months, so each visit catches it at a different phase."],
      tr: ["Yaklaşık 246 günlük bir döngüyle şişip büzülen yaşlı bir kırmızı devdir.",
        "Görünür parlaklığı bir döngüde 100 kattan fazla değişir.",
        "SPHEREx yaklaşık altı ayda bir döner; her ziyaret onu farklı bir evrede yakalar."],
    },
  },
};

export const FACTS = {
  en: ["SPHEREx launched in March 2025 together with NASA's PUNCH mission.",
    "Its telescope is only 20 cm across. Its power is in the colours: a spectrum for every point in the sky.",
    "Each detector sits behind a filter whose colour changes from one edge to the other.",
    "Stacking more exposures averages away the noise; the stars stay.",
    "Pluto was found in 1930 by blinking two photographs of the same sky.",
    "Many known brown dwarfs were found by volunteers comparing images, through projects like Backyard Worlds.",
    "One arcsecond is about the width of a coin seen from 4 km away.",
    "Gaia, an ESA mission, measured positions and motions for more than a billion stars."],
  tr: ["SPHEREx Mart 2025’te NASA’nın PUNCH göreviyle birlikte fırlatıldı.",
    "Teleskobu yalnızca 20 cm genişliğinde. Gücü renklerde: gökyüzünün her noktası için bir tayf.",
    "Her dedektör, rengi bir kenardan ötekine değişen bir filtrenin arkasında.",
    "Daha çok poz üst üste konunca gürültü ortalanıp kaybolur; yıldızlar kalır.",
    "Plüton 1930’da aynı gökyüzünün iki fotoğrafı art arda çevrilerek bulundu.",
    "Bilinen kahverengi cücelerin birçoğunu, Backyard Worlds gibi projelerde görüntü karşılaştıran gönüllüler buldu.",
    "Bir yay saniyesi, 4 km uzaktan görülen bir madeni paranın genişliği kadardır.",
    "ESA’nın Gaia görevi bir milyardan fazla yıldızın konumunu ve hareketini ölçtü."],
};

export const FAQ = {
  en: [["Why do the pictures look blocky?", "Each SPHEREx pixel covers about 6 arcseconds of sky. We show the real pixels instead of smoothing them, so nothing is invented."],
    ["Why does a star move between pictures?", "Nearby stars really move through space. The background stars are much further away, so in a few years they seem frozen."],
    ["Why is a bright star a flat white disc?", "It is too bright for the detector, which saturates. Its position is still reliable; its brightness is not."],
    ["What is Planet X?", "A proposed, still unseen planet far beyond Neptune. This tool cannot prove it exists, but the same method finds the Sun's cold neighbours."],
    ["What is a brown dwarf?", "An object between a planet and a star: too small to burn hydrogen, so it cools and glows mostly in the infrared."],
    ["Is this an official NASA website?", "No. It is a student project for the NASA Space Apps Challenge 2026, built on NASA's public data."]],
  tr: [["Görüntüler neden pikselli?", "Her SPHEREx pikseli gökyüzünün yaklaşık 6 yay saniyesini kaplar. Gerçek pikselleri yumuşatmadan gösteriyoruz; hiçbir şey uydurulmuyor."],
    ["Yıldız iki kare arasında neden kayıyor?", "Yakın yıldızlar uzayda gerçekten hareket eder. Arka plandaki yıldızlar çok daha uzakta olduğu için birkaç yılda donmuş gibi görünür."],
    ["Parlak yıldız neden düz beyaz bir disk?", "Dedektör için fazla parlaktır ve doyar. Konumu yine güvenilirdir; parlaklığı değil."],
    ["Planet X nedir?", "Neptün’ün çok ötesinde olduğu öne sürülen, henüz görülmemiş bir gezegen. Bu araç varlığını kanıtlayamaz ama aynı yöntem Güneş’in soğuk komşularını bulur."],
    ["Kahverengi cüce nedir?", "Gezegenle yıldız arasında bir cisim: hidrojen yakamayacak kadar küçüktür, soğur ve çoğunlukla kızılötesinde parlar."],
    ["Bu resmî bir NASA sitesi mi?", "Hayır. NASA’nın açık verisiyle NASA Space Apps Challenge 2026 için yapılmış bir öğrenci projesidir."]],
};

export const SOURCES = [
  ["NASA/IPAC IRSA · SPHEREx", "https://irsa.ipac.caltech.edu/Missions/spherex.html"],
  ["SPHEREx DR1 overview", "https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html"],
  ["ESA Gaia DR3", "https://www.cosmos.esa.int/web/gaia/dr3"],
  ["CSA NEOSSat open data", "https://data.asc-csa.gc.ca/dataset/neossat"],
  ["CADC", "https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/"],
  ["CDS Aladin Lite", "https://aladin.cds.unistra.fr/AladinLite/"],
  ["CDS Sesame", "https://cds.unistra.fr/cgi-bin/Sesame"],
  ["Barnard measurement: method", "https://github.com/kisakosemedya/spherex-blink/tree/main/showcase/neossat_barnard"],
  ["Source code", "https://github.com/kisakosemedya/spherex-blink"],
];
