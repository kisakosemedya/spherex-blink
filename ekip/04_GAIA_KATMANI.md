# Görev 4: Gaia katmanı ve kirlenme işaretleri

(Önce `00_ORTAK_BAGLAM.md` dosyasını yapıştırın, sonra bunu.)

## Görevin

Kullanıcı hareket eden bir nokta gördüğünde ilk sorusu şu olur: "Bu zaten bilinen bir yıldız mı, yoksa yeni bir şey mi?" Görüntünün üstüne Gaia kataloğundaki bilinen yıldızları işaretleyen bir katman yaz. Bittiğinde ikinci iş olarak hatalı pikselleri gösteren katmanı ekle.

## Birinci iş: Gaia katmanı

1. `backend/routes/gaia.py`: `GET /api/gaia?ra=&dec=&fov=`
   - Gaia DR3 kataloğunda (görev DR3 kullanılmasını istiyor) alan içindeki yıldızları sorgula. ESA Gaia TAP servisi `https://gea.esac.esa.int/tap-server/tap/sync` ya da VizieR'deki kopyası (`I/355/gaiadr3`) kullanılabilir; hangisi hızlı yanıt veriyorsa onu seç, diğerini yedek olarak tut.
   - Sütunlar: `ra, dec, pmra, pmdec, phot_g_mean_mag, source_id`. En parlak 200 yıldızla sınırla.
   - Gaia konumları 2016.0 tarihine aittir. Her yıldızın konumunu öz hareketiyle her ziyaretin tarihine taşı (`pmra` zaten cos(dec) ile çarpılmış gelir; RA'ya eklerken cos(dec)'e böl).
   - Döndür: yıldız başına `{source_id, g_mag, positions: [{date, ra, dec}]}`.
2. `frontend/modules/gaia.js`: aç/kapa düğmesi. `app.overlay` üstüne, `app.skyToPixel` ile her yıldıza bir daire çiz. `app.on("frame")` ile daireleri o karenin tarihindeki konuma taşı; böylece daire yıldızla birlikte kayar. Daireye gelince parlaklığı ve yıllık hareketi göster.
3. Açıklama metni: "Dairesi olan nokta bilinen bir yıldızdır. Hareket ettiği hâlde dairesi olmayan nokta ilginçtir. Çok soğuk cisimler görünür ışıkta sönük olduğu için Gaia'da bulunmayabilir."

Bitti sayılır: Barnard Yıldızı'nda daire üç karede de yıldızın üstünde kalıyor. WISE 0855'te hedefin üstünde daire yok (Gaia onu görmez), çevredeki yıldızlarda var.

## İkinci iş: Kirlenme işaretleri

1. `backend/routes/flags.py`: `GET /api/flags?ra=&dec=&det=&fov=`. Her ziyaret için FLAGS katmanından bir maske üret. FLAGS sıkıştırılmış bir katman; `section` ile parça okuma çalışmayabilir, dene ve çalışmıyorsa birleştirme sorumlusuna bildir.
2. Gösterilecek bitler: 0 TRANSIENT, 10 HOT, 11 COLD, 17 PERSIST, 22–24 GHOST, 26 BLOOM, 27 SNOWBALL, 28 HALO. Bit 21 (SOURCE) gösterilmez; neredeyse her pikselde açık.
3. `frontend/modules/flags.js`: aç/kapa düğmesi, işaretli pikselleri yarı saydam renkle boya, hangi rengin ne anlama geldiğini sade dille yaz ("yansıma", "bozuk piksel", "önceki pozdan kalan iz").

## Dikkat

- Gaia servisi yavaş ya da kapalı olabilir; 20 saniye zaman aşımı koy, yanıt gelmezse katman "şu an ulaşılamıyor" desin, site çalışmaya devam etsin.
- Önce Gaia'yı bitir; bayrak katmanına ancak o çalışıyorsa geç.
