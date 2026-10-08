import { notFound } from "next/navigation"

import { embeds, type EmbedName } from "@/preview/embeds"
import { FrameHeightReporter } from "@/preview/frame-height-reporter"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(embeds).map((name) => ({ name }))
}

/** A visual docs block (principles, tokens, motion), embedded by builders.ikas.com at /ui-preview/embed/<name>. */
export default async function EmbedPreviewPage({ params }: PageProps<"/embed/[name]">) {
  const { name } = await params
  const Embed = embeds[name as EmbedName]
  if (!Embed) notFound()

  return (
    <div className="bg-background p-6">
      <Embed />
      <FrameHeightReporter />
    </div>
  )
}
