"use client"

import * as React from "react"

import { ThemeSwitch, type Theme, type ThemeTransition } from "@/components/ikas/theme-switch"

/** Follows the `dark` class on <html>, so every switch on the page stays in sync. */
function usePageTheme() {
  const [theme, setTheme] = React.useState<Theme>("light")
  React.useEffect(() => {
    const root = document.documentElement
    const sync = () => setTheme(root.classList.contains("dark") ? "dark" : "light")
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  function apply(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark")
    setTheme(next)
  }
  return [theme, apply] as const
}

const transitions: { value: ThemeTransition; label: string; hint: string }[] = [
  { value: "reveal", label: "Daire", hint: "Düğmeden büyür" },
  { value: "eclipse", label: "Tutulma", hint: "Yandan kayan bir disk" },
  { value: "split", label: "Ortadan", hint: "Dikey çizgiden iki yana" },
  { value: "rise", label: "Yükselme", hint: "Alttan kavisle yükselir" },
]

export default function ThemeSwitchTransitions() {
  const [theme, setTheme] = usePageTheme()

  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
      {transitions.map((t) => (
        <div key={t.value} className="flex items-center justify-between gap-3 rounded-xl bg-card p-3 shadow-card">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t.label}</p>
            <p className="truncate text-xs text-muted-foreground">{t.hint}</p>
          </div>
          <ThemeSwitch theme={theme} onThemeChange={setTheme} transition={t.value} iconOnly />
        </div>
      ))}
      <div className="flex justify-center sm:col-span-2">
        <ThemeSwitch theme={theme} onThemeChange={setTheme} />
      </div>
    </div>
  )
}
