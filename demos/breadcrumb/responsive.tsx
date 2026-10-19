"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const items = [
  { href: "#", label: "Ürünler" },
  { href: "#", label: "Kategoriler" },
  { href: "#", label: "Giyim" },
  { href: "#", label: "Kışlık aksesuarlar" },
  { label: "Yumuşak dokulu yün atkı" },
]

/** First and last two items stay; the rest collapse. */
const SHOWN = 3

function subscribe(onChange: () => void) {
  const query = window.matchMedia("(min-width: 768px)")
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function useDesktop() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true
  )
}

const triggerClass =
  "rounded-md outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 aria-expanded:bg-muted"

/** Collapsed steps open in a menu on desktop and in a drawer on phones; long labels truncate. */
export default function BreadcrumbResponsive() {
  const [open, setOpen] = React.useState(false)
  const desktop = useDesktop()
  const hidden = items.slice(1, -(SHOWN - 1))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={items[0].href}>{items[0].label}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.length > SHOWN && (
          <>
            <BreadcrumbItem>
              {desktop ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger aria-label="Diğer sayfalar" className={triggerClass}>
                    <BreadcrumbEllipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-auto">
                    {hidden.map((item) => (
                      <DropdownMenuItem key={item.label} asChild>
                        <a href={item.href}>{item.label}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger aria-label="Diğer sayfalar" className={triggerClass}>
                    <BreadcrumbEllipsis />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle>Sayfaya git</DrawerTitle>
                      <DrawerDescription>Bu ürüne giden yoldaki sayfalar.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-col gap-1 px-4">
                      {hidden.map((item) => (
                        <Button key={item.label} variant="ghost" size="lg" className="justify-start" asChild>
                          <a href={item.href}>{item.label}</a>
                        </Button>
                      ))}
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Kapat</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        {items.slice(-(SHOWN - 1)).map((item, index, shown) => (
          <React.Fragment key={item.label}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href} className="max-w-20 truncate md:max-w-none">
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < shown.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
