import { BellIcon, PackageIcon, TruckIcon } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const sections = [
  { value: "products", icon: PackageIcon, title: "Ürün eşitleme", rows: ["Stok miktarını eşitle", "Fiyatları eşitle"] },
  { value: "shipping", icon: TruckIcon, title: "Kargo", rows: ["Takip numarasını müşteriye gönder"] },
  { value: "alerts", icon: BellIcon, title: "Bildirimler", rows: ["Eşitleme hatasında e-posta gönder", "Haftalık özet gönder"] },
]

export default function AccordionCard() {
  return (
    <Accordion type="multiple" variant="card" defaultValue={["products"]} className="max-w-lg">
      {sections.map((section) => (
        <AccordionItem key={section.value} value={section.value}>
          <AccordionTrigger>
            <span className="flex items-center gap-2.5">
              <section.icon className="size-4 text-icon" />
              {section.title}
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            {section.rows.map((row, i) => (
              <label key={row} className="flex items-center justify-between gap-4 text-foreground">
                {row}
                <Switch defaultChecked={i === 0} />
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
