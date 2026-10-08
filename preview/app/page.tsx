import Link from "next/link"

import { demos } from "@/demos"
import { examples } from "@/examples"

/** Index of every preview route. Handy locally; builders never links here. */
export default function PreviewIndex() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-8 text-sm">
      <section className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Examples</h1>
        {Object.entries(examples).map(([slug, example]) => (
          <Link key={slug} href={`/${slug}`} className="text-primary hover:underline">
            {example.title}
          </Link>
        ))}
      </section>
      <section className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Demos</h2>
        {Object.keys(demos).map((id) => (
          <Link key={id} href={`/demo/${id}`} className="font-mono text-[13px] text-muted-foreground hover:text-foreground">
            {id}
          </Link>
        ))}
      </section>
    </main>
  )
}
