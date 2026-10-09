import { notFound } from "next/navigation"

import { demos, type DemoId } from "@/demos"
import { FrameHeightReporter } from "@/preview/frame-height-reporter"

export const dynamicParams = false

/**
 * Room reserved below demos whose list opens under the field. Base UI keeps a list on
 * the side it opened on, so in a short docs iframe it would open upward and squeezed;
 * growing the frame afterwards does not move it back.
 */
const reserveHeight: Partial<Record<DemoId, string>> = {
  "combobox/basic": "min-h-96",
  "combobox/multiple": "min-h-96",
}

export function generateStaticParams() {
  return Object.keys(demos).map((id) => ({ id: id.split("/") }))
}

/** One demo without chrome, embedded by builders.ikas.com at /ui-preview/demo/<id>?align=center|start|stretch (&theme=light|dark, see PreviewQueryScript). */
export default async function DemoPreviewPage({ params }: PageProps<"/demo/[...id]">) {
  const { id } = await params
  const demoId = id.join("/") as DemoId
  const Demo = demos[demoId]
  if (!Demo) notFound()

  return (
    <div
      data-demo-root
      data-reserve={reserveHeight[demoId] ? "" : undefined}
      className={`flex w-full bg-background px-6 py-10 sm:px-10 ${reserveHeight[demoId] ?? "min-h-36"}`}
    >
      <Demo />
      <FrameHeightReporter />
    </div>
  )
}
