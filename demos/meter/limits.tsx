import { Meter } from "@/components/ikas/meter"

export default function MeterLimits() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Meter label="Aylık sipariş" value={1240} max={5000} />
      <Meter label="Ürün" value={4180} max={5000} />
      <Meter label="API kullanımı" value={9820} max={10000} />
    </div>
  )
}
