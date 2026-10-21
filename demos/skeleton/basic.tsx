import { Skeleton } from "@/components/ui/skeleton"

/** shadcn's example: an avatar and two lines of text. */
export default function SkeletonBasic() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
