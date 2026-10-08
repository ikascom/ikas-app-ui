export type OrderStatus = "paid" | "pending" | "refunded" | "cancelled"
export type FulfillmentStatus = "fulfilled" | "unfulfilled" | "partial"

export type Order = {
  id: string
  number: string
  customer: string
  email: string
  date: string
  total: number
  items: number
  payment: OrderStatus
  fulfillment: FulfillmentStatus
}

export const orders: Order[] = [
  { id: "o1", number: "#1048", customer: "Elif Yılmaz", email: "elif@example.com", date: "2026-10-06T09:24:00Z", total: 1249.9, items: 3, payment: "paid", fulfillment: "unfulfilled" },
  { id: "o2", number: "#1047", customer: "Mert Kaya", email: "mert@example.com", date: "2026-10-06T08:02:00Z", total: 389, items: 1, payment: "pending", fulfillment: "unfulfilled" },
  { id: "o3", number: "#1046", customer: "Zeynep Demir", email: "zeynep@example.com", date: "2026-10-05T17:45:00Z", total: 2780.5, items: 5, payment: "paid", fulfillment: "partial" },
  { id: "o4", number: "#1045", customer: "Can Öztürk", email: "can@example.com", date: "2026-10-05T14:11:00Z", total: 560, items: 2, payment: "paid", fulfillment: "fulfilled" },
  { id: "o5", number: "#1044", customer: "Ayşe Çelik", email: "ayse@example.com", date: "2026-10-05T10:30:00Z", total: 145.75, items: 1, payment: "refunded", fulfillment: "fulfilled" },
  { id: "o6", number: "#1043", customer: "Burak Şahin", email: "burak@example.com", date: "2026-10-04T19:05:00Z", total: 990, items: 2, payment: "cancelled", fulfillment: "unfulfilled" },
  { id: "o7", number: "#1042", customer: "Deniz Aydın", email: "deniz@example.com", date: "2026-10-04T12:48:00Z", total: 3420, items: 6, payment: "paid", fulfillment: "fulfilled" },
  { id: "o8", number: "#1041", customer: "Selin Arslan", email: "selin@example.com", date: "2026-10-04T09:15:00Z", total: 720.4, items: 2, payment: "paid", fulfillment: "fulfilled" },
]

export const paymentBadge: Record<OrderStatus, { label: string; tone: "success" | "warning" | "neutral" | "critical" }> = {
  paid: { label: "Ödendi", tone: "success" },
  pending: { label: "Bekliyor", tone: "warning" },
  refunded: { label: "İade edildi", tone: "neutral" },
  cancelled: { label: "İptal edildi", tone: "critical" },
}

export const fulfillmentBadge: Record<FulfillmentStatus, { label: string; tone: "success" | "warning" | "info" }> = {
  fulfilled: { label: "Gönderildi", tone: "success" },
  unfulfilled: { label: "Gönderilmedi", tone: "warning" },
  partial: { label: "Kısmen gönderildi", tone: "info" },
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
