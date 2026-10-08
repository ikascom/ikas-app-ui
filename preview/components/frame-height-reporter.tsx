"use client"

import * as React from "react"

/**
 * Posts the height of its parent element to the embedding window, so the iframe in the
 * ikas developer docs can size itself to the demo instead of the viewport.
 * The docs can ask for it again with `{ type: "ikas-ui:height-request" }`, e.g. when
 * their listener attached after the first message was sent.
 */
export function FrameHeightReporter() {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const target = ref.current?.parentElement
    if (!target || window.parent === window) return
    const post = () =>
      window.parent.postMessage({ type: "ikas-ui:height", height: Math.ceil(target.getBoundingClientRect().height) }, "*")
    const onMessage = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === "ikas-ui:height-request") post()
    }
    const observer = new ResizeObserver(post)
    observer.observe(target)
    window.addEventListener("message", onMessage)
    return () => {
      observer.disconnect()
      window.removeEventListener("message", onMessage)
    }
  }, [])

  return <span ref={ref} hidden />
}
