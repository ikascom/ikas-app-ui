import AnalyticsExample from "./analytics"
import AppHomeExample from "./app-home"
import AutomationRuleExample from "./automation-rule"
import BillingExample from "./billing"
import CampaignEditorExample from "./campaign-editor"
import CampaignsExample from "./campaigns"
import DashboardExample from "./dashboard"
import EInvoiceAppExample from "./einvoice-app"
import MarketplaceHealthExample from "./marketplace-health"
import OrderActionExample from "./order-action"
import OrdersExample from "./orders"
import PixelAppExample from "./pixel-app"
import SettingsExample from "./settings"
import SyncDetailExample from "./sync-detail"
import WidgetAppExample from "./widget-app"

export const examples = {
  "app-home": {
    title: "Uygulama ana sayfası",
    description: "Kurulumdan hemen sonraki ana sayfa: Launchpad adımları, sıfırdaki metrikler, ilk kullanım boş durumu ve yardım kartı.",
    Component: AppHomeExample,
  },
  "widget-app": {
    title: "Destek butonu",
    description: "Script ile çalışan bir storefront uygulaması: Launchpad adımları, mağaza başına script kur/güncelle/kaldır, aç-kapa modüller, canlı buton önizlemesi ve tıklama grafiği.",
    Component: WidgetAppExample,
  },
  "marketplace-health": {
    title: "Pazaryeri entegrasyonu",
    description: "Pazaryeri entegrasyonunun eşitleme sağlığı: halka metre ve sparkline'lı metrikler, yeniden denenebilen hata tablosu, eşitleme etkinliği grafiği ve aç/kapa eşitleme ayarları.",
    Component: MarketplaceHealthExample,
  },
  "einvoice-app": {
    title: "E-fatura",
    description: "Fatura uygulaması: kontör metresi, ayın devam ettiği aylık fatura grafiği, opt-in fatura ayarları ve durum filtreli, toplu yeniden gönderimli fatura tablosu.",
    Component: EInvoiceAppExample,
  },
  billing: {
    title: "Plan ve faturalandırma",
    description: "Mevcut plan ve kullanım metreleri, aylık/yıllık geçişte animasyonlu fiyatlar, oranlı fark özetli plan değiştirme onayı, fatura geçmişi ve iki adımlı iptal.",
    Component: BillingExample,
  },
  "order-action": {
    title: "Sipariş aksiyonu",
    description: "Sipariş detayından iframe içinde açılan kompakt kargo etiketi ekranı: firma seçimi, koli sayısı, kapıda ödeme opt-in'i ve takip numaralı başarı durumu.",
    Component: OrderActionExample,
  },
  "pixel-app": {
    title: "Pazarlama pikseli",
    description: "Olay başına aç/kapa ayarları, sunucu tarafı ve KVKK opt-in alanları, olay hacmi grafiği ve canlı olay akışıyla bir pazarlama pikseli uygulaması.",
    Component: PixelAppExample,
  },
  orders: { title: "Sipariş listesi", description: "Sekmeler, arama, toplu işlemler ve uyarı banner'ı ile Page + RecordTable.", Component: OrdersExample },
  "sync-detail": {
    title: "Eşitleme detayı",
    description: "Bir ürünün pazaryeri eşitlemesi: kanal başına durum, yeniden denenebilen hata kaydı, eşitleme akışı ve IK kimlikleri.",
    Component: SyncDetailExample,
  },
  settings: {
    title: "Ayarlar",
    description: "Numaralı SettingsGroup'lar, yapışkan bölüm menüsü, ayar satırları ve değişiklik olunca beliren UnsavedBar.",
    Component: SettingsExample,
  },
  campaigns: {
    title: "Kampanyalar",
    description: "Bir kampanya uygulamasının liste sayfası: istatistik kartları, günlük grafik ve huni sütunlu kampanya tablosu. Ana aksiyon color=\"lime\".",
    Component: CampaignsExample,
  },
  "campaign-editor": {
    title: "Kampanya editörü",
    description: "Form bölümleri, doğrulama banner'ı ve canlı widget önizlemesi. Metni, fiyatı, konumu ve buton stilini değiştirip önizlemeyi izleyin.",
    Component: CampaignEditorExample,
  },
  analytics: {
    title: "Satış analitiği",
    description: "Grafikler bir arada: dönem seçimiyle yenilenen metrikler, karşılaştırmalı gelir alanı, dönüşüm hunisi, cihaz dağılımı, trafik kaynakları ve sparkline'lı kategori tablosu.",
    Component: AnalyticsExample,
  },
  "automation-rule": {
    title: "Otomasyon kuralı",
    description: "Hareket bileşenleri bir arada: Collapse ile açılan tetikleyici editörü, VE/VEYA SegmentedControl, animasyonla eklenip kalkan koşullar, NumberStepper, ActionBar ve iki adımlı silme.",
    Component: AutomationRuleExample,
  },
  dashboard: { title: "Panel", description: "İstatistik kartları, kompakt bir kayıt tablosu ve kanal dağılımı.", Component: DashboardExample },
} as const

export type ExampleSlug = keyof typeof examples
