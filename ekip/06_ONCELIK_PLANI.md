# Önceliklendirme planı (öneri)

Bu bir **öneridir**; ekipçe tartışılıp kesinleşecek. Saatler başlangıçtan itibaren yazıldı (S+0, S+4 …) ve yaklaşık 20 saat kaldığı varsayıldı. Gerçek teslim saatine göre kaydırın.

## Durum güncellemesi (commit `1cd3061` sonrası)

Plan yazıldıktan sonra `main`'e çalışan site geldi. Aşağıdaki kişi kişi plan bu yüzden kısmen geride kaldı; güncel öncelik şu:

**Bitmiş görünenler:** blink oynatıcı, fark görüntüsü, dedektör ve görüş alanı seçimi, paylaşılabilir adres, TR/EN metin, beş hedefin önceden indirilmiş verisi (`data/presets/`), Gaia DR3 katmanı (öz hareketli), kirlenme bayrakları katmanı. WISE 0855 merkezi düzeltilmiş (133.7598, −7.2422).

**Kalan işler, öncelik sırasıyla:**
1. **Yayına alma (K1, en kritik).** Site henüz yalnızca yerelde çalışıyor. Python arka ucu için ör. Hugging Face Spaces (Docker) ya da Render. Yayına alınamazsa yedek: `data/presets/` dosyalarını okuyan statik bir sürüm (GitHub Pages).
2. **Işık eğrisi (K2).** RW Aur ve R Dra zorunlu hedefler ve hareket etmiyorlar; parlaklık değişimini göstermek için gerekli.
3. **Poz modu (K2).** Ziyaret içindeki pozları tek tek oynatmak; "küçük video" isteğini üç kareden çok daha iyi karşılar.
4. **Sahte renk (K2)** ve **anlık spektrum (K3, "ekstra övgü")**.
5. **Sunum malzemeleri.** Video, özet, kullanıcı testi; Kişi 5 baştan paralel.

Gaia ve bayraklar bittiği için Kişi 4 yayına alma ya da poz moduna kaydırılabilir.

## Temel kural: üç kademe

| Kademe | İçerik | Bitmesi gereken saat |
|---|---|---|
| **K1: Mutlaka** | Blink oynatıcı, fark görüntüsü, beş hazır hedef (önceden üretilmiş), adres çubuğunda koordinat, yayında bir adres | S+8 |
| **K2: Fark yaratan** | Işık eğrisi, Gaia katmanı, poz modu, sahte renk | S+14 |
| **K3: Bonus** | Anlık spektrum, kirlenme bayrakları, canlı koordinat sorgusu | S+17 |
| **Dondurma** | Yeni özellik yok; yalnızca hata düzeltme, video ve metin | S+17 sonrası |

**Kesme kuralı:** Kendi saatinde Barnard Yıldızı ile çalışmayan modül kesilir; o kişi K1'e destek verir. Yarım kalan özellik ne siteye ne videoya girer.

**Statik önce:** Demo canlı arşive bağlı olmamalı (TAP sorgusu ~20 sn, yeni koordinat 45–90 sn, IRSA kesit servisi 503 veriyor). Beş hedefin verisi önceden üretilip site içinde statik dosya olarak durur; canlı arka uç sonradan eklenen bir bonustur.

## Kişi kişi plan

### Kişi 1: Çekirdek ve birleştirme (kritik yol)
- **S+0–2:** İskelet. `index.html` + `app.js`; `app` nesnesi (`state`, `on`, `addPanel`, `overlay`, `skyToPixel`) sabit üç PNG ile çalışsın. Hemen GitHub Pages'te yayına alınsın ve ekibe "buna takın" denilsin.
- **S+2–6:** Oynatıcı (oynat/durdur, hız), fark düğmesi, dedektör seçici, parlaklık kaydırıcısı, `?ra=&dec=&det=` adres parametreleri.
- **S+6–8:** Kişi 2'nin statik verilerini bağla. **K1 biter.**
- **S+8 sonrası:** Modülleri birleştir; zaman kalırsa canlı arka uç.

### Kişi 2: Önce statik veri üretimi, sonra ışık eğrisi
(`02_ISIK_EGRISI.md` görevine ek olarak; K1'in en kritik halkası budur.)
- **S+0–3:** Koordinatları doğrula (özellikle WISE 0855; aşağıya bakın). `proof/make_frames.py`'yi genişlet: beş hedef × altı dedektör için ziyaret başına PNG, fark PNG'si, ortak parlaklık ölçeği ve JSON. Poz modu için ziyaret başına tek tek poz PNG'leri de üret.
- **S+3–5:** Çıktıları gözle kontrol et (Barnard kayıyor mu, WISE 0855 D6'da görünüyor mu, R Dra parlaklığı değişiyor mu). `frontend/data/` altına koy.
- **S+5–13:** Işık eğrisi; önce yalnızca R Dra ve RW Aur için önceden hesaplanmış JSON + `lightcurve.js`.

### Kişi 3: Spektrum, sahte renk
- **S+0–6:** Beş hedef için spektrumu önceden hesapla (JSON). Tıklayınca canlı spektrum K3'tür.
- **S+6–10:** Sahte renk görüntü: D1 / D3 / D6 → kırmızı / yeşil / mavi. Kişi 2'nin verisinden hesaplanır; "102 bandı yaratıcı göster" maddesine hızlı bir cevap.
- **S+10–17:** Molekül çizgileri (su buzu 3,0 µm, PAH 3,3 µm, CO₂ 4,27 µm, CO 4,67 µm); vakit kalırsa canlı spektrum.

### Kişi 4: Gaia katmanı, sonra bayraklar
- **S+0–1:** Karar: Aladin Lite mı, kendi SVG katmanı mı? Aladin Lite Gaia DR3'ü tarayıcıdan arka uçsuz çekebilir ve görev metninde adıyla geçiyor. Bir saat dene; çalışırsa onu kullan.
- **S+1–8:** Gaia katmanı. Çevrimdışı yedek olarak hedef çevresi Gaia verisini JSON'a çevir. Daireleri öz hareketle her ziyaretin tarihine taşı.
- **S+8–12:** Kontrol: Barnard'da daire üç karede de yıldızın üstünde mi; WISE 0855'in üstünde daire yok mu.
- **S+12–17:** Kirlenme bayrakları (K3), önce yalnızca Barnard için önceden üretilmiş maske.

### Kişi 5: Deneyim ve sunum (baştan paralel)
- **S+0–1:** Space Apps teslim kurallarını öğren (istenen alanlar, video/slayt sınırı, AI kullanım beyanı) ve ekibe bildir.
- **S+1–6:** Arayüz metinleri (TR/EN), beş "bunu dene" kartı, bekleme ve hata mesajları; Kişi 1'e metin dosyası olarak ver.
- **S+6–12:** Video senaryosu ve proje özeti; önce yalnızca K1'e göre yaz, K2 bittikçe ekle.
- **S+12–14:** Projeyi hiç bilmeyen biriyle kullanıcı testi; takılınan yerlerin listesini Kişi 1'e ver.
- **S+17–20:** Video çekimi, özet metni, teslim.

## Kontrol noktaları (15 dakikalık kısa toplantı)

| Saat | Soru |
|---|---|
| S+2 | İskelet yayında mı, herkes ona takabiliyor mu? |
| S+5 | Beş hedefin statik verisi hazır mı? WISE 0855 koordinatı doğrulandı mı? |
| S+8 | **K1 yayında mı?** Değilse herkes K1'e döner. |
| S+14 | Hangi K2 modülleri gerçekten çalışıyor? Çalışmayan kesilir. |
| S+17 | **Dondurma.** Videoda ne gösterileceği kesinleşir. |

## En büyük üç risk

1. **Statik veri gecikirse her şey gecikir.** Yalnızca Barnard D2 bile hazır olsa çekirdek ilerleyebilir.
2. **WISE 0855 yanlış merkezde olabilir.** Görev metnindeki konum (133.7951, −7.2451) eski tarihli; `00_ORTAK_BAGLAM.md` bugünkü konumu ~133.768 (yaklaşık 96″ batı) veriyor. 0,05° (~180″) genişliğinde bir kesitte bu fark cismi kenara ya da dışarı iter. İlk üç saatte SIMBAD + öz hareketle doğrulanmalı.
3. **Son saatte birleştirme.** Her modül S+8'den itibaren canlı sitede, açılıp kapanabilen bir düğme arkasında olmalı. Yerel makinede bekleyen modül yok sayılır.

## Ek fikirler (zaman kalırsa)

- **Poz modu:** Her ziyarette 10–25 poz var ve bunlar birkaç güne yayılıyor (Barnard'da ilk ziyaret MJD 60902–60912). Pozları tek tek oynatmak, asteroitlerin tek ziyaret içinde bile hareketini gösterir; "küçük video" isteğini üç kareden çok daha iyi karşılar.
- **Öz hareketle takip:** Hızlı yıldızlarda katalog konumunu ve bugünkü tahmini konumu birlikte işaretlemek.
