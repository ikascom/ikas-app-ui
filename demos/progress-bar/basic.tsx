"use client"

import * as React from "react"
import { ClockIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ikas/progress-bar"

/** An import with a known size: the fill and the percentage move on one spring; at the end a check draws in. */
export default function ProgressBarBasic() {
  const [value, setValue] = React.useState(24)
  const [failed, setFailed] = React.useState(false)
  const streaming = React.useRef<ReturnType<typeof setInterval>>(undefined)
  React.useEffect(() => () => clearInterval(streaming.current), [])

  // Progress never goes backwards: each update can only move it forward.
  const advance = (by: number) => setValue((v) => Math.min(100, v + by))
  const stream = () => {
    clearInterval(streaming.current)
    let n = 0
    streaming.current = setInterval(() => {
      advance(3)
      if (++n >= 10) clearInterval(streaming.current)
    }, 100)
  }
  const label = value >= 100 ? "Aktarım tamamlandı" : value >= 60 ? "Görseller işleniyor" : "Ürünler aktarılıyor"
  const hint = failed ? (
    <span className="flex items-center gap-2 text-red-subtle-foreground">
      <TriangleAlertIcon /> Bağlantı koptu.
      <Button size="xs" variant="outline" onClick={() => setFailed(false)}>
        Tekrar dene
      </Button>
    </span>
  ) : value >= 100 ? (
    "1.240 ürün aktarıldı"
  ) : (
    <span className="flex items-center gap-1.5">
      <ClockIcon /> Yaklaşık {Math.max(1, Math.round((100 - value) / 25))} dakika kaldı
    </span>
  )

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ProgressBar value={value} label={label} status={failed ? "danger" : "auto"} hint={hint} />
      <div className="flex flex-wrap justify-center gap-2 border-t pt-5">
        <Button size="sm" variant="outline" disabled={failed} onClick={() => advance(12)}>
          +12
        </Button>
        <Button size="sm" variant="outline" disabled={failed} onClick={() => advance(35)}>
          +35
        </Button>
        <Button size="sm" variant="outline" disabled={failed} onClick={stream}>
          Akış (10 güncelleme)
        </Button>
        <Button size="sm" variant="outline" disabled={failed || value >= 100} onClick={() => (clearInterval(streaming.current), setFailed(true))}>
          Hata
        </Button>
        <Button size="sm" variant="ghost" onClick={() => (clearInterval(streaming.current), setFailed(false), setValue(0))}>
          Sıfırla
        </Button>
      </div>
    </div>
  )
}
