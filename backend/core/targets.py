"""The five challenge test targets. Positions are for 2026 (fast movers were
propagated with their proper motion) and were checked against SPHEREx data
and the ESA Gaia archive on 2026-11-14."""

TARGETS = [
    {
        "id": "barnard", "ra": 269.4462, "dec": 4.7688, "det": 2, "fov": 150,
        "aliases": ["barnard", "barnard's star", "barnards star", "barnard yıldızı", "gj 699"],
        "name": {"tr": "Barnard Yıldızı", "en": "Barnard's Star"},
        "blurb": {
            "tr": "Gökyüzünde en hızlı yer değiştiren yıldız. Bir yılda yaklaşık 10 yay saniyesi kuzeye kayar; kareler arasında yukarı doğru adım attığını görürsünüz.",
            "en": "The fastest-moving star in the sky. It drifts about 10 arcseconds north per year; watch it step upward between frames.",
        },
    },
    {
        "id": "wise0855", "ra": 133.7598, "dec": -7.2422, "det": 6, "fov": 150,
        "aliases": ["wise 0855", "wise0855", "wise 0855-0714", "wise j085510.83-071442.5"],
        "name": {"tr": "WISE 0855", "en": "WISE 0855"},
        "blurb": {
            "tr": "Bilinen en soğuk kahverengi cüce. Yalnızca en uzun dalga boyunda (4,4–5,0 µm) görünür ve batıya kayar. Renk aralığını 1,10–1,62 µm yapın: o kaybolur, yanındaki sıradan yıldız ortaya çıkar.",
            "en": "The coldest known brown dwarf. It shows only at the longest wavelengths (4.4–5.0 µm) and drifts west. Switch to 1.10–1.62 µm: it vanishes and an ordinary star next to it appears.",
        },
    },
    {
        "id": "epsindb", "ra": 331.0961, "dec": -56.8010, "det": 6, "fov": 200,
        "aliases": ["eps ind b", "epsilon indi b", "eps indi b", "epsilon ind b"],
        "name": {"tr": "Epsilon Indi B", "en": "Epsilon Indi B"},
        "blurb": {
            "tr": "Yakın bir yıldızın çevresinde dolanan iki kahverengi cüce; SPHEREx onları tek nokta olarak görür. Dört ziyarette güneydoğuya doğru kayar.",
            "en": "Two brown dwarfs orbiting a nearby star; SPHEREx sees them as one dot. Over four visits it drifts south-east.",
        },
    },
    {
        "id": "rwaur", "ra": 76.9561, "dec": 30.4012, "det": 3, "fov": 150,
        "aliases": ["rw aur", "rw aurigae"],
        "name": {"tr": "RW Aurigae", "en": "RW Aurigae"},
        "blurb": {
            "tr": "Genç bir yıldız. Yerinde durur ama parlaklığı düzensiz değişir; fark görüntüsünde merkezin renklendiğini görürsünüz.",
            "en": "A young star. It stays put but its brightness changes irregularly; the difference view lights up at the centre.",
        },
    },
    {
        "id": "rdra", "ra": 248.1674, "dec": 66.7550, "det": 2, "fov": 150,
        "aliases": ["r dra", "r draconis"],
        "name": {"tr": "R Draconis", "en": "R Draconis"},
        "blurb": {
            "tr": "Aylar içinde büyüyüp küçülen yaşlı bir yıldız. Üç ziyarette parlaklığı yarıdan aşağı düşer. Çok parlak olduğu için merkezi doygun (beyaz) görünür.",
            "en": "An old star that swells and shrinks over months. Across three visits it fades to less than half. It is so bright that its core is saturated (white).",
        },
    },
]


def find_preset(text):
    t = " ".join(text.lower().split())
    for target in TARGETS:
        if t == target["id"] or t in target["aliases"]:
            return target
    return None
