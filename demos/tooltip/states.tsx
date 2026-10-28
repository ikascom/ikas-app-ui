import { DownloadIcon, FileDownIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** A label, a shortcut, a hint long enough to wrap, and the reason a control is disabled. */
export default function TooltipStates() {
  return (
    <div className="flex items-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="İndir">
            <DownloadIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>İndir</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Ara">
            <SearchIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent shortcut="⌘K">Ara</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Dışa aktar">
            <FileDownIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Dışa aktarma yalnızca filtrelenmiş satırları alır, seçim yoksa tüm sayfayı.</TooltipContent>
      </Tooltip>
      {/* A disabled button gets no pointer events, so the focusable wrapper is the trigger. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex rounded-lg">
            <Button variant="outline" size="icon" aria-label="Sil" disabled>
              <Trash2Icon />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Önce en az bir satır seçin</TooltipContent>
      </Tooltip>
    </div>
  )
}
