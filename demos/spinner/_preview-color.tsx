"use client"

import * as React from "react"

import { ColorPicker } from "@/components/ikas/color-picker"

/**
 * Preview-only color control for the spinner demos. Spinner draws in currentColor, so the
 * picked color is set on a wrapper here; in an app you give the spinner a text color class.
 */
export function PreviewColor({ children }: { children: React.ReactNode }) {
  const [color, setColor] = React.useState("#2563EB")

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      <div style={{ color }}>{children}</div>
      <div className="flex w-full flex-col items-center gap-2 border-t border-dashed pt-5">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">Önizleme rengi</span>
          <ColorPicker label="Önizleme rengi" value={color} onValueChange={setColor} className="w-40" />
        </div>
        <p className="max-w-sm text-center text-xs text-pretty text-muted-foreground">
          Yalnızca bu önizlemeyi boyar. Spinner yazı rengini alır; kodda{" "}
          <code className="font-mono text-foreground">className=&quot;text-blue&quot;</code> gibi bir renk sınıfı ver.
        </p>
      </div>
    </div>
  )
}
