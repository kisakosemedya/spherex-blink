# Görev 3: Anlık spektrum

(Önce `00_ORTAK_BAGLAM.md` dosyasını yapıştırın, sonra bunu.)

## Görevin

Kullanıcı görüntüde bir noktaya tıkladığında o noktanın 102 kanaldaki parlaklığını grafik olarak göster. Görev metninde "ekstra övgü" denen tek madde bu.

## Yol

Zaman bilgisi gerekmediği için tek tek pozlarla uğraşma; hazır "tüm gökyüzü küpü"nü kullan. Ortak bağlamda adres kalıbı var.

## Yapılacaklar

1. `backend/routes/spectrum.py`: `GET /api/spectrum?ra=&dec=`
   - `hpgeom` ile karonun numarasını bul, küp dosyasını `fsspec` ile aç, tamamını indirme.
   - Küpün WCS'i HEALPix (HPX) izdüşümünde: `WCS(hdul["IMAGE"].header, fobj=hdul).celestial` ile koordinatı piksele çevir.
   - Tıklanan piksel çevresinde küçük bir açıklık (1–2 piksel yarıçap) ve arka plan halkası ile 102 katmanın her birinde parlaklığı ölç.
   - Dalga boylarını dosyadaki `SPECTRAL_CHANNELS` tablosundan al.
   - Döndür: `[{wavelength_um, flux, detector, channel}]`. Katman 50 ve 51 boş; onları `null` döndür.
2. `frontend/modules/spectrum.js`: `app.on("click")` ile iste, `app.addPanel` kutusuna çizgi grafiği çiz. Altı dedektörün aralıklarını arka planda hafif renk bantlarıyla göster. Şu dalga boylarını işaretle ve adlandır: su buzu 3,0 µm, PAH 3,3 µm, CO₂ buzu 4,27 µm, CO 4,67 µm.
3. Grafiğin altına not: "Bu hızlı bir önizlemedir; bilimsel ölçüm için IRSA Spectrophotometry Tool kullanın" ve bağlantısı (`https://irsa.ipac.caltech.edu/Missions/spherex.html` sayfasında).

## Bitti sayılır

- Barnard Yıldızı'na tıklayınca 5 saniye içinde 100 noktalı bir spektrum çiziliyor.
- Boş gökyüzüne tıklayınca sıfır çevresinde düz bir çizgi çıkıyor (kontrol).
- Aynı karoya ikinci tıklama daha hızlı (karo önbellekte).

## Dikkat

- Küp pikseli 12,9 yay saniyesi, videodaki görüntülerden kaba; birbirine yakın iki yıldız karışır. Bunu notta belirt.
- Küp üç ziyaretin ortalaması; hızlı hareket eden cisimlerde (Barnard, WISE 0855) cisim bulanık ya da çift görünebilir. Hata değil.
- 1,083 µm çevresinde ve parlak salma çizgileri yakınında şerit hataları olabilir (belgede yazıyor).
- Bir karo 512×512×102 float32, yani yaklaşık 100 MB. Tamamını okuma; yalnızca tıklanan piksel çevresindeki küçük kutuyu `section` ile oku.
