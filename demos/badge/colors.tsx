import { Badge } from "@/components/ui/badge"

const colors = ["neutral", "blue", "violet", "green", "lime", "amber", "red"] as const

export default function BadgeColors() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((color) => (
        <Badge key={color} color={color}>
          {color}
        </Badge>
      ))}
    </div>
  )
}
