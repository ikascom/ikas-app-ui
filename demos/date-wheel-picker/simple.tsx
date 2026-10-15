"use client"

import * as React from "react"
import { Volume2Icon, VolumeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DateWheelPicker } from "@/components/ikas/date-wheel-picker"

const long = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })

export default function DateWheelPickerSimple() {
  const [date, setDate] = React.useState(new Date(2026, 9, 12))
  const [sound, setSound] = React.useState(true)

  return (
    <div className="grid w-full max-w-xs gap-3 rounded-xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="grid gap-0.5">
          <span className="text-sm font-medium">Teslimat tarihi</span>
          <span className="text-sm text-muted-foreground">{long.format(date)}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Tık sesi" aria-pressed={sound} onClick={() => setSound(!sound)} className="-mt-1 -mr-1">
              {sound ? <Volume2Icon data-anim="pop" /> : <VolumeOffIcon data-anim="pop" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sound ? "Tık sesini kapat" : "Tık sesini aç"}</TooltipContent>
        </Tooltip>
      </div>
      <DateWheelPicker value={date} onValueChange={setDate} sound={sound} className="sm:w-full" />
    </div>
  )
}
