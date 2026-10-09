"use client"

import * as React from "react"

/** Anchored overlays: Radix popovers, menus and selects, and Base UI comboboxes. */
const ANCHORED = "[data-radix-popper-content-wrapper], [data-slot=combobox-content]"
/** Modal overlays: dialogs, alert dialogs, sheets and drawers. */
const MODAL = "[role=dialog][data-state=open], [role=alertdialog][data-state=open]"
/** Room below an open overlay so its shadow is not cut off. */
const OVERLAY_GAP = 16
/** Distance between a trigger and its overlay (sideOffset of popovers and comboboxes). */
const OVERLAY_OFFSET = 6
/** Tallest an anchored overlay gets; lists scroll beyond it (combobox list is 18rem). */
const ANCHORED_MAX_HEIGHT = 360
/** Height a full-height side sheet gets; it has no height of its own to measure. */
const SIDE_PANEL_HEIGHT = 560

/** Height the frame needs so an anchored overlay fits below its trigger. */
function anchoredHeight(overlay: Element) {
  const content = overlay.matches("[data-radix-popper-content-wrapper]") ? (overlay.firstElementChild ?? overlay) : overlay
  const rect = content.getBoundingClientRect()
  // Menus and lists shrink to the space left in the frame (--available-height), so
  // measure what they would take: add back the part hidden in their scroll areas.
  let hidden = 0
  for (const el of [content, ...content.querySelectorAll("*")]) {
    if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY))
      hidden += el.scrollHeight - el.clientHeight
  }
  const height = Math.min(rect.height + hidden, Math.max(rect.height, ANCHORED_MAX_HEIGHT))
  // Room for the overlay below its trigger. Without it the overlay flips above the
  // trigger, where growing the frame cannot reveal it.
  const trigger =
    (content.id && document.querySelector(`[aria-controls="${CSS.escape(content.id)}"]`)) ||
    document.querySelector("[aria-expanded=true]")
  const bottom = trigger ? trigger.getBoundingClientRect().bottom + OVERLAY_OFFSET + height : rect.top + height
  return bottom + window.scrollY + OVERLAY_GAP
}

/** Height the frame needs to show a modal whole, centered or docked to an edge. */
function modalHeight(modal: Element) {
  // A left or right sheet is stretched between top and bottom; anything else has its own height.
  const style = getComputedStyle(modal)
  if (style.top === "0px" && style.bottom === "0px") return SIDE_PANEL_HEIGHT
  const height = modal.getBoundingClientRect().height
  // A drawer caps its height at a share of the frame (85vh). While it is capped, keep
  // growing; once it fits, stay tall enough that the cap does not cut it again.
  const maxHeight = parseFloat(style.maxHeight)
  if (!Number.isFinite(maxHeight)) return height + 3 * OVERLAY_GAP
  if (height >= maxHeight - 0.5) return window.innerHeight + 10 * OVERLAY_GAP
  return Math.max(height + 3 * OVERLAY_GAP, Math.ceil((height / maxHeight) * window.innerHeight) + 8)
}

/**
 * Posts the height of its parent element to the embedding window, so the iframe in the
 * ikas developer docs can size itself to the demo instead of the viewport.
 * While a popover, menu, combobox, dialog, sheet or drawer is open the height grows to
 * fit it, so it is not clipped by the iframe, and shrinks back when it closes.
 * The docs can ask for it again with `{ type: "ikas-ui:height-request" }`, e.g. when
 * their listener attached after the first message was sent.
 */
export function FrameHeightReporter() {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const target = ref.current?.parentElement
    if (!target || window.parent === window) return
    let last = 0
    const post = () => {
      let height = target.getBoundingClientRect().height
      for (const overlay of document.querySelectorAll(ANCHORED)) height = Math.max(height, anchoredHeight(overlay))
      for (const modal of document.querySelectorAll(MODAL)) height = Math.max(height, modalHeight(modal))
      height = Math.ceil(height)
      if (height === last) return
      last = height
      window.parent.postMessage({ type: "ikas-ui:height", height }, "*")
    }
    const onMessage = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === "ikas-ui:height-request") {
        last = 0
        post()
      }
    }
    const resize = new ResizeObserver(post)
    resize.observe(target)
    // Overlays mount in a portal directly on <body>, then get positioned through their
    // style; watch only those, not the demo's own animations.
    const moves = new MutationObserver(post)
    const portals = new MutationObserver(() => {
      for (const overlay of document.querySelectorAll(`${ANCHORED}, ${MODAL}`)) {
        resize.observe(overlay)
        moves.observe(overlay, { attributes: true, attributeFilter: ["style", "data-state"] })
      }
      requestAnimationFrame(post)
    })
    portals.observe(document.body, { childList: true })
    window.addEventListener("message", onMessage)
    return () => {
      resize.disconnect()
      moves.disconnect()
      portals.disconnect()
      window.removeEventListener("message", onMessage)
    }
  }, [])

  return <span ref={ref} hidden />
}
