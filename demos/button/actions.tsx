import { Button } from "@/components/ui/button"

export default function ButtonActions() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline">Vazgeç</Button>
        <Button>Ayarları kaydet</Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost">Uygulamayı tut</Button>
        <Button color="red">Kaldır</Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Daha sonra</Button>
        <Button color="blue">Pazaryerini bağla</Button>
      </div>
    </div>
  )
}
