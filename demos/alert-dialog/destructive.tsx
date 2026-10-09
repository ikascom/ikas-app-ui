"use client"

import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AlertDialogDestructive() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" color="red">
          <Trash2Icon data-icon="inline-start" />
          Kuralı sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia tone="danger">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>“Kargo bedava” kuralı silinsin mi?</AlertDialogTitle>
          <AlertDialogDescription>
            Kural hemen devre dışı kalır ve 14 aktif sepetteki indirim kaldırılır. Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel />
          <AlertDialogAction color="red" onClick={() => toast.success("Kural silindi")}>
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
