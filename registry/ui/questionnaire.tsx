"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonColor, type ButtonProps, type ButtonVariant } from "@/components/ui/button"

/*
 * Same parts and props as the shadcn/ui Questionnaire, without @shadcn/react: that
 * package only declares its entry points through `exports`, which TypeScript's
 * "moduleResolution": "node" (used by many ikas apps) cannot read.
 */

type QuestionnaireStatus = "unanswered" | "answered" | "skipped"
type QuestionnaireShortcuts = "letters" | "numbers"

type QuestionnaireItemDefinition = {
  name: string
  required?: boolean
  disabled?: boolean
  choices?: readonly { value: string; disabled?: boolean }[]
}

/** Text input answers share one key in the item's selection. */
const INPUT_ANSWER = "\u0000input"

const shortcutKeys = (mode: QuestionnaireShortcuts | undefined) =>
  mode === "letters"
    ? Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
    : mode === "numbers"
      ? Array.from({ length: 9 }, (_, i) => String(i + 1))
      : []

const isTextField = (el: EventTarget | null) =>
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement ||
  (el instanceof HTMLInputElement && !["button", "checkbox", "radio", "reset", "submit"].includes(el.type)) ||
  (el instanceof HTMLElement && el.isContentEditable)

type ItemHandle = {
  name: string
  element: HTMLFieldSetElement
  disabled: boolean
  required: boolean
  /** Marks the item as attempted; false when it still needs an answer. */
  validate: () => boolean
  focus: () => void
  focusInvalid: () => void
  skip: () => void
  reset: () => void
  answerByShortcut: (key: string) => HTMLInputElement | null
}

type RootContextValue = {
  activeName: string | null
  activeRequired: boolean
  activeStatus: QuestionnaireStatus | null
  current: number
  total: number
  first: boolean
  last: boolean
  shortcuts: QuestionnaireShortcuts | undefined
  definitions: Map<string, QuestionnaireItemDefinition> | null
  registerItem: (handle: ItemHandle) => () => void
  reportStatus: (name: string, status: QuestionnaireStatus) => void
  goNext: () => void
  goPrevious: () => void
  skipCurrent: () => void
}

const RootContext = React.createContext<RootContextValue | null>(null)

function useRoot(part: string) {
  const context = React.useContext(RootContext)
  if (!context) throw new Error(`${part} must be used inside <Questionnaire>.`)
  return context
}

type QuestionnaireProps = Omit<React.ComponentProps<"form">, "defaultValue"> & {
  /** Item order and settings. Without it, rendered items are used in DOM order. */
  items?: readonly QuestionnaireItemDefinition[]
  /** Item shown first when uncontrolled. */
  defaultItem?: string
  /** Active item name, for controlled navigation. */
  item?: string
  /** Called with the name of the item that becomes active. */
  onItemChange?: (item: string) => void
  /** Letter or number keys that pick a choice in the active item. */
  shortcuts?: QuestionnaireShortcuts
}

/**
 * Multi-step form, one question at a time: single or multiple choice, free text,
 * skippable items, validation and progress. The host owns closing, saving and branching.
 * Read the answers in onSubmit with `new FormData(event.currentTarget)`.
 */
function Questionnaire({
  className,
  items,
  defaultItem,
  item,
  onItemChange,
  shortcuts,
  onSubmit,
  onReset,
  onKeyDown,
  children,
  ...props
}: QuestionnaireProps) {
  const [handles, setHandles] = React.useState<ReadonlyMap<string, ItemHandle>>(() => new Map())
  const [statuses, setStatuses] = React.useState<Record<string, QuestionnaireStatus>>({})
  const [internal, setInternal] = React.useState<string | null>(defaultItem ?? null)
  const pendingFocus = React.useRef<{ name: string; invalid: boolean } | null>(null)

  const definitions = React.useMemo(() => (items ? new Map(items.map((d) => [d.name, d])) : null), [items])

  const order = React.useMemo(() => {
    // With `items` the order is known before any item mounts, so the server render
    // already shows the first question.
    if (items) return items.filter((d) => !d.disabled && !handles.get(d.name)?.disabled).map((d) => d.name)
    return [...handles.values()]
      .filter((h) => !h.disabled)
      .sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .map((h) => h.name)
  }, [items, handles])

  const requested = item !== undefined ? item : internal
  const activeName = requested && order.includes(requested) ? requested : (order[0] ?? null)
  const index = activeName ? order.indexOf(activeName) : -1
  const total = order.length
  const active = activeName ? handles.get(activeName) : undefined

  const go = React.useCallback(
    (name: string, invalid = false) => {
      pendingFocus.current = { name, invalid }
      if (item === undefined) setInternal(name)
      onItemChange?.(name)
      // Same item (e.g. failed validation) does not re-render; focus right away.
      if (name === activeName) {
        const handle = handles.get(name)
        if (invalid) handle?.focusInvalid()
        else handle?.focus()
        pendingFocus.current = null
      }
    },
    [item, onItemChange, activeName, handles]
  )

  React.useLayoutEffect(() => {
    const pending = pendingFocus.current
    if (!pending || pending.name !== activeName) return
    const handle = handles.get(pending.name)
    if (pending.invalid) handle?.focusInvalid()
    else handle?.focus()
    pendingFocus.current = null
  }, [activeName, handles])

  const formRef = React.useRef<HTMLFormElement>(null)

  const goNext = React.useCallback(() => {
    if (!active || index < 0) return
    if (!active.validate()) return go(active.name, true)
    if (index === total - 1) formRef.current?.requestSubmit()
    else go(order[index + 1])
  }, [active, index, total, order, go])

  const goPrevious = React.useCallback(() => {
    if (index > 0) go(order[index - 1])
  }, [index, order, go])

  const skipCurrent = React.useCallback(() => {
    if (!active || active.required) return
    active.skip()
    if (index === total - 1) queueMicrotask(() => formRef.current?.requestSubmit())
    else go(order[index + 1])
  }, [active, index, total, order, go])

  const registerItem = React.useCallback((handle: ItemHandle) => {
    setHandles((map) => new Map(map).set(handle.name, handle))
    return () =>
      setHandles((map) => {
        if (map.get(handle.name) !== handle) return map
        const next = new Map(map)
        next.delete(handle.name)
        return next
      })
  }, [])

  const reportStatus = React.useCallback((name: string, status: QuestionnaireStatus) => {
    setStatuses((s) => (s[name] === status ? s : { ...s, [name]: status }))
  }, [])

  const handleSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = (event) => {
    const invalid = order.map((name) => handles.get(name)).find((h) => h && !h.validate())
    if (invalid) {
      event.preventDefault()
      go(invalid.name, true)
      return
    }
    onSubmit?.(event)
  }

  function handleReset(event: React.FormEvent<HTMLFormElement>) {
    onReset?.(event)
    if (event.defaultPrevented) return
    for (const handle of handles.values()) handle.reset()
    const start = defaultItem && order.includes(defaultItem) ? defaultItem : order[0]
    if (start) go(start)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.nativeEvent.isComposing || !active) return
    const target = event.target
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      if (!event.repeat) goNext()
      return
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const inAnswer = target instanceof HTMLInputElement && active.element.contains(target)
    if (event.key === "Enter" && inAnswer) {
      event.preventDefault()
      if (!event.repeat) goNext()
      return
    }
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && inAnswer && target.type === "checkbox") {
      const answers = [...active.element.querySelectorAll<HTMLInputElement>("input:not(:disabled)")]
      const next = answers[(answers.indexOf(target) + (event.key === "ArrowDown" ? 1 : -1) + answers.length) % answers.length]
      event.preventDefault()
      next?.focus()
      return
    }
    const radio = target instanceof HTMLInputElement && target.type === "radio"
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !isTextField(target) && !radio) {
      event.preventDefault()
      if (event.repeat) return
      if (event.key === "ArrowLeft") goPrevious()
      else if (statuses[active.name] !== "unanswered") goNext()
      return
    }
    if (!shortcuts || isTextField(target)) return
    const answer = active.answerByShortcut(shortcuts === "letters" ? event.key.toUpperCase() : event.key)
    if (answer) {
      event.preventDefault()
      answer.focus()
      answer.click()
    }
  }

  const context: RootContextValue = {
    activeName,
    activeRequired: active?.required ?? false,
    activeStatus: activeName ? (statuses[activeName] ?? "unanswered") : null,
    current: index + 1,
    total,
    first: index === 0,
    last: total > 0 && index === total - 1,
    shortcuts,
    definitions,
    registerItem,
    reportStatus,
    goNext,
    goPrevious,
    skipCurrent,
  }

  return (
    <RootContext.Provider value={context}>
      <form
        ref={formRef}
        data-slot="questionnaire"
        data-shortcuts={shortcuts}
        noValidate
        onSubmit={handleSubmit}
        onReset={handleReset}
        onKeyDown={handleKeyDown}
        className={cn("flex w-full min-w-0 flex-col gap-6", className)}
        {...props}
      >
        {children}
      </form>
    </RootContext.Provider>
  )
}

type QuestionnaireProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Text beside the bar. Receives the 1-based current step and the total. */
  label?: (current: number, total: number) => React.ReactNode
}

/** Step counter with a thin bar that fills as the questionnaire advances. */
function QuestionnaireProgress({
  className,
  label = (current, total) => `Soru ${current} / ${total}`,
  ...props
}: QuestionnaireProgressProps) {
  const { current, total } = useRoot("QuestionnaireProgress")
  return (
    <div
      data-slot="questionnaire-progress"
      role="progressbar"
      aria-label="Anket ilerlemesi"
      aria-live="polite"
      aria-valuemin={total ? 1 : undefined}
      aria-valuemax={total || undefined}
      aria-valuenow={total ? current : undefined}
      aria-valuetext={total ? `Soru ${current} / ${total}` : undefined}
      className={cn("flex items-center gap-3 text-xs font-medium text-muted-foreground tabular-nums", className)}
      {...props}
    >
      <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-(--ease-out) motion-reduce:transition-none"
          style={{ width: total ? `${(current / total) * 100}%` : "0%" }}
        />
      </span>
      <span className="shrink-0">{total ? label(current, total) : null}</span>
    </div>
  )
}

type ItemContextValue = {
  name: string
  multiple: boolean
  disabled: boolean
  invalid: boolean
  skipped: boolean
  selected: string[]
  select: (key: string, on: boolean) => void
  addDefault: (key: string) => void
  registerChoice: (value: string, element: HTMLElement) => () => void
  shortcutFor: (value: string) => string | null
  registerDescription: (id: string) => () => void
  errorId: string
}

const ItemContext = React.createContext<ItemContextValue | null>(null)

function useItem(part: string) {
  const context = React.useContext(ItemContext)
  if (!context) throw new Error(`${part} must be used inside <QuestionnaireItem>.`)
  return context
}

type QuestionnaireItemProps = Omit<React.ComponentProps<"fieldset">, "name"> & {
  /** Field name of the answers in FormData. Unique per questionnaire. */
  name: string
  /** Blocks Next until answered and hides Skip. */
  required?: boolean
  /** Checkboxes instead of radios. */
  multiple?: boolean
  /** Forces the error state, e.g. from your own schema validation. */
  invalid?: boolean
  /** Called when the item becomes unanswered, answered or skipped. */
  onStatusChange?: (status: QuestionnaireStatus) => void
}

/** One question. Renders a fieldset; only the active one is visible. */
function QuestionnaireItem({
  className,
  name,
  required = false,
  multiple = false,
  disabled = false,
  invalid: invalidProp = false,
  onStatusChange,
  children,
  "aria-describedby": ariaDescribedBy,
  ...props
}: QuestionnaireItemProps) {
  const root = useRoot("QuestionnaireItem")
  const ref = React.useRef<HTMLFieldSetElement>(null)
  const defaults = React.useRef<string[]>([])
  const [selected, setSelected] = React.useState<string[]>([])
  const [skipped, setSkipped] = React.useState(false)
  const [attempted, setAttempted] = React.useState(false)
  const [choices, setChoices] = React.useState<{ value: string; element: HTMLElement }[]>([])
  const [descriptions, setDescriptions] = React.useState<string[]>([])
  const errorId = React.useId()

  const answered = selected.length > 0
  const status: QuestionnaireStatus = skipped ? "skipped" : answered ? "answered" : "unanswered"
  const invalid = !disabled && (invalidProp || (attempted && !answered && !skipped))
  const active = root.activeName === name && !disabled

  const select = React.useCallback(
    (key: string, on: boolean) => {
      setSkipped(false)
      setSelected((current) => {
        if (!on) return current.filter((k) => k !== key)
        if (!multiple) return [key]
        return current.includes(key) ? current : [...current, key]
      })
    },
    [multiple]
  )

  const addDefault = React.useCallback(
    (key: string) => {
      if (defaults.current.includes(key)) return
      defaults.current = multiple ? [...defaults.current, key] : [key]
      setSelected((current) => (multiple ? (current.includes(key) ? current : [...current, key]) : current.length ? current : [key]))
    },
    [multiple]
  )

  const registerChoice = React.useCallback((value: string, element: HTMLElement) => {
    const entry = { value, element }
    setChoices((list) =>
      [...list.filter((c) => c.value !== value), entry].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      )
    )
    return () => setChoices((list) => list.filter((c) => c !== entry))
  }, [])

  const registerDescription = React.useCallback((id: string) => {
    setDescriptions((ids) => [...ids, id])
    return () => setDescriptions((ids) => ids.filter((i) => i !== id))
  }, [])

  const shortcuts = React.useMemo(() => {
    const keys = shortcutKeys(root.shortcuts)
    const definition = root.definitions?.get(name)
    const values = definition?.choices
      ? definition.choices.filter((c) => !c.disabled).map((c) => c.value)
      : choices.filter((c) => !c.element.hasAttribute("data-disabled")).map((c) => c.value)
    return new Map(values.slice(0, keys.length).map((value, i) => [value, keys[i]]))
  }, [root.shortcuts, root.definitions, name, choices])

  const { registerItem, reportStatus } = root
  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const inputs = () => [...element.querySelectorAll<HTMLInputElement>("input:not(:disabled), textarea:not(:disabled)")]
    return registerItem({
      name,
      element,
      disabled,
      required,
      validate: () => {
        setAttempted(true)
        return !invalidProp && (answered || skipped)
      },
      focus: () => element.focus(),
      focusInvalid: () => (inputs().find((i) => i.checked) ?? inputs()[0] ?? element).focus(),
      skip: () => {
        setSelected([])
        setSkipped(true)
        setAttempted(false)
      },
      reset: () => {
        setSelected(defaults.current)
        setSkipped(false)
        setAttempted(false)
      },
      answerByShortcut: (key) => {
        const value = [...shortcuts.entries()].find(([, k]) => k === key)?.[0]
        const choice = choices.find((c) => c.value === value)
        return choice?.element.querySelector<HTMLInputElement>("input:not(:disabled)") ?? null
      },
    })
  }, [registerItem, name, disabled, required, shortcuts, choices, answered, skipped, invalidProp])

  const lastStatus = React.useRef(status)
  React.useEffect(() => {
    reportStatus(name, status)
    if (lastStatus.current === status) return
    lastStatus.current = status
    onStatusChange?.(status)
  }, [reportStatus, name, status, onStatusChange])

  const describedBy = [...descriptions, invalid ? errorId : null, ariaDescribedBy].filter(Boolean).join(" ") || undefined

  const context: ItemContextValue = {
    name,
    multiple,
    disabled,
    invalid,
    skipped,
    selected,
    select,
    addDefault,
    registerChoice,
    shortcutFor: (value) => shortcuts.get(value) ?? null,
    registerDescription,
    errorId,
  }

  return (
    <ItemContext.Provider value={context}>
      <fieldset
        ref={ref}
        data-slot="questionnaire-item"
        data-active={active ? "" : undefined}
        data-status={status}
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        hidden={!active}
        inert={!active}
        tabIndex={-1}
        className={cn(
          "flex min-w-0 flex-col gap-4 border-0 p-0 outline-none data-active:animate-in data-active:fade-in-0 data-active:slide-in-from-right-2 data-active:duration-300 motion-reduce:data-active:animate-none",
          className
        )}
        {...props}
      >
        {children}
      </fieldset>
    </ItemContext.Provider>
  )
}

type QuestionnaireTitleProps = React.ComponentProps<"legend"> & {
  /** Render the child element instead of a legend, Radix style. */
  asChild?: boolean
}

function QuestionnaireTitle({ className, asChild = false, ...props }: QuestionnaireTitleProps) {
  useItem("QuestionnaireTitle")
  const Comp = asChild ? Slot.Root : "legend"
  return (
    <Comp
      data-slot="questionnaire-title"
      className={cn(
        "font-heading mb-4 text-base font-semibold tracking-[-0.01em] text-pretty [&:has(~[data-slot=questionnaire-description])]:mb-1",
        className
      )}
      {...props}
    />
  )
}

function QuestionnaireDescription({ className, id: idProp, ...props }: React.ComponentProps<"p">) {
  const { registerDescription } = useItem("QuestionnaireDescription")
  const fallback = React.useId()
  const id = idProp ?? fallback
  React.useLayoutEffect(() => registerDescription(id), [registerDescription, id])
  return (
    <p id={id} data-slot="questionnaire-description" className={cn("text-sm text-pretty text-muted-foreground", className)} {...props} />
  )
}

function QuestionnaireChoices({ className, ...props }: React.ComponentProps<"div">) {
  const { shortcuts } = useRoot("QuestionnaireChoices")
  return (
    <div
      data-slot="questionnaire-choices"
      data-shortcuts={shortcuts}
      className={cn("group/questionnaire-choices grid min-w-0 gap-2", className)}
      {...props}
    />
  )
}

type QuestionnaireChoiceProps = Omit<React.ComponentProps<"label">, "onChange"> & {
  /** Submitted value of this answer. */
  value: string
  /** Selected when the questionnaire starts or resets. */
  defaultChecked?: boolean
  disabled?: boolean
  /** Change event of the native radio or checkbox. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

/** One fixed answer: a raised card with a native radio or checkbox inside. */
function QuestionnaireChoice({
  children,
  className,
  value,
  defaultChecked = false,
  disabled: disabledProp = false,
  onChange,
  ...props
}: QuestionnaireChoiceProps) {
  const item = useItem("QuestionnaireChoice")
  const ref = React.useRef<HTMLLabelElement>(null)
  const checked = item.selected.includes(value)
  const disabled = item.disabled || disabledProp
  const type = item.multiple ? "checkbox" : "radio"
  const shortcut = item.shortcutFor(value)

  const { registerChoice, addDefault } = item
  React.useLayoutEffect(() => (ref.current ? registerChoice(value, ref.current) : undefined), [registerChoice, value])
  React.useLayoutEffect(() => {
    if (defaultChecked) addDefault(value)
  }, [addDefault, defaultChecked, value])

  return (
    <label
      ref={ref}
      data-slot="questionnaire-choice"
      data-type={type}
      data-checked={checked ? "" : undefined}
      data-unchecked={checked ? undefined : ""}
      data-invalid={item.invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-shortcut={shortcut ?? undefined}
      className={cn(
        "group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-3 rounded-lg bg-card px-3.5 py-3 text-start text-sm shadow-raised transition-[box-shadow,background-color] outline-none select-none hover:shadow-raised-hover has-[>input:focus-visible]:ring-3 has-[>input:focus-visible]:ring-ring/30",
        "data-checked:bg-primary-subtle data-checked:shadow-[inset_0_0_0_1.5px_var(--primary)] data-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <input
        data-slot="questionnaire-choice-input"
        type={type}
        name={item.skipped ? undefined : item.name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-invalid={item.invalid || undefined}
        aria-keyshortcuts={shortcut ?? undefined}
        onChange={(event) => {
          onChange?.(event)
          if (!event.defaultPrevented) item.select(value, event.target.checked)
        }}
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        className="pointer-events-none relative mt-px flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-card shadow-inset transition-colors group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary"
      >
        <span className="hidden size-1.5 rounded-full bg-primary-foreground group-data-[type=radio]/questionnaire-choice:group-data-checked/questionnaire-choice:block" />
        <CheckIcon className="hidden size-3 group-data-[type=checkbox]/questionnaire-choice:group-data-checked/questionnaire-choice:block" strokeWidth={3} />
      </span>
      <span data-slot="questionnaire-choice-label" className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug font-medium">
        {children}
      </span>
      {shortcut && (
        <span
          aria-hidden
          data-slot="questionnaire-choice-shortcut"
          className="pointer-events-none ms-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-muted px-1 font-mono text-[10px] leading-none font-medium text-muted-foreground"
        >
          {shortcut}
        </span>
      )}
    </label>
  )
}

function QuestionnaireChoiceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="questionnaire-choice-description" className={cn("font-normal text-muted-foreground", className)} {...props} />
  )
}

/** Free text answer, styled like Input. Give it a label or aria-label. */
function QuestionnaireInput({ className, onChange, defaultValue, ...props }: React.ComponentProps<"input">) {
  const item = useItem("QuestionnaireInput")
  const filled = item.selected.includes(INPUT_ANSWER)
  const { addDefault } = item
  React.useLayoutEffect(() => {
    if (String(defaultValue ?? "").trim()) addDefault(INPUT_ANSWER)
  }, [addDefault, defaultValue])

  return (
    <input
      data-slot="questionnaire-input"
      type="text"
      // Only an answer while it is the selection: typing replaces a single choice.
      name={filled && !item.skipped ? item.name : undefined}
      defaultValue={defaultValue}
      disabled={item.disabled || props.disabled}
      aria-invalid={item.invalid || undefined}
      data-filled={filled ? "" : undefined}
      data-empty={filled ? undefined : ""}
      onChange={(event) => {
        onChange?.(event)
        if (!event.defaultPrevented) item.select(INPUT_ANSWER, event.target.value.trim().length > 0)
      }}
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-base shadow-inset transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

/** Error of the active item, shown after Next is pressed without an answer. */
function QuestionnaireError({ className, children = "Devam etmek için bir yanıt seçin.", ...props }: React.ComponentProps<"p">) {
  const item = useItem("QuestionnaireError")
  return (
    <p
      id={item.errorId}
      data-slot="questionnaire-error"
      role={item.invalid ? "alert" : undefined}
      hidden={!item.invalid}
      className={cn("text-[13px] text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
}

/** Row for the navigation buttons: Back on the left, Skip and Next or Submit on the right. */
function QuestionnaireActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="questionnaire-actions"
      className={cn("grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-t pt-4", className)}
      {...props}
    />
  )
}

type QuestionnaireButtonProps = React.ComponentProps<"button"> & {
  size?: ButtonProps["size"]
  /** Button variant. Next and Submit are solid, Skip outline, Back ghost. */
  variant?: ButtonVariant
  color?: ButtonColor
  /** Render the child element instead of a button, Radix style. */
  asChild?: boolean
}

function NavButton({
  slot,
  visible,
  column,
  className,
  size = "default",
  variant,
  color,
  asChild = false,
  disabled,
  type = "button",
  tabIndex,
  ...props
}: QuestionnaireButtonProps & { slot: string; visible: boolean; column: string }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot={slot}
      data-visible={visible ? "" : undefined}
      data-hidden={visible ? undefined : ""}
      type={asChild ? undefined : type}
      hidden={!visible}
      inert={!visible}
      aria-hidden={!visible || undefined}
      tabIndex={visible ? tabIndex : -1}
      disabled={disabled}
      className={cn(buttonVariants({ size, variant, color }), column, className)}
      {...props}
    />
  )
}

function QuestionnairePrevious({ children = "Geri", variant = "ghost", onClick, ...props }: QuestionnaireButtonProps) {
  const root = useRoot("QuestionnairePrevious")
  return (
    <NavButton
      slot="questionnaire-previous"
      visible={root.total > 1 && !root.first}
      column="col-start-1 row-start-1 justify-self-start"
      variant={variant}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) root.goPrevious()
      }}
      {...props}
    >
      {children}
    </NavButton>
  )
}

function QuestionnaireSkip({ children = "Atla", variant = "outline", onClick, ...props }: QuestionnaireButtonProps) {
  const root = useRoot("QuestionnaireSkip")
  return (
    <NavButton
      slot="questionnaire-skip"
      visible={root.activeName !== null && !root.activeRequired}
      column="col-start-2 row-start-1 justify-self-end"
      variant={variant}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) root.skipCurrent()
      }}
      {...props}
    >
      {children}
    </NavButton>
  )
}

function QuestionnaireNext({ children = "İleri", variant = "solid", onClick, ...props }: QuestionnaireButtonProps) {
  const root = useRoot("QuestionnaireNext")
  return (
    <NavButton
      slot="questionnaire-next"
      visible={root.total > 1 && !root.last}
      column="col-start-3 row-start-1 justify-self-end"
      variant={variant}
      aria-keyshortcuts="Enter"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) root.goNext()
      }}
      {...props}
    >
      {children}
    </NavButton>
  )
}

function QuestionnaireSubmit({ children = "Gönder", variant = "solid", ...props }: QuestionnaireButtonProps) {
  const root = useRoot("QuestionnaireSubmit")
  return (
    <NavButton
      slot="questionnaire-submit"
      visible={root.last}
      column="col-start-3 row-start-1 justify-self-end"
      variant={variant}
      type="submit"
      aria-keyshortcuts="Enter"
      {...props}
    >
      {children}
    </NavButton>
  )
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
  type QuestionnaireButtonProps,
  type QuestionnaireChoiceProps,
  type QuestionnaireItemDefinition,
  type QuestionnaireItemProps,
  type QuestionnaireProgressProps,
  type QuestionnaireProps,
  type QuestionnaireStatus,
  type QuestionnaireTitleProps,
}
