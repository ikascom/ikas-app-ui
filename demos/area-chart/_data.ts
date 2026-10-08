/** Deterministic demo data (no Math.random, so server and client render the same). */

const wave = (i: number, seed: number) => Math.sin(i * 0.55 + seed) * 0.5 + Math.sin(i * 1.3 + seed * 2) * 0.25

/** Daily revenue for 1–30 Eylül. */
export const dailyRevenue = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-09-${String(i + 1).padStart(2, "0")}`,
  revenue: Math.round(5200 + i * 95 + wave(i, 1) * 1600 + (i % 7 === 5 || i % 7 === 6 ? 1400 : 0)),
}))

const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

/** Monthly orders per sales channel. */
export const channelOrders = months.map((month, i) => ({
  month,
  web: Math.round(820 + i * 38 + wave(i, 0.4) * 140),
  marketplaceA: Math.round(610 + i * 52 + wave(i, 2.1) * 120),
  marketplaceB: Math.round(340 + i * 21 + wave(i, 3.7) * 90),
}))

/** This period vs the previous one, by week. */
export const periodComparison = Array.from({ length: 12 }, (_, i) => ({
  week: `${i + 1}. hafta`,
  current: Math.round(18400 + i * 820 + wave(i, 0.9) * 3200),
  previous: Math.round(16100 + i * 540 + wave(i, 2.6) * 2600),
}))

export const shortDate = (iso: string) => new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(`${iso}T12:00:00`))
export const lira = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)
export const liraCompact = (value: number) => `₺${new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
