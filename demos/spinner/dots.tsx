import { Spinner, type SpinnerVariant } from "@/components/ui/spinner"

import { PreviewColor } from "@/demos/spinner/_preview-color"

const variants: { variant: SpinnerVariant; label: string }[] = [
  { variant: "dots", label: "Nabız" },
  { variant: "bounce", label: "Zıplayan" },
  { variant: "grid", label: "Izgara" },
]

/** Dots: low enough to sit next to text or inside a chat bubble. */
export default function SpinnerDots() {
  return (
    <PreviewColor>
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
        {variants.map(({ variant, label }) => (
          <div key={variant} className="flex w-24 flex-col items-center gap-3">
            <Spinner variant={variant} className="size-6" />
            <div className="grid justify-items-center gap-0.5">
              <span className="text-center text-[13px] font-medium text-foreground">{label}</span>
              <code className="font-mono text-xs text-muted-foreground">{variant}</code>
            </div>
          </div>
        ))}
      </div>
    </PreviewColor>
  )
}
