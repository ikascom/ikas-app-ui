import { Button } from "@/components/ui/button"

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Değişiklikleri kaydet</Button>
      <Button variant="soft">Kopyala</Button>
      <Button variant="outline">Dışa aktar</Button>
      <Button variant="ghost">Vazgeç</Button>
      <Button variant="link">Daha fazla bilgi</Button>
    </div>
  )
}
