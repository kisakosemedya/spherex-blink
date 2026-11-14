# Ortak bağlam: SPHEREx Blink projesi

Bu dosyayı yapay zekâ oturumunuzun EN BAŞINA yapıştırın, ardından kendi görev dosyanızı ekleyin.
Buradaki bilgiler 14 Kasım 2026'da kaynak sayfalar okunarak ve NASA arşivine canlı sorgu atılarak doğrulandı. "Yaklaşık" diye işaretlenenler doğrulanmadı.

## Sen kimsin, ne yapıyoruz

NASA Space Apps Challenge 2026'da "Planet X and SPHEREx" görevine katılan beş kişilik bir ekibe yardım ediyorsun. Ekip üyeleri astronom ya da yazılımcı değil; kodu senin yazman, nasıl çalıştırılacağını adım adım anlatman ve her adımı çalıştırıp sonucunu görmeden "bitti" dememen gerekiyor. Teslime bir günden az var. Sade, çalışan çözümler seç; gereksiz soyutlama, çerçeve ya da yapılandırma ekleme.

## Görev ne istiyor

Zorunlu olan:
1. Herkese açık bir web aracı.
2. Kullanıcı bir gökyüzü koordinatı girer (Sağ Açıklık / Dik Açıklık).
3. Araç o bölgenin SPHEREx görüntülerini "küçük bir video gibi" art arda gösterir; hareket eden ya da parlaklığı değişen cisim kolayca fark edilir.
4. Araç şu beş cisimle test edilir: Barnard Yıldızı, Epsilon Indi B, WISE 0855, RW Aurigae, R Draconis.

İsteğe bağlı olanlar: yeni veriyle kolay güncelleme, 102 bandı yaratıcı gösterme, anlık spektrum ("ekstra övgü"), görüntüleri toplama/çıkarma, görüş alanı seçimi, Gaia/WISE katmanı, adres çubuğunda koordinat, kirlenme bayrakları.

Hedef kullanıcı astronomi bilmeyen bir gönüllü. Her ekran ve her metin buna göre yazılır.

## Veri hakkında bilmen gerekenler

- SPHEREx, tüm gökyüzünü altı ayda bir tarayan bir NASA kızılötesi teleskobu. 0,75–5,0 µm arasında 6 dedektör, toplam 102 spektral kanal.
- Temel ürün "Level 2 Spectral Image": dedektör başına bir FITS dosyası, 2040×2040 piksel, yaklaşık 60 MB. Piksel ölçeği yaklaşık 6,15 yay saniyesi.
- Dosyadaki katmanlar: IMAGE (parlaklık, MJy/sr, zodyak ışığı ÇIKARILMAMIŞ), FLAGS (bit maskesi, sıkıştırılmış), VARIANCE, ZODI (zodyak modeli), EPSF, WCS-WAVE (pikselden dalga boyuna tablo).
- Bir görüntü tek dalga boyunda değil: dalga boyu dedektörün bir ekseni boyunca değişir. Aynı cisim her pozda dedektörün başka yerine, yani başka dalga boyuna düşer.
- Dedektör dalga boyları (µm): D1 0,75–1,09 · D2 1,10–1,62 · D3 1,63–2,41 · D4 2,42–3,82 · D5 3,83–4,41 · D6 4,42–5,00.
- Güncel sürümler DR1 (tarama 1–2) ve QR3 (tarama 3–4, haftalık güncellenir). İkisi birlikte sorgulanır. QR2 kullanılmaz.
- Her gökyüzü noktası için altışar ay arayla yalnızca 3 ziyaret var; her ziyarette dedektör başına 10–25 poz.
- Ayrıca "tüm gökyüzü küpü" var: 12.288 karo (HEALPix seviye 5, NESTED), her karo 512×512×102, piksel 12,9 yay saniyesi, zodyak çıkarılmış, ZAMAN BİLGİSİ YOK. Spektrum için uygun, hareket videosu için değil. Katman 50 ve 51 (0'dan sayınca) boş.

## Veriye erişim (denenmiş, çalışan yol)

1. Görüntü listesi, IRSA TAP servisinden (yaklaşık 20 saniye sürer):

   ```
   https://irsa.ipac.caltech.edu/TAP/sync?FORMAT=CSV&QUERY=
   SELECT a.uri, p.time_bounds_lower FROM spherex.artifact a
   JOIN spherex.plane p ON a.planeid = p.planeid
   WHERE 1 = CONTAINS(POINT('ICRS', <ra>, <dec>), p.poly)
   AND p.energy_bandpassname = 'SPHEREx-D<1..6>' ORDER BY p.time_bounds_lower
   ```

   `time_bounds_lower` MJD cinsinden gözlem zamanı. `uri`, `ibe/data/spherex/dr1/level2/...fits` biçiminde.

2. Dosyanın kendisi AWS kopyasından: `uri` başındaki `ibe/data/spherex/` atılır, önüne `https://nasa-irsa-spherex.s3.amazonaws.com/` eklenir. Bu adres parça parça okumaya (HTTP Range) ve tarayıcıdan erişime (CORS: `*`) izin verir.

3. Dosyanın tamamını İNDİRME. `astropy.io.fits.open(url, use_fsspec=True, fsspec_kwargs={"block_size": 131072, "cache_type": "bytes"})` ile aç, `hdul["IMAGE"].section[y0:y1, x0:x1]` ile yalnızca gereken parçayı oku. 59 kesit 8 paralel iş parçacığıyla 45 saniyede iniyor.

4. KULLANMA: IRSA'nın kesit servisi (`...fits?center=...&size=...`). 14 Kasım'da her denemede `503 Server busy` verdi.

5. Tüm gökyüzü küpü: `https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/hips5_cube/hips_20261026/Norder5/Dir<(ipix//10000)*10000>/Npix<ipix>_cube.fits` (ipix: `hpgeom.angle_to_pixel(32, ra, dec, nest=True, lonlat=True)`). Görsel sürümü (HiPS): `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube` (CORS açık).

Çalışan örnek kod: `proof/make_frames.py`. TAP sorgusu, AWS'den kesit okuma, ortak ızgaraya hizalama (`reproject_interp`), ziyarete göre gruplama (60 günden uzun boşluk yeni ziyaret) ve medyan toplama adımlarının hepsi orada. Yeni kod yazmadan önce onu oku ve oradaki işlevleri kullan.

## Test hedefleri

| Hedef | RA (derece) | Dec (derece) | Ne beklenir | Not |
|---|---|---|---|---|
| Barnard Yıldızı | 269.4462 | 4.7688 | Bir yılda yaklaşık 10,6″ kuzeye kayar | DOĞRULANDI: D2'de 59 poz, ziyaretler 2025-08-26, 2026-03-17, 2026-08-23 |
| WISE 0855−0714 | 133.7598 | −7.2422 | Yılda yaklaşık 8″ batıya kayar; yalnızca D6'da görünür | DOĞRULANDI (D6): Kasım 2025 → Nisan 2026 arasında 3,4″ batıya kaydı. Görev metnindeki konum (133.7951, −7.2451) 2010 tarihli; cisim bugün oradan yaklaşık 127″ batıda. DİKKAT: 2026'da 7″ yakınında bir Gaia yıldızı var (G=16,3); kısa dalga boyunda görünen o, D6'da hareket eden ise WISE 0855 |
| Epsilon Indi B | 331.0961 | −56.8010 | Yılda yaklaşık 4,7″ güneydoğuya kayar | DOĞRULANDI (D6): Mayıs 2025 → Eylül 2026 arasında 6,5″ kaydı; 4 ziyaret var. Gaia'da karşılığı yok. Konum, ana yıldızın Gaia hareketiyle 2026'ya taşındı |
| RW Aurigae | 76.9561 | 30.4012 | Yerinde durur, parlaklığı düzensiz değişir | DOĞRULANDI (D3): üç ziyarette göreli parlaklık 1,00 / 1,21 / 1,10. Gaia'da 1,4″ arayla iki bileşen |
| R Draconis | 248.1674 | 66.7550 | Yerinde durur, parlaklığı yaklaşık 8 ayda bir döngüyle değişir | DOĞRULANDI (D2): üç ziyarette göreli parlaklık 1,00 / 0,70 / 0,46. Merkezi doygun; ölçüm çevresindeki halkadan. Derin alanda: bazı dedektörlerde 570'ten fazla poz |

Koordinatlar ESA Gaia arşivinden doğrulandı (CDS/SIMBAD 14 Kasım'da kapalıydı). Yeni bir hedef için CDS Sesame (`https://cds.unistra.fr/cgi-bin/nph-sesame/-oxp/SNV?<isim>`) ya da SIMBAD ile doğrula. Hızlı hareket eden cisimlerde katalog konumu eski tarihli olabilir; öz hareketle bugüne taşımak gerekir.

## Proje yapısı ve çalışma kuralları

```
spherex-blink/
  backend/
    app.py              çekirdek (FastAPI); routes/ altındaki her dosyayı otomatik ekler
    core/spherex.py     ortak veri işlevleri (make_frames.py'den)
    routes/<modul>.py   her modül kendi dosyası: `router = APIRouter()`
  frontend/
    index.html, app.js  çekirdek
    modules/<modul>.js  her modül kendi dosyası: `export function init(app) { ... }`
  cache/                önceden indirilmiş veriler
```

Çekirdeğin modüllere sunduğu `app` nesnesi:

- `app.state`: `{ name, ra, dec, det, fov, visits: [{date, mjd, n_images}], frameIndex }`
- `app.on(olay, işlev)`: olaylar `"target"` (yeni hedef yüklendi), `"frame"` (gösterilen kare değişti), `"click"` (görüntüde bir noktaya tıklandı; `{ra, dec}` verir)
- `app.addPanel(id, başlık)`: modülün içine çizeceği boş bir kutu döndürür
- `app.overlay`: görüntünün üstündeki SVG katmanı; `app.skyToPixel(ra, dec)` ekrandaki `{x, y}` konumunu verir

Çekirdek henüz yazılıyor. O gelene kadar modülünü tek başına çalışan hâlde geliştir: uç noktan (`/api/<modul>`) tek başına test edilebilsin, arayüz parçan için küçük bir deneme sayfası kullan.

Kurallar:
1. Yalnızca kendi modül dosyalarına dokun. `app.py`, `app.js`, `index.html` ve başkasının modülü birleştirme sorumlusuna aittir; değişiklik gerekiyorsa ondan iste.
2. Python 3.9 ile çalışacak kod yaz. Yeni bir paket gerekiyorsa `backend/requirements.txt` içine ekle ve birleştirme sorumlusuna söyle.
3. Ağ hataları olağan: her uzak istekte zaman aşımı ve en az iki yeniden deneme olsun; bir poz başarısız olursa atla, devam et.
4. Bir şeyi "çalışıyor" demeden önce Barnard Yıldızı ile çalıştır ve çıktıyı göster.
5. Bilmediğin bir sayıyı uydurma. Emin değilsen "doğrulanmadı" de.
6. Kullanıcıya görünen bütün metinler sade Türkçe ve İngilizce olsun; terim kullanıyorsan bir cümleyle açıkla.
