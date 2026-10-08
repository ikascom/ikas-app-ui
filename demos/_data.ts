import type { BadgeStatus } from "@/components/ui/badge"

/** Order lifecycle in the ikas panel. */
export type OrderStatus = "approved" | "preparing" | "shipped" | "delivered" | "cancelled"
/** Whether the order's latest change reached its marketplace. Web orders have nothing to forward. */
export type ChannelSync = "forwarded" | "pending" | "failed" | "none"

export type Order = {
  id: string
  number: string
  customer: string
  email: string
  date: string
  total: number
  items: number
  status: OrderStatus
  sync: ChannelSync
}

export const orders: Order[] = [
  { id: "o1", number: "IK-1048", customer: "Elif Yılmaz", email: "elif@example.com", date: "2026-10-06T09:24:00Z", total: 1249.9, items: 3, status: "approved", sync: "forwarded" },
  { id: "o2", number: "IK-1047", customer: "Mert Kaya", email: "mert@example.com", date: "2026-10-06T08:02:00Z", total: 389, items: 1, status: "approved", sync: "pending" },
  { id: "o3", number: "IK-1046", customer: "Zeynep Demir", email: "zeynep@example.com", date: "2026-10-05T17:45:00Z", total: 2780.5, items: 5, status: "preparing", sync: "forwarded" },
  { id: "o4", number: "IK-1045", customer: "Can Öztürk", email: "can@example.com", date: "2026-10-05T14:11:00Z", total: 560, items: 2, status: "shipped", sync: "failed" },
  { id: "o5", number: "IK-1044", customer: "Ayşe Çelik", email: "ayse@example.com", date: "2026-10-05T10:30:00Z", total: 145.75, items: 1, status: "delivered", sync: "none" },
  { id: "o6", number: "IK-1043", customer: "Burak Şahin", email: "burak@example.com", date: "2026-10-04T19:05:00Z", total: 990, items: 2, status: "cancelled", sync: "forwarded" },
  { id: "o7", number: "IK-1042", customer: "Deniz Aydın", email: "deniz@example.com", date: "2026-10-04T12:48:00Z", total: 3420, items: 6, status: "delivered", sync: "forwarded" },
  { id: "o8", number: "IK-1041", customer: "Selin Arslan", email: "selin@example.com", date: "2026-10-04T09:15:00Z", total: 720.4, items: 2, status: "shipped", sync: "none" },
]

export const orderStatusBadge: Record<OrderStatus, { label: string; status: BadgeStatus }> = {
  approved: { label: "Onaylandı", status: "info" },
  preparing: { label: "Hazırlanıyor", status: "warning" },
  shipped: { label: "Kargoda", status: "neutral" },
  delivered: { label: "Teslim edildi", status: "success" },
  cancelled: { label: "İptal edildi", status: "danger" },
}

export const channelSyncBadge: Record<Exclude<ChannelSync, "none">, { label: string; status: BadgeStatus }> = {
  forwarded: { label: "Pazaryerine iletildi", status: "success" },
  pending: { label: "İletilmeyi bekliyor", status: "warning" },
  failed: { label: "İletilemedi", status: "danger" },
}

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })
const dateTime = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })

export const formatMoney = (value: number) => currency.format(value)
export const formatDate = (iso: string) => dateTime.format(new Date(iso))

/* -------------------------------------------------------------------------------------------------
 * The one fake store every demo and example belongs to. Keep names generic: no real stores, brands,
 * domains or people. Domains use the reserved `.example` TLD; script URLs use example.com.
 * -----------------------------------------------------------------------------------------------*/

export const store = {
  name: "Örnek Mağaza",
  domain: "magaza.example",
  supportEmail: "destek@magaza.example",
  stockEmail: "stok@magaza.example",
  phone: "+90 555 000 00 00",
}

/** Storefronts of the store (used by script installers). */
export const storefronts = [
  { id: "main", name: "Ana mağaza", domain: "magaza.example" },
  { id: "b2b", name: "Toptan", domain: "toptan.magaza.example" },
  { id: "intl", name: "Yurt dışı", domain: "global.magaza.example" },
] as const

/** Storefront script of the demo app. */
export const widgetScriptUrl = "https://example.com/widget.js"

/** Sales channels. Marketplaces stay generic on purpose. */
export const channels = {
  web: "Online mağaza",
  marketplaceA: "Pazaryeri A",
  marketplaceB: "Pazaryeri B",
  marketplaceC: "Pazaryeri C",
  social: "Sosyal medya",
  mobile: "Mobil uygulama",
  wholesale: "Toptan satış",
} as const

export type ChannelKey = keyof typeof channels

/** `[{ key, label }]` for chart series / donut slices, in the given order. */
export const channelSeries = (...keys: ChannelKey[]) => keys.map((key) => ({ key, label: channels[key] }))

/** The marketplace account the integration examples connect to. */
export const marketplace = {
  name: "Pazaryeri",
  sellerId: "SATICI-1024",
  apiKey: "sk_test_4f9a2c",
}

/** Shipping options (generic service tiers instead of real carriers). */
export const carriers = [
  { id: "express", name: "Hızlı kargo", price: 89.9, eta: "1–2 iş günü" },
  { id: "standard", name: "Standart kargo", price: 84.5, eta: "1–3 iş günü" },
  { id: "economy", name: "Ekonomik kargo", price: 79.9, eta: "2–3 iş günü" },
] as const

export type CarrierId = (typeof carriers)[number]["id"]

/** Contact details of the first order's customer (order detail, description lists, order actions). */
export const customer = {
  name: orders[0].customer,
  email: orders[0].email,
  phone: "+90 555 000 00 01",
  address: "Örnek Mah. Çınar Sok. No: 12, Kadıköy / İstanbul",
}

/* -------------------------------------------------------------------------------------------------
 * One product as a marketplace integration sees it (sync detail example).
 * -----------------------------------------------------------------------------------------------*/

export type ChannelState = "live" | "rejected" | "review"

export const syncedProduct = {
  id: "IK-20418",
  name: "Keten gömlek",
  variant: "Ekru / M",
  sku: "KG-EKRU-M",
  barcode: "8690000204181",
  stock: 9,
  price: 649.9,
  channels: [
    { key: "web", state: "live", externalId: "—", syncedAt: "14:31" },
    { key: "marketplaceA", state: "live", externalId: "PA-55120934", syncedAt: "14:31" },
    { key: "marketplaceB", state: "rejected", externalId: "PB-0081274", syncedAt: "14:32" },
    { key: "marketplaceC", state: "review", externalId: "PC-7741-2207", syncedAt: "13:58" },
  ] satisfies { key: ChannelKey; state: ChannelState; externalId: string; syncedAt: string }[],
  errors: [
    { id: "SE-3107", channel: "marketplaceB", code: "IMAGE_TOO_SMALL", message: "Ana görsel 1200×1200 pikselden küçük.", at: "14:32" },
    { id: "SE-3106", channel: "marketplaceB", code: "ATTRIBUTE_REQUIRED", message: "Zorunlu \"Kumaş\" özelliği boş.", at: "14:32" },
    { id: "SE-3088", channel: "marketplaceC", code: "RATE_LIMITED", message: "İstek sınırı aşıldı; 15 dakika sonra yeniden denenir.", at: "13:58" },
  ] satisfies { id: string; channel: ChannelKey; code: string; message: string; at: string }[],
  timeline: [
    { at: "14:32", channel: "marketplaceB", text: "Ürün reddedildi: 2 hata", state: "error" },
    { at: "14:31", channel: "marketplaceA", text: "Stok 12 → 9 gönderildi", state: "ok" },
    { at: "14:31", channel: "web", text: "Fiyat ₺649,90 olarak güncellendi", state: "ok" },
    { at: "14:30", channel: null, text: "Ürün ikas'ta düzenlendi", state: "info" },
    { at: "13:58", channel: "marketplaceC", text: "Onaya gönderildi", state: "info" },
  ] satisfies { at: string; channel: ChannelKey | null; text: string; state: "ok" | "error" | "info" }[],
}
