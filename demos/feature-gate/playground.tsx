"use client"

import * as React from "react"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "@/components/ikas/color-picker"
import { FeatureGate, type FeatureGateVariant } from "@/components/ikas/feature-gate"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { SettingRow } from "@/components/ikas/setting-row"

/** The palette colors as starting points; any other color works too. */
const starters = ["#7B3DEA", "#2563EB", "#008256", "#F5A420", "#DC2626", "#171717"]

/** WCAG relative luminance of a #RRGGBB color. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Points one palette color at the picked color, the way a theme would: the soft fill and border mix it into the card,
 * the tinted text mixes it into the foreground, so it reads in light and dark.
 */
function paletteFrom(color: string) {
  const solid = color.slice(0, 7)
  // Light picks (lime, yellow) need more foreground in their tinted text to stay readable on the soft fill.
  const light = luminance(solid) > 0.45
  return {
    "--violet": solid,
    "--violet-foreground": light ? `color-mix(in oklab, ${solid} 18%, black)` : "white",
    "--violet-subtle": `color-mix(in oklab, ${solid} 10%, var(--card))`,
    "--violet-subtle-foreground": `color-mix(in oklab, ${solid} ${light ? 45 : 72}%, var(--foreground))`,
    "--violet-border": `color-mix(in oklab, ${solid} 26%, var(--card))`,
  }
}

/** Set on the root, not a wrapper, so the action variant's popover (portaled to body) picks the color up too. */
function usePalette(color: string) {
  React.useEffect(() => {
    const root = document.documentElement
    const vars = Object.entries(paletteFrom(color))
    for (const [name, value] of vars) root.style.setProperty(name, value)
    return () => {
      for (const [name] of vars) root.style.removeProperty(name)
    }
  }, [color])
}

const variants: { value: FeatureGateVariant; label: string }[] = [
  { value: "overlay", label: "Overlay" },
  { value: "banner", label: "Banner" },
  { value: "inline", label: "Inline" },
  { value: "action", label: "Action" },
]

function Rows() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center gap-3">
          <Skeleton className="size-7 rounded-md" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-2 w-2/3" />
            <Skeleton className="h-1.5 w-1/3" />
          </div>
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export default function FeatureGatePlayground() {
  const [color, setColor] = React.useState(starters[0])
  const [swatches, setSwatches] = React.useState(starters)
  const [variant, setVariant] = React.useState<FeatureGateVariant>("overlay")
  usePalette(color)
  const gate = { locked: true, color: "violet", title: "Webhook’lar", description: "Olayları dış sistemlerine anlık gönder.", onUpgrade: () => {} } as const

  return (
    <div className="grid w-full max-w-3xl items-start gap-6 md:grid-cols-[16rem_1fr]">
      <div className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="gate-color">Gate rengi</FieldLabel>
          <ColorPicker
            id="gate-color"
            label="Gate rengi"
            alpha={false}
            value={color}
            onValueChange={setColor}
            swatches={swatches}
            onSwatchesChange={setSwatches}
          />
        </Field>
        <Field>
          <FieldLabel>Varyasyon</FieldLabel>
          <SegmentedControl size="sm" mode="radio" aria-label="Varyasyon" value={variant} onValueChange={setVariant} options={variants} />
        </Field>
      </div>
      <div>
        {variant === "overlay" && (
          <Card className="overflow-hidden py-0">
            <FeatureGate {...gate} onCompare={() => {}}>
              <Rows />
            </FeatureGate>
          </Card>
        )}
        {variant === "banner" && (
          <Card className="overflow-hidden py-0">
            <FeatureGate {...gate} variant="banner" title="Webhook’lar Pro planda" description="Şimdilik yalnızca görüntüleyebilirsin.">
              <Rows />
            </FeatureGate>
          </Card>
        )}
        {variant === "inline" && (
          <Card>
            <CardHeader>
              <CardTitle>Entegrasyonlar</CardTitle>
            </CardHeader>
            <div className="divide-y px-6">
              <SettingRow
                title="Sipariş bildirimleri"
                description="Yeni siparişte e-posta gönder."
                control={<Switch defaultChecked aria-label="Sipariş bildirimleri" />}
              />
              <SettingRow
                title="Webhook’lar"
                description="Olayları dış sistemlerine anlık gönder."
                control={
                  <FeatureGate {...gate} variant="inline">
                    <Switch aria-label="Webhook’lar" />
                  </FeatureGate>
                }
              />
            </div>
          </Card>
        )}
        {variant === "action" && (
          <Card className="items-start p-6">
            <FeatureGate {...gate} variant="action" title="Toplu dışa aktarma" description="Siparişleri CSV olarak indirmek Pro planda." onCompare={() => {}}>
              <Button variant="outline">
                <DownloadIcon data-icon="inline-start" />
                Dışa aktar
              </Button>
            </FeatureGate>
          </Card>
        )}
      </div>
    </div>
  )
}
