import { Badge } from "@/components/ui/badge"

const statuses = ["neutral", "info", "success", "warning", "danger"] as const
const variants = ["soft", "solid", "surface"] as const

export default function BadgeVariants() {
  return (
    <div className="grid grid-cols-[auto_repeat(5,auto)] items-center gap-x-4 gap-y-3">
      {variants.map((variant) => (
        <div key={variant} className="contents">
          <span className="pr-2 font-mono text-[11px] text-muted-foreground">{variant}</span>
          {statuses.map((status) => (
            <Badge key={status} status={status} variant={variant}>
              {status}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  )
}
