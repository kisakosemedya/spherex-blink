# Ortak kaynak klasörünün değerlendirmesi

Ekibin topladığı yerel kaynak klasörü (`NASA_SpaceApps_PlanetX_SPHEREx`) 14 Kasım 2026'da incelendi. Kısa sonuç: **tek doğru kaynak bu repodaki `ekip/00_ORTAK_BAGLAM.md`'dir.** Klasördeki bilgi tabanı daha eski ve bazı noktalarda onunla çelişiyor.

## Repoyla çelişen noktalar

- **WISE 0855 koordinatı:** Klasör görev metnindeki konumu (133.7951, −7.2451) ve 0,05° kesitleri kullanıyor. Repo bugünkü konumu ~133.768 olarak veriyor (~96″ fark). Klasördeki WISE 0855 Gaia dosyası ve planlanan kesitler bu yüzden cismi ıskalayabilir. Doğrulanmadı; SIMBAD ile kontrol edilmeli.
- **Veri erişimi:** Klasördeki indirme betiği ve `ARCHITECTURE_RECOMMENDATION.md`, IRSA kesit servisini (`...fits?center=&size=`) kullanıyor; bu servis 503 veriyor. Repo AWS + HTTP Range yolunu kullanıyor ve bu yol çalışıyor.
- **Mimari:** Klasördeki öneride Zarr, iş kuyruğu gibi parçalar var; bir günlük iş için fazla.

## Dosya dosya değer

| Dosya / klasör | Değer | Not |
|---|---|---|
| `02_DOCUMENTATION/mission_docs/SPHEREx_Expsupp.pdf` | Yüksek | FLAGS bitleri, birimler ve bilinen hatalar için resmî kaynak. |
| `03_TUTORIALS_AND_CODE/repos/irsa-tutorials-main/tutorials/spherex/` | Yüksek | Kesit, HiPS küpü, PSF ve `spherex_source_discovery` örnekleri. |
| `04_DATA/REFERENCE/Gaia_DR3/*.csv` | Orta–yüksek | Beş hedef için 0,05° yarıçaplı Gaia DR3 listeleri (öz hareket dahil); çevrimdışı yedek. WISE 0855'inki yeniden merkezlenmeli. |
| `04_DATA/SPHEREx/test_targets/barnards_star/` | Orta | Gerçek kesitler (29×29 piksel, FLAGS sıkıştırılmamış). Ama yalnızca Barnard ve yarım: 358 satırın ilk 38'i, 4'ü yarım `.part` dosyası. Diğer hedefler yok. |
| `05_AI_KNOWLEDGE_BASE/*.md` | Orta | İyi bir özet ama repodaki bağlamla çelişiyor; AI oturumlarına ikisini birlikte vermeyin. |
| `01_CHALLENGE/CHALLENGE_BRIEF_TR.md` | Orta | Canlı görev sayfasıyla örtüşüyor. |
| `01_CHALLENGE/raw_pages/*.html` | Yok | Sayfa JavaScript ile yüklendiği için kaydedilen HTML'ler boş. |
| NEOSSat belgeleri, FITS örnekleri, XML, eğitim | Düşük | Kanada'nın optik asteroit uydusu; kaynak sayfasında ortak ajans kaynağı olarak listelenmiş ama SPHEREx aracı için gerekmiyor. |
| `06_MANIFESTS/*.zip`, kök klasördeki pdf/docx/zip | Yok | Yinelenen kopyalar. |
| `spaceapps-main`, diğer IRSA eğitimleri (Euclid, ZTF, Spitzer…) | Yok | Yalnızca bir README ya da konu dışı. |
