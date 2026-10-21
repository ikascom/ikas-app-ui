import { Skeleton, type SkeletonVariant } from "@/components/ui/skeleton"

const variants: { variant: SkeletonVariant; label: string }[] = [
  { variant: "pulse", label: "Nabız (varsayılan)" },
  { variant: "shimmer", label: "Parıltı" },
]

/** shadcn's example (an avatar and two lines of text) in both looks, side by side. Set the look app-wide with SkeletonProvider. */
export default function SkeletonBasic() {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-6">
      {variants.map(({ variant, label }) => (
        <figure key={variant} className="flex flex-col gap-3">
          <figcaption className="text-[13px] text-muted-foreground">{label}</figcaption>
          <div className="flex items-center gap-4">
            <Skeleton variant={variant} className="size-12 shrink-0 rounded-full" />
            <div className="grid gap-2">
              <Skeleton variant={variant} className="h-4 w-[200px]" />
              <Skeleton variant={variant} className="h-4 w-[160px]" />
            </div>
          </div>
        </figure>
      ))}
    </div>
  )
}
