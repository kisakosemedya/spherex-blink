# Görev 5: Kullanıcı deneyimi, hikâye ve sunum

(Önce `00_ORTAK_BAGLAM.md` dosyasını yapıştırın, sonra bunu.)

## Görevin

Görev metni aracın "herkes" tarafından ve "hızlıca" kullanılabilmesini istiyor. Teknik ekiplerin çoğu bunu atlar; bizim farkımız burada olacak. İki işin var: sitenin astronomi bilmeyen biri için anlaşılır olmasını sağlamak ve projeyi jüriye anlatan teslim malzemelerini hazırlamak. Bu görevde kod yazmak ikincil; asıl iş metin, akış ve anlatı.

Başlamadan önce benden şunu iste: Space Apps'in bu yılki teslim kuralları ve değerlendirme ölçütleri (istenen dosyalar, video süresi, metin uzunluğu). Bunlar sana verilmeden teslim malzemelerinin biçimini varsayma; sor.

## Birinci iş: Sitenin dili ve ilk karşılama

1. Karşılama akışı: siteye ilk kez gelen biri 30 saniye içinde şu üç şeyi anlamalı: neye bakıyorum, neyi arıyorum, bulursam ne yapacağım. En fazla üç adım, her adımda bir cümle ve bir görsel. Hikâye çapası: Plüton, iki fotoğraf karşılaştırılarak bulundu.
2. Arayüzdeki her düğme ve etiket için kısa metin, Türkçe ve İngilizce. Terimleri gündelik dile çevir: "dedektör" yerine "kızılötesi renk aralığı", "fark görüntüsü" yerine "neyin değiştiğini göster", "epoch" yerine "ziyaret".
3. Beş test hedefi için birer "bunu dene" kartı: cisim nedir, ne göreceksin, neden ilginç. Her biri iki cümle.
4. Boş ve hata durumları için metin: veri yükleniyor (bekleme 90 saniyeye çıkabilir; ne olduğunu anlat), bu noktada veri yok, arşive ulaşılamıyor.
5. "Bir şey buldum" akışı: kullanıcı ilginç bir şey görürse ne yapar? En azından o görünümün bağlantısını kopyalayan bir "paylaş" düğmesi ve ne yazacağına dair kısa bir yönlendirme.
6. İstersen `frontend/modules/onboarding.js` olarak karşılama akışını kodla; `app.addPanel` kullan, başka dosyaya dokunma.

Bitti sayılır: Projeyi hiç duymamış biri siteyi açıp yardım almadan Barnard Yıldızı'nın hareketini buluyor ve ne gördüğünü kendi cümleleriyle anlatabiliyor. Bunu gerçek bir kişiyle dene ve takıldığı yerleri not et.

## İkinci iş: Teslim malzemeleri

1. Proje özeti: sorun, çözüm, kimin için, neyi farklı yapıyoruz. Dürüst ol; yalnızca gerçekten çalışan özellikleri yaz.
2. Demo videosu senaryosu: saniye saniye ne gösterilecek, ne söylenecek. Açılış Plüton hikâyesi, ardından canlı kullanım: Barnard Yıldızı (hareket), WISE 0855 (yalnızca bir renk aralığında görünen soğuk cisim), R Draconis (parlaklık değişimi).
3. Sunum: az slayt, her slaytta tek fikir.
4. Kullanılan veri ve araçların listesi, kaynak gösterimiyle. SPHEREx verisi kullanan her yayında IRSA'nın istediği teşekkür cümlesi yer almalı (IRSA SPHEREx sayfasında yazıyor). Yapay zekâ kullanımını da açıkça belirt.

## Elindeki gerçekler (uydurma ekleme)

- SPHEREx Mayıs 2025'ten beri gökyüzünü altı ayda bir, 102 kızılötesi bantta tarıyor; bir milyardan fazla cisim.
- Bilinen kuyruklu yıldızların ve kahverengi cücelerin çoğunu gönüllüler bu yöntemle buldu (görev metni, backyardworlds.org).
- Benzer araç WiseView, WISE verisiyle yüzlerce keşifte kullanıldı. Bizimki SPHEREx için ilk; WiseView'de olmayan: 102 bant, spektrum, kirlenme işaretleri.
- Barnard Yıldızı kendi verimizde bir yılda yaklaşık 10,6 yay saniyesi kaydı (ölçüldü).
- Her nokta için şu an yalnızca 3 ziyaret var; araç yeni veri geldikçe kendiliğinden zenginleşir.

Hangi ek özelliklerin gerçekten bittiğini birleştirme sorumlusundan öğren; bitmeyeni metne ve videoya koyma.
