# Görev 2: Parlaklık–zaman grafiği (ışık eğrisi)

(Önce `00_ORTAK_BAGLAM.md` dosyasını yapıştırın, sonra bunu.)

## Görevin

Beş test hedefinden ikisi (RW Aurigae, R Draconis) yer değiştirmiyor, parlaklığı değişiyor. Üç karelik video bunu göstermeye yetmez. Seçilen noktanın parlaklığının zamana göre nasıl değiştiğini gösteren bir grafik modülü yaz.

## Neden zor

Aynı yıldız her pozda dedektörün başka bir yerine, yani başka bir dalga boyuna düşer. Farklı dalga boylarındaki ölçümleri tek eğriye koyarsan, yıldızın rengi yüzünden oluşan fark gerçek değişim gibi görünür. Bu yüzden her ölçümün dalga boyunu da kaydet ve yalnızca birbirine yakın dalga boylarını karşılaştır.

## Yapılacaklar

1. `backend/routes/lightcurve.py`: `GET /api/lightcurve?ra=&dec=&det=`
   - Ortak bağlamdaki yolla o noktayı kapsayan tüm pozları bul ve küçük kesitleri oku.
   - Her pozda yıldızın çevresinde basit açıklık fotometrisi yap: yaklaşık 2 piksel yarıçaplı daire içindeki toplam, eksi çevredeki halkanın medyanı. `photutils` kullanabilirsin.
   - Her pozun dalga boyunu bul: `WCS(header, fobj=hdul, key="W")`, ardından `spectral_wcs.sip = None`, sonra `pixel_to_world(x, y)`. Bu WCS-WAVE katmanını okumayı gerektirir.
   - Döndür: `[{mjd, date, wavelength_um, flux, visit}]`.
2. `frontend/modules/lightcurve.js`: `app.on("target")` ile veriyi iste, `app.addPanel` kutusuna nokta grafiği çiz. Yatay eksen tarih, dikey eksen parlaklık. Noktaları dalga boyuna göre renklendir. Dar bir dalga boyu aralığı seçmeye yarayan bir kaydırıcı ekle.
3. Grafiğin altına tek cümlelik açıklama: neye bakıldığı ve neden yalnızca yakın renklerin karşılaştırıldığı.

## Bitti sayılır

- R Draconis için (derin alanda, yüzlerce poz var) dar bir dalga boyu aralığında parlaklığın aylar içinde değiştiği grafikte görülüyor.
- Barnard Yıldızı için aynı grafik kabaca düz çıkıyor (kontrol).
- Bir poz okunamazsa grafik yine çiziliyor.

## Dikkat

- Çok parlak yıldızlarda merkez pikseller doygun (boş) olabilir; o pozu atla ve kaç pozun atlandığını döndür.
- R Draconis'te poz sayısı çok; ilk sürümde tek dedektörle başla ve sonucu önbelleğe yaz.
- Mutlak parlaklık birimi önemli değil; göreli değişim yeter. Eksene "göreli parlaklık" yaz.
