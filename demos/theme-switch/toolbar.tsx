"use client"

import * as React from "react"
import { BellIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeSwitch, type Theme } from "@/components/ikas/theme-switch"

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

export default function ThemeSwitchToolbar() {
  const [theme, setTheme] = usePageTheme()

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <p className="text-sm font-semibold">Kampanyalar</p>
        <div className="flex items-center gap-1">
          <ThemeSwitch theme={theme} onThemeChange={setTheme} transition="rise" iconOnly variant="ghost" />
          <Button variant="ghost" size="icon-sm" aria-label="Bildirimler">
            <BellIcon data-anim="ring" />
          </Button>
          <Avatar size="sm" className="ml-1">
            <AvatarFallback>AY</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="grid gap-2 p-4">
        <div className="h-3 w-2/3 rounded-full bg-muted" />
        <div className="h-3 w-1/2 rounded-full bg-muted" />
        <div className="h-3 w-3/5 rounded-full bg-muted" />
      </div>
    </div>
  )
}
