import { ArchiveIcon, CopyIcon, DownloadIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const actions = [
  { icon: CopyIcon, label: "Kopyala", shortcut: "⌘C" },
  { icon: PencilIcon, label: "Yeniden adlandır", shortcut: "F2" },
  { icon: ArchiveIcon, label: "Arşivle", shortcut: "E" },
  { icon: DownloadIcon, label: "İndir", shortcut: "⌘D" },
  { icon: Trash2Icon, label: "Sil", shortcut: "⌫" },
]

/** Icon-only toolbar. The first tooltip waits; moving along the bar opens the next one at once, without motion. */
export default function TooltipToolbar() {
  return (
    <div className="flex items-center gap-2">
      {actions.map(({ icon: Icon, label, shortcut }) => (
        <Tooltip key={label}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label={label}>
              <Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent shortcut={shortcut}>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
