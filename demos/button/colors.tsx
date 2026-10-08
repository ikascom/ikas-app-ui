import { Button } from "@/components/ui/button"

const colors = ["neutral", "blue", "violet", "green", "lime", "amber", "red"] as const
const variants = ["solid", "soft", "outline", "ghost"] as const

export default function ButtonColors() {
  return (
    <div className="grid w-full grid-cols-[auto_repeat(7,minmax(0,1fr))] items-center gap-x-3 gap-y-4 overflow-x-auto">
      <span />
      {colors.map((color) => (
        <span key={color} className="text-center font-mono text-[11px] text-muted-foreground">
          {color}
        </span>
      ))}
      {variants.map((variant) => (
        <div key={variant} className="contents">
          <span className="pr-2 font-mono text-[11px] text-muted-foreground">{variant}</span>
          {colors.map((color) => (
            <div key={color} className="flex justify-center">
              <Button variant={variant} color={color} size="sm">
                Button
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
