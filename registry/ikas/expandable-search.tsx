"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { springOrInstant } from "@/lib/motion"

type ExpandableSearchProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Accessible name of the input. Defaults to the placeholder. */
  label?: string
}

/** A search icon that opens into an input. Stays open while it has a value. */
function ExpandableSearch({ value, onValueChange, placeholder = "Ara", className, label }: ExpandableSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [mobile, setMobile] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const reduce = useReducedMotion()
  const expanded = open || value !== ""

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)")
    const update = () => setMobile(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  function expand() {
    setOpen(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function close() {
    onValueChange("")
    setOpen(false)
  }

  return (
    <div
      data-slot="expandable-search"
      data-expanded={expanded || undefined}
      className={cn(
        "flex h-8 items-center rounded-lg transition-[background-color,box-shadow] duration-150 ease-out",
        expanded ? "bg-card shadow-raised focus-within:ring-3 focus-within:ring-ring/25" : "hover:bg-foreground/[0.04]",
        className
      )}
    >
      <button
        type="button"
        aria-label={expanded ? undefined : (label ?? placeholder)}
        aria-hidden={expanded || undefined}
        tabIndex={expanded ? -1 : 0}
        onClick={expand}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-icon outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <SearchIcon className="size-4" data-anim="pop" />
      </button>
      <motion.div
        initial={false}
        animate={{ width: expanded ? (mobile ? 160 : 220) : 0, opacity: expanded ? 1 : 0 }}
        transition={springOrInstant(reduce)}
        className="flex items-center overflow-hidden"
      >
        <input
          ref={inputRef}
          value={value}
          tabIndex={expanded ? 0 : -1}
          aria-label={label ?? placeholder}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              close()
              inputRef.current?.blur()
            }
          }}
          onBlur={() => {
            if (value === "") setOpen(false)
          }}
          className="h-8 min-w-0 flex-1 bg-transparent pr-1 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        {value !== "" && (
          <button
            type="button"
            aria-label="Aramayı temizle"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onValueChange("")
              inputRef.current?.focus()
            }}
            className="mr-1.5 flex size-5 shrink-0 items-center justify-center rounded-md text-icon outline-none transition-[color,scale] duration-150 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-90"
          >
            <XIcon className="size-3" />
          </button>
        )}
      </motion.div>
    </div>
  )
}

export { ExpandableSearch, type ExpandableSearchProps }
