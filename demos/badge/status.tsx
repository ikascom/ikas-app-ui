import { Badge } from "@/components/ui/badge"
import { fulfillmentBadge, paymentBadge } from "@/demos/_data"

export default function BadgeStatus() {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {Object.values(paymentBadge).map((status) => (
          <Badge key={status.label} tone={status.tone} dot>
            {status.label}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.values(fulfillmentBadge).map((status) => (
          <Badge key={status.label} tone={status.tone}>
            {status.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
