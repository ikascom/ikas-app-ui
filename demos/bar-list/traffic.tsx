"use client"

import { CameraIcon, GlobeIcon, MailIcon, SearchIcon, ShoppingBagIcon } from "lucide-react"

import { BarList } from "@/components/ikas/bar-list"

export default function BarListTraffic() {
  return (
    <BarList
      className="w-full max-w-md"
      aria-label="Trafik kaynakları"
      header={{ name: "Kaynak", value: "Ziyaret" }}
      color="var(--chart-1)"
      data={[
        { name: "Arama motorları", value: 18420, icon: <SearchIcon />, href: "#" },
        { name: "Sosyal medya", value: 12960, icon: <CameraIcon />, href: "#" },
        { name: "Doğrudan", value: 9310, icon: <GlobeIcon />, href: "#" },
        { name: "E-posta bülteni", value: 4120, icon: <MailIcon />, href: "#" },
        { name: "Pazaryeri", value: 2870, icon: <ShoppingBagIcon />, href: "#" },
      ]}
    />
  )
}
