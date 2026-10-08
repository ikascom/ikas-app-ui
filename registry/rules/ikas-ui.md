# ikas App UI kuralları

Bu kurallar bu ikas uygulamasının her ekranı için geçerlidir. Amaç, uygulamanın sıradan
bir AI çıktısı gibi değil, ikas panelinin bir parçası gibi görünmesidir. Arayüz kodu
yazarken veya değiştirirken bu kurallara uy.

## 1. Yapı taşlarını kullan, yeniden icat etme

| İhtiyaç | Kullan | Asla |
| --- | --- | --- |
| Ekran sarmalayıcı + başlık + aksiyonlar | `@/components/ikas/page` içinden `Page` + `PageHeader` | `<h1>` içeren özel bir `<div className="container">` |
| Sütunlar | `Layout` / `LayoutColumn` (`columns="main-aside"`, `"half"`, `"third"`) | Her sayfada elle yazılmış `grid-cols-*` |
| Ayar formları | `AnnotatedSection` + `Card` + `Field` | Ortalanmış tek kartta dev bir form |
| Kayıt listesi | `ResourceTable` | Tablo verisi için kart grid'i |
| Gösterilecek bir şey yok | `EmptyState` | Gri bir "Veri yok" yazısı |
| Kalıcı geri bildirim | `tone` ile `Banner` | Renkli `<div>`'ler, emoji, alert() |
| Geçici geri bildirim | `sonner` içinden `toast` | "Kaydedildi!" için banner |
| Kaydedilmemiş form değişiklikleri | `SaveBar` | Uzun formun en altında Kaydet butonu |
| Durum | `tone` ile `Badge` (canlı durumlar için + `dot`) | Özel renkli hap etiketler |
| Aksiyonlar | `variant` + `color` ile `Button` | Özel `<button>` stilleri, ekstra gölgeler |
| Önemli sayılar | `StatCard` | Gradient metinli dev hero sayıları |
| Anahtar/değer detayları | `DescriptionList` | Elle hizalanmış flex satırları |
| Tek bir açma/kapama ayarı | `SettingRow` | Rastgele bir flex içinde label + switch |
| Aç/kapa özellik + ayarları | `ToggleSection` | Switch'in yanında hep görünen ayar formu |
| İlk kurulum adımları | `SetupGuide` | Ekranda dağınık "önce şunu yapın" banner'ları |
| Storefront script kur/güncelle/kaldır | `ScriptInstaller` | Elle yazılmış kur butonu, onaysız kaldırma |
| Grafik çerçevesi (başlık, değer, aralık) | `ChartCard` | Her grafik için özel kart başlığı |

Kendin yazmadan önce eksik olanı `npx shadcn@latest add @ikas/<name>` ile kur.

## 2. Görsel kurallar

- **Renkler yalnızca token'lardan gelir.** `bg-card`, `text-muted-foreground`,
  `bg-success-subtle`, `border-border` vb. kullan. Uygulama kodunda asla hex değer, `bg-blue-500`,
  `text-gray-600` veya herhangi bir ham Tailwind palet rengi yazma.
- **Derinlik bileşenlerden gelir.** Solid butonlar içe dönük bir parlama ve yumuşak bir glow ile;
  kartlar ve outline butonlar katmanlı ince gölgelerle gelir. Asla kendi gradient'ini, glow'unu,
  `shadow-lg`/`shadow-2xl`, gradient metin veya renkli arka plan ekleme.
- **Süs amaçlı emoji yok:** başlıklarda, butonlarda, rozetlerde veya boş durumlarda. lucide ikonlarını kullan.
- **Her ekran bölümünde tek solid buton.** Diğer aksiyonlar `outline`, `soft` veya `ghost` olur.
  Solid buton aksiyon grubunun en son öğesidir.
- **Varsayılan nötr.** Renk bir anlam taşımıyorsa butonlar `color="neutral"` olur:
  geri alınamaz onaylar için `red`, uygulamanın ana çağrısı için tek bir vurgu rengi (ör. `blue`).
  Aynı ekranda birden fazla vurgu rengini asla karıştırma.
- **Tonların anlamı var.** `success` = tamamlandı/sağlıklı, `warning` = yakında ilgi istiyor,
  `critical` = bozuk/engellendi/geri alınamaz, `info` = nötr bilgi. Tonları süs için kullanma.
- **Yüzeyler:** önce açık tema. Sayfa arka planı `bg-background`; içerik `Card` üzerinde durur
  (beyaz, katmanlı ince gölge). `backdrop-blur`, glassmorphism veya renkli kart arka planı yok.
- **Köşe yarıçapı:** bileşenlerin varsayılanlarını kullan. `rounded-2xl`/`rounded-3xl` ekleme.
- **Tipografi:** sayfa başlığını `PageHeader` belirler (20px semibold). Kart başlıkları 15px semibold.
  Gövde 14px. Uygulamanın hiçbir yerinde `text-4xl`+ kullanma; TAMAMI BÜYÜK HARF etiket ve `tracking-widest` yok.
- **Yoğunluk:** bu bir panel aracı. Kontroller 36px (`h-9`). Boşlukları şişirme
  (`p-10`, `py-24`) ve landing page tarzı hero bölümleri oluşturma.
- **İkonlar:** lucide-react; kontrollerde 16px, diğer yerlerde en fazla 20px. İkonlar metni destekler,
  ana aksiyonda asla etiketin yerini almaz.

## 3. Metin kuralları

- Her yerde yalnızca ilk harf büyük: "Kampanya oluştur", "Kampanya Oluştur" değil.
- Butonlar nesne + fiildir: "Ayarları kaydet", "Siparişleri dışa aktar". "Gönder", "Tamam", "Buraya tıkla" değil.
- Boş durumlar şeyin ne olduğunu açıklar ve sonraki adımı verir. Şaka yok, "Hay aksi!" yok.
- Hatalar ne olduğunu ve nasıl düzeltileceğini söyler. Mağaza sahiplerine asla ham hata nesnesi gösterme.
- Mağaza sahipleri için uygulamanın dilinde yaz (Türkçe uygulamalar: Türkçe metin; sayı ve para
  birimi için `Intl.NumberFormat` ile `tr-TR` biçimlendirmesi).

## 4. Durumlar isteğe bağlı değil

Veriye dayalı her ekran şunları karşılar: **yükleniyor** (sayfanın ortasında spinner değil,
`ResourceTable loading` veya `Skeleton` ile iskeletler), **boş** (`EmptyState`), **hata**
(tekrar dene aksiyonlu `Banner tone="critical"`) ve **başarı** (`toast`).

## 5. Sayfa tarifleri

- **Liste sayfası:** `Page width="wide"` → `PageHeader` (başlık, ana aksiyon) →
  araç çubuklu (arama + filtreler), sayfalamalı ve toplu işlemli `ResourceTable`.
- **Detay sayfası:** `Page` → `PageHeader` (geri aksiyonu, `titleMeta` rozetleri, aksiyonlar) →
  `Layout columns="main-aside"` → ana sütun: içerik kartları; yan sütun: `DescriptionList` kartları.
- **Ayarlar sayfası:** `Page width="narrow"` → `PageHeader` → her biri tek `Card` içeren alt alta
  `AnnotatedSection`'lar → formun değişiklik durumuna bağlı `SaveBar`.
- **Panel:** `Page width="wide"` → `StatCard`'lardan oluşan `Layout columns="third"` → tablolar / kartlar.

## 6. Hareket

- Spring ve eğrileri elle yazmayın: `@/lib/motion` (`SPRING`, `ICON_SPRING`, `EASE_*`, `springOrInstant`)
  veya CSS'te `ease-(--ease-out)` gibi token'ları kullanın.
- Hover 150ms, içerik belirmesi 150ms / sönmesi 100ms, overlay 300/200ms. Çıkış girişten kısa olur.
- `transition-all` yasak. Tailwind v4'te `translate-*` / `scale-*` için geçiş listesine
  `translate` ve `scale` yazın (`transform` değil).
- İkon mikro animasyonu için ikona `data-anim="spin|nudge|lift|drop|ring|wiggle|bounce|pop"` verin;
  kendi keyframe'inizi yazmayın.
- Sekme / tekli seçim için `SegmentedControl`, sayı girişi için `NumberStepper`, açılır bölüm için
  `Collapse`, satır içi yıkıcı onay için `ConfirmButton` kullanın.
- Her animasyonun reduced-motion karşılığı olmalı (`springOrInstant(useReducedMotion())`, `motion-reduce:*`).

## 7. Grafikler

- Grafikleri `AreaChart`, `BarChart`, `DonutChart`, `BarList`, `Sparkline`, `Meter` ile kurun; çerçeve için `ChartCard`.
- Tek seri `--chart-ink`, birden çok seri `--chart-1…6` sırasıyla. Renkleri elle seçmeyin, döngüye sokmayın;
  6'dan fazla seri "Diğer" altında toplanır. Durum renkleri seri rengi değildir.
- Tek y ekseni. İki farklı ölçekli ölçü için iki grafik.
- İnce işaretler: 2px çizgi, ≤ 24px bar, 4px yuvarlak uç, ince yatay grid. Değer ve etiketler metin token'larında.
- 2+ seride legend zorunlu. Her noktaya sayı yazmayın; tooltip ve gerektiğinde tablo görünümü verin.
- Tek bir öne çıkan sayı gerekiyorsa grafik değil `StatCard` kullanın.

