# Görev 1: Çekirdek site ve birleştirme

(Önce `00_ORTAK_BAGLAM.md` dosyasını yapıştırın, sonra bunu.)

## Görevin

Ortak bağlamdaki proje yapısını kur ve görevin zorunlu kısmını çalışır hâle getir. Diğer dört kişinin modülleri senin kurduğun iskelete takılacak; bu yüzden `app` nesnesini ortak bağlamda yazdığı gibi, eksiksiz sun. Sonrasında gelen modülleri birleştiren ve siteyi yayına alan da sensin.

## Yapılacaklar, sırayla

1. `proof/make_frames.py` içindeki işlevleri `backend/core/spherex.py` dosyasına taşı.
2. `GET /api/frames?ra=&dec=&det=&fov=` uç noktası: her ziyaret için bir PNG (base64 ya da ayrı adres), tarih, poz sayısı ve fark görüntüsü (son − ilk) döndürsün. Sonucu `cache/` altına kaydet; aynı istek ikinci kez anında dönsün.
3. `GET /api/resolve?name=` uç noktası: CDS Sesame ile isimden koordinat.
4. Arayüz: arama kutusu (isim ya da koordinat), kare oynatıcı (oynat/durdur, ileri, geri, hız), "fark" düğmesi, dedektör seçici (D1–D6, yanında dalga boyu aralığı), parlaklık aralığı kaydırıcısı, beş test hedefi için hazır düğmeler.
5. Adres çubuğu: `?ra=&dec=&det=&fov=` ile doğrudan açılsın; her değişiklikte adres güncellensin.
6. Beş test hedefini önceden indirip `cache/` içine koy; demo arşive bağımlı olmasın.
7. Görüş alanı seçimi (`fov`, 60–600 yay saniyesi).
8. Yayına alma: herkesin açabildiği bir adres.

## Bitti sayılır

- Barnard Yıldızı düğmesine basınca üç kare 2 saniye içinde açılıyor ve yıldızın kaydığı görülüyor.
- WISE 0855, D6 seçiliyken fark görüntüsünde görünüyor.
- Önbellekte olmayan rastgele bir koordinat 90 saniye içinde sonuç veriyor ya da anlaşılır bir hata mesajı gösteriyor.
- `frontend/modules/` altına bırakılan yeni bir dosya, `app.js` değiştirilmeden çalışıyor.

## Dikkat

- Kareler arasında parlaklık düzeyi oynamasın: her kesitten kendi medyanını çıkar (örnek kodda var).
- Barnard gibi çok parlak yıldızların merkezi doygun olabilir (boş piksel); bunu hata sanma, görüntüde nötr bir renkle göster.
- Dedektör kenarına düşen pozlar atlanır; bir ziyarette hiç poz kalmazsa o ziyareti listede "veri yok" olarak göster.
