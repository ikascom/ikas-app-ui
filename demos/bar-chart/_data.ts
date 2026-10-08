export const monthlyOrders = [
  { month: "Oca", orders: 842 },
  { month: "Şub", orders: 916 },
  { month: "Mar", orders: 1104 },
  { month: "Nis", orders: 978 },
  { month: "May", orders: 1236 },
  { month: "Haz", orders: 1188 },
  { month: "Tem", orders: 1342 },
  { month: "Ağu", orders: 1290 },
  { month: "Eyl", orders: 1468 },
  { month: "Eki", orders: 1612 },
  { month: "Kas", orders: 1904 },
  { month: "Ara", orders: 1756 },
]

export const channelRevenue = [
  { month: "Tem", web: 182000, marketplaceA: 96000, marketplaceB: 54000 },
  { month: "Ağu", web: 174000, marketplaceA: 104000, marketplaceB: 61000 },
  { month: "Eyl", web: 198000, marketplaceA: 118000, marketplaceB: 58000 },
  { month: "Eki", web: 221000, marketplaceA: 127000, marketplaceB: 72000 },
  { month: "Kas", web: 264000, marketplaceA: 158000, marketplaceB: 89000 },
  { month: "Ara", web: 243000, marketplaceA: 141000, marketplaceB: 83000 },
]

export const categorySales = [
  { category: "Tişört", units: 1840 },
  { category: "Gömlek", units: 1210 },
  { category: "Pantolon", units: 980 },
  { category: "Elbise", units: 760 },
  { category: "Aksesuar", units: 540 },
  { category: "Ayakkabı", units: 410 },
]

export const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)
