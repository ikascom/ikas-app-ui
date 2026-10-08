"use client"

import * as React from "react"

/** Copies ?align= onto <html data-align>, where preview CSS picks it up. */
export function AlignFromQuery() {
  React.useEffect(() => {
    const align = new URLSearchParams(window.location.search).get("align")
    if (align) document.documentElement.dataset.align = align
  }, [])
  return null
}
