import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FeatureGate, type FeatureGateColor } from "@/components/ikas/feature-gate"

const palette: FeatureGateColor[] = ["violet", "neutral", "blue", "green", "lime", "amber", "red"]

export default function FeatureGateColors() {
  return (
    <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {palette.map((color) => (
        <div key={color} className="flex flex-col gap-2">
          <code className="font-mono text-xs text-muted-foreground">{`color="${color}"`}</code>
          <Card className="overflow-hidden py-0">
            <FeatureGate locked color={color} title="Webhook'lar" description="Olayları dış sistemlerinize anlık gönderin.">
              <div className="flex flex-col gap-4 p-4">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center gap-3">
                    <Skeleton className="size-7 rounded-md" />
                    <Skeleton className="h-2 flex-1" />
                    <Skeleton className="h-4 w-10 rounded-full" />
                  </div>
                ))}
              </div>
            </FeatureGate>
          </Card>
        </div>
      ))}
    </div>
  )
}
