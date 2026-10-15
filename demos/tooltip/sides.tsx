import { Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Laid out as a cross so every bubble points away from the others. */
const sides = [
  { side: "top", label: "Üst", cell: "col-start-2 row-start-1" },
  { side: "left", label: "Sol", cell: "col-start-1 row-start-2" },
  { side: "right", label: "Sağ", cell: "col-start-3 row-start-2" },
  { side: "bottom", label: "Alt", cell: "col-start-2 row-start-3" },
] as const

/** The bubble grows from the edge facing its trigger; without room it flips to the other side. */
export default function TooltipSides() {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-3">
      {sides.map(({ side, label, cell }) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label={`Ayarlar, ${label.toLowerCase()}`} className={cell}>
              <Settings2Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
