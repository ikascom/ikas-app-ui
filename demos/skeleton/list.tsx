import { Skeleton } from "@/components/ui/skeleton"

/** An order list while it loads: each row keeps the number, status and total in place. */
export default function SkeletonList() {
  return (
    <div className="w-full max-w-md divide-y rounded-xl border bg-card">
      {[24, 20, 28, 16].map((name, i) => (
        <div key={i} className="flex h-14 items-center gap-4 px-4">
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3" style={{ width: `${name * 4}px` }} />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  )
}
