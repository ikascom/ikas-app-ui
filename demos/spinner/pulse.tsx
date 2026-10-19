import { Spinner, type SpinnerVariant } from "@/components/ui/spinner"

import { PreviewColor } from "@/demos/spinner/_preview-color"

const variants: { variant: SpinnerVariant; label: string }[] = [
  { variant: "ripple", label: "Yayılan" },
  { variant: "ping", label: "Ping" },
  { variant: "orbit", label: "Yörünge" },
]

/** Pulse: waiting for something to answer, such as a connection or a background job. */
export default function SpinnerPulse() {
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
