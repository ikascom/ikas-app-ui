"use client"

import { BarList } from "@/components/ikas/bar-list"

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)

export default function BarListTopProducts() {
  return (
    <BarList
      className="w-full max-w-md"
      aria-label="En çok satan ürünler"
      header={{ name: "Ürün", value: "Ciro" }}
      valueFormat={money}
      data={[
        { name: "Basic oversize tişört", value: 184320 },
        { name: "Keten gömlek", value: 132450 },
        { name: "Wide leg pantolon", value: 98760 },
        { name: "Kanvas çanta", value: 64210 },
        { name: "Örgü hırka", value: 41980 },
      ]}
    />
  )
}
