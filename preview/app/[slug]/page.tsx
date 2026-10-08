import { notFound } from "next/navigation"

import { examples, type ExampleSlug } from "@/examples"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(examples).map((slug) => ({ slug }))
}

/** A full example screen, embedded by builders.ikas.com at /ui-preview/<slug>. */
export default async function ExamplePreviewPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params
  const example = examples[slug as ExampleSlug]
  if (!example) notFound()
  const { Component } = example

  return (
    <div className="min-h-dvh bg-background">
      <Component />
    </div>
  )
}
