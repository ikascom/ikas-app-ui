"use client"

import * as React from "react"
import { Volume2Icon, VolumeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DateWheelPicker } from "@/components/ikas/date-wheel-picker"

export default function DateWheelPickerMinMax() {
  const [date, setDate] = React.useState(new Date(2026, 10, 3))
  const [sound, setSound] = React.useState(true)

  return (
    <Field className="max-w-xs">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel id="campaign-end-label">Kampanya bitişi</FieldLabel>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="Tık sesi" aria-pressed={sound} onClick={() => setSound(!sound)} className="-my-1">
              {sound ? <Volume2Icon data-anim="pop" /> : <VolumeOffIcon data-anim="pop" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sound ? "Tık sesini kapat" : "Tık sesini aç"}</TooltipContent>
        </Tooltip>
      </div>
      <DateWheelPicker
        aria-label="Kampanya bitişi"
        value={date}
        onValueChange={setDate}
        minDate={new Date(2026, 9, 12)}
        maxDate={new Date(2026, 11, 31)}
        monthFormat="short"
        size="sm"
        sound={sound}
        className="sm:w-full"
      />
      <FieldDescription>12 Ekim ile yıl sonu arasında bir gün seçin.</FieldDescription>
    </Field>
  )
}
