"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ConfirmButton } from "@/components/ikas/confirm-button"

const initial = ["Hafta sonu fırsatı", "Kargo bedava çantası", "Yeni sezon tişört"]

export default function ConfirmButtonRow() {
  const [rows, setRows] = React.useState(initial)

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-card">
      <ul className="divide-y">
        <AnimatePresence initial={false}>
          {rows.map((name) => (
            <motion.li
              key={name}
              exit={{ opacity: 0, height: 0, transition: { opacity: { duration: 0.12 }, height: { duration: 0.2, delay: 0.04 } } }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                {name}
                <ConfirmButton
                  size="xs"
                  variant="ghost"
                  confirmLabel="Silinsin mi?"
                  onConfirm={() => {
                    setRows((r) => r.filter((n) => n !== name))
                    toast(`${name} silindi`)
                  }}
                >
                  <Trash2Icon data-anim="wiggle" />
                  Sil
                </ConfirmButton>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {rows.length === 0 && (
        <button type="button" onClick={() => setRows(initial)} className="w-full px-4 py-6 text-center text-sm text-muted-foreground hover:text-foreground">
          Hepsi silindi. Geri yükle
        </button>
      )}
    </div>
  )
}
