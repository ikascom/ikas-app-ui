import { notFound } from "next/navigation"

import { demos, type DemoId } from "@/demos"
import { AlignFromQuery } from "@/preview/align-from-query"
import { FrameHeightReporter } from "@/preview/frame-height-reporter"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(demos).map((id) => ({ id: id.split("/") }))
}

/** One demo without chrome, embedded by builders.ikas.com at /ui-preview/demo/<id>?align=center|start|stretch. */
export default async function DemoPreviewPage({ params }: PageProps<"/demo/[...id]">) {
  const { id } = await params
  const Demo = demos[id.join("/") as DemoId]
  if (!Demo) notFound()

  return (
    <div data-demo-root className="flex min-h-36 w-full bg-background px-6 py-10 sm:px-10">
      <Demo />
      <AlignFromQuery />
      <FrameHeightReporter />
    </div>
  )
}
