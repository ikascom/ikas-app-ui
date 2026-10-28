"use client"

import * as React from "react"
import { type HTMLMotionProps, Reorder, useDragControls, useReducedMotion } from "motion/react"
import { GripVerticalIcon, Undo2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { springOrInstant } from "@/lib/motion"
import { Button } from "@/components/ui/button"

type MoveDirection = -1 | 1 | "first" | "last"

type StackContextValue = {
  ids: string[]
  labels: Map<string, string>
  label: string
  disabled: boolean
  instructions: string
  itemClassName?: string
  canUndo: boolean
  /** True while any row is being dragged, so the other rows drop their hover. */
  dragging: boolean
  reorder: (ids: string[]) => void
  move: (id: string, direction: MoveDirection) => void
  undo: () => void
  beginDrag: () => void
  finishDrag: (id: string) => void
}

const StackContext = React.createContext<StackContextValue | null>(null)
const ItemContext = React.createContext<{
  id: string
  label: string
  controls: ReturnType<typeof useDragControls>
  dragging: boolean
} | null>(null)

function useStackContext(part: string) {
  const context = React.useContext(StackContext)
  if (!context) throw new Error(`${part} must be used within SortableStack.`)
  return context
}

/** Order and undo actions for your own controls, e.g. a "Move to top" menu item. */
function useSortableStack() {
  const context = useStackContext("useSortableStack")
  return {
    ids: context.ids,
    disabled: context.disabled,
    canUndo: context.canUndo,
    moveItem: context.move,
    undo: context.undo,
  }
}

type SortableStackProps<T extends { id: string }> = {
  /** Controlled items in their current order. Pair with `onItemsChange`. */
  items?: T[]
  /** Starting items when uncontrolled. */
  defaultItems?: T[]
  /** Called with the new order once a drag ends, and after each keyboard move and undo. Save it here if the order should persist. */
  onItemsChange?: (items: T[]) => void
  /** Row contents for the built-in layout (handle, content and undo) when `children` is omitted. */
  renderItem?: (item: T, index: number) => React.ReactNode
  /** Name read by screen readers in move announcements and handle labels. */
  getItemLabel: (item: T) => string
  /** Your own composition of the parts. A function receives the items in their current order. */
  children?: React.ReactNode | ((items: T[]) => React.ReactNode)
  /** Accessible name of the list. */
  label?: string
  /** Turns off dragging, keyboard moves and undo. */
  disabled?: boolean
  /** Shows the undo button under the list in the built-in layout. */
  showUndo?: boolean
  className?: string
  /** Extra classes for every row. */
  itemClassName?: string
}

/**
 * A vertical list the user reorders by dragging a handle or with the keyboard, with one step of undo.
 * Stable item ids keep focus and content attached to their row while it moves.
 */
function SortableStack<T extends { id: string }>({
  items: controlledItems,
  defaultItems = [],
  onItemsChange,
  renderItem,
  getItemLabel,
  children,
  label = "Sıralanabilir öğeler",
  disabled = false,
  showUndo = true,
  className,
  itemClassName,
}: SortableStackProps<T>) {
  const [internalItems, setInternalItems] = React.useState(defaultItems)
  // The order while a drag is in progress; published once when it ends.
  const [draft, setDraft] = React.useState<T[] | null>(null)
  const source = controlledItems ?? internalItems
  const items = draft ?? source
  const ids = items.map((item) => item.id)
  if (new Set(ids).size !== ids.length) throw new Error("SortableStack requires unique item ids.")
  if (children === undefined && !renderItem) throw new Error("SortableStack requires children or renderItem.")
  const [previous, setPrevious] = React.useState<string[] | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [dragging, setDragging] = React.useState(false)
  const dragStart = React.useRef<string[] | null>(null)
  const instructions = React.useId()
  const root = React.useRef<HTMLDivElement>(null)
  const pendingFocus = React.useRef<string | null>(null)
  const live = React.useRef(items)

  React.useLayoutEffect(() => {
    live.current = items
    if (pendingFocus.current !== null) {
      const target = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("button[data-sortable-id]") ?? []).find(
        (button) => button.dataset.sortableId === pendingFocus.current
      )
      pendingFocus.current = null
      target?.focus({ preventScroll: true })
    }
  })

  const moved = (item: T, index: number, count: number) => `${getItemLabel(item)}, ${count} öğeden ${index + 1}. sıraya taşındı.`

  const change = (next: T[]) => {
    live.current = next
    if (controlledItems === undefined) setInternalItems(next)
    onItemsChange?.(next)
  }

  const reorder = (nextIds: string[]) => {
    if (disabled) return
    const byId = new Map(live.current.map((item) => [item.id, item]))
    const next = nextIds.flatMap((id) => {
      const item = byId.get(id)
      return item ? [item] : []
    })
    // Rows can be removed during a drag. Only publish a full permutation.
    if (next.length !== live.current.length || new Set(nextIds).size !== next.length) return
    if (dragStart.current === null) return change(next)
    live.current = next
    setDraft(next)
  }

  const move = (id: string, direction: MoveDirection) => {
    const current = live.current
    const from = current.findIndex((item) => item.id === id)
    const to = direction === "first" ? 0 : direction === "last" ? current.length - 1 : from + direction
    if (disabled || from < 0 || to < 0 || to >= current.length || from === to) return
    const next = [...current]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setPrevious(current.map((item) => item.id))
    change(next)
    setAnnouncement(moved(item, to, current.length))
  }

  if (previous !== null && (previous.length !== ids.length || previous.some((id) => !ids.includes(id)))) setPrevious(null)
  const canUndo =
    previous !== null && previous.length === ids.length && previous.every((id) => ids.includes(id)) && previous.some((id, index) => id !== ids[index])

  const undo = () => {
    if (disabled || !previous || !canUndo) return
    pendingFocus.current = previous.find((id, index) => id !== ids[index]) ?? previous[0]
    reorder(previous)
    setPrevious(null)
    setAnnouncement("Önceki sıra geri yüklendi.")
  }

  const context: StackContextValue = {
    ids,
    labels: new Map(items.map((item) => [item.id, getItemLabel(item)])),
    label,
    disabled,
    instructions,
    itemClassName,
    canUndo,
    dragging,
    reorder,
    move,
    undo,
    beginDrag: () => {
      dragStart.current = live.current.map((item) => item.id)
      setDragging(true)
    },
    finishDrag: (id) => {
      const before = dragStart.current
      dragStart.current = null
      setDragging(false)
      setDraft(null)
      // Apply the dragged order to the latest items, in case rows came or went during the drag.
      const rank = new Map(live.current.map((item, index) => [item.id, index]))
      const current = [...source].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity))
      const index = current.findIndex((item) => item.id === id)
      const item = current[index]
      if (item && before?.some((oldId, at) => oldId !== current[at]?.id)) {
        change(current)
        setPrevious(before)
        setAnnouncement(moved(item, index, current.length))
      }
    },
  }

  return (
    <StackContext.Provider value={context}>
      <div ref={root} data-slot="sortable-stack" className={cn("w-full min-w-0", className)}>
        <p id={instructions} className="sr-only">
          Sıralamak için tutamacı sürükleyin. Tutamaç odaktayken yukarı ve aşağı oklarla taşıyın, Home ve End ile başa veya sona alın.
        </p>
        {children === undefined ? (
          <>
            <SortableStackGroup aria-label={label}>
              {items.map((item, index) => (
                <SortableStackItem key={item.id} id={item.id}>
                  <SortableStackHandle />
                  <SortableStackItemContent>{renderItem?.(item, index)}</SortableStackItemContent>
                </SortableStackItem>
              ))}
            </SortableStackGroup>
            {showUndo && <SortableStackUndo className="mt-3" />}
          </>
        ) : typeof children === "function" ? (
          children(items)
        ) : (
          children
        )}
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    </StackContext.Provider>
  )
}

type SortableStackGroupProps = Omit<HTMLMotionProps<"ul">, "children"> & {
  children?: React.ReactNode
}

/** The ordered rows. Keep headers and the undo button outside it. */
function SortableStackGroup({ className, ...props }: SortableStackGroupProps) {
  const context = useStackContext("SortableStackGroup")
  return (
    <Reorder.Group
      {...props}
      axis="y"
      values={context.ids}
      onReorder={context.reorder}
      data-slot="sortable-stack-group"
      aria-label={props["aria-label"] ?? context.label}
      className={cn("flex flex-col gap-0.5", className)}
    />
  )
}

type SortableStackItemProps = Omit<HTMLMotionProps<"li">, "id" | "value" | "children"> & {
  /** Id of an item passed to the root. Use it as the React key too. */
  id: string
  children?: React.ReactNode
}

/** One row. Lifts with an overlay shadow while dragged and glides to its new place. */
function SortableStackItem({ id, children, className, onDragStart, onDragEnd, ...props }: SortableStackItemProps) {
  const context = useStackContext("SortableStackItem")
  const controls = useDragControls()
  const reduce = useReducedMotion()
  const [dragging, setDragging] = React.useState(false)
  const label = context.labels.get(id)
  if (label === undefined) throw new Error(`SortableStackItem ${id} is not present in the root items.`)

  return (
    <ItemContext.Provider value={{ id, label, controls, dragging }}>
      <Reorder.Item
        {...props}
        value={id}
        dragListener={false}
        dragControls={controls}
        layout="position"
        transition={springOrInstant(reduce)}
        onDragStart={(event, info) => {
          setDragging(true)
          context.beginDrag()
          onDragStart?.(event, info)
        }}
        onDragEnd={(event, info) => {
          setDragging(false)
          context.finishDrag(id)
          onDragEnd?.(event, info)
        }}
        whileDrag={reduce ? undefined : { scale: 1.02 }}
        aria-posinset={context.ids.indexOf(id) + 1}
        aria-setsize={context.ids.length}
        data-slot="sortable-stack-item"
        data-dragging={dragging || undefined}
        className={cn(
          // bg-card stays on so a row gliding back over its neighbour never shows through.
          "relative flex items-center gap-2.5 rounded-lg bg-card py-1.5 pr-2.5 pl-1 transition-[background-color] duration-150 ease-out",
          // The lift shadow fades in faster than it fades out.
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:shadow-overlay after:transition-opacity after:duration-200 after:ease-(--ease-out) data-dragging:after:opacity-100 data-dragging:after:duration-150",
          !context.dragging && "hover:bg-muted/60",
          context.itemClassName,
          className
        )}
      >
        {children}
      </Reorder.Item>
    </ItemContext.Provider>
  )
}

type SortableStackHandleProps = Omit<React.ComponentProps<"button">, "color">

/** The grip that starts a drag. With focus, ↑ ↓ move one step and Home End move to the edges. */
function SortableStackHandle({ children, className, disabled, onPointerDown, onKeyDown, style, ...props }: SortableStackHandleProps) {
  const context = useStackContext("SortableStackHandle")
  const item = React.useContext(ItemContext)
  if (!item) throw new Error("SortableStackHandle must be used within SortableStackItem.")
  const unavailable = disabled || context.disabled

  return (
    <Button
      {...props}
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={unavailable}
      data-sortable-id={item.id}
      aria-label={props["aria-label"] ?? `Yeniden sırala: ${item.label}`}
      aria-describedby={[context.instructions, props["aria-describedby"]].filter(Boolean).join(" ")}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!event.defaultPrevented && !unavailable && event.button === 0) {
          event.currentTarget.focus({ preventScroll: true })
          item.controls.start(event)
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || unavailable || event.altKey || event.ctrlKey || event.metaKey) return
        const direction = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : event.key === "Home" ? "first" : event.key === "End" ? "last" : null
        if (direction !== null) {
          event.preventDefault()
          context.move(item.id, direction)
        }
      }}
      className={cn("touch-none text-icon hover:text-foreground", item.dragging && "bg-(--c-subtle) text-foreground", className)}
      style={{
        cursor: unavailable ? undefined : item.dragging ? "grabbing" : "grab",
        ...style,
      }}
    >
      {children ?? <GripVerticalIcon aria-hidden />}
    </Button>
  )
}

type SortableStackItemContentProps = React.ComponentProps<"div">

/** Takes the row's free width; truncate long text inside it. */
function SortableStackItemContent({ className, ...props }: SortableStackItemContentProps) {
  return <div data-slot="sortable-stack-item-content" className={cn("min-w-0 flex-1", className)} {...props} />
}

type SortableStackUndoProps = Omit<React.ComponentProps<"button">, "color">

/** Restores the order before the last move. Disabled until something moves. */
function SortableStackUndo({ children, className, disabled, onClick, ...props }: SortableStackUndoProps) {
  const context = useStackContext("SortableStackUndo")
  return (
    <Button
      {...props}
      type="button"
      variant="ghost"
      size="xs"
      disabled={disabled || context.disabled || !context.canUndo}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) context.undo()
      }}
    >
      {children ?? (
        <>
          <Undo2Icon data-icon="inline-start" aria-hidden />
          Sırayı geri al
        </>
      )}
    </Button>
  )
}

export {
  SortableStack,
  SortableStackGroup,
  SortableStackItem,
  SortableStackHandle,
  SortableStackItemContent,
  SortableStackUndo,
  useSortableStack,
  type SortableStackProps,
  type SortableStackGroupProps,
  type SortableStackItemProps,
  type SortableStackHandleProps,
  type SortableStackItemContentProps,
  type SortableStackUndoProps,
}
