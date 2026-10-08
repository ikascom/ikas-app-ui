import { Badge } from "@/components/ui/badge"
import { channelSyncBadge, orderStatusBadge } from "@/demos/_data"

export default function BadgeOrderStatuses() {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {Object.values(orderStatusBadge).map((badge) => (
          <Badge key={badge.label} status={badge.status} dot>
            {badge.label}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.values(channelSyncBadge).map((badge) => (
          <Badge key={badge.label} variant="surface" status={badge.status}>
            {badge.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
