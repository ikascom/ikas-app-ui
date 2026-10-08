"use client"

import * as React from "react"

/**
 * Posts the height of its parent element to the embedding window, so the iframe in the
 * ikas developer docs can size itself to the demo instead of the viewport.
 */
export function FrameHeightReporter() {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const target = ref.current?.parentElement
    if (!target || window.parent === window) return
    const post = () =>
      window.parent.postMessage({ type: "ikas-ui:height", height: Math.ceil(target.getBoundingClientRect().height) }, "*")
    const observer = new ResizeObserver(post)
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return <span ref={ref} hidden />
}
