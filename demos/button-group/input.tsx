import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ButtonGroupInput() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ButtonGroup className="w-full">
        <Input placeholder="Sipariş no veya müşteri" aria-label="Sipariş ara" />
        <Button variant="outline" size="icon" aria-label="Ara">
          <SearchIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup className="w-full">
        <Select defaultValue="percent">
          <SelectTrigger aria-label="İndirim tipi">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percent">Yüzde</SelectItem>
            <SelectItem value="amount">Tutar</SelectItem>
          </SelectContent>
        </Select>
        <Input defaultValue="15" inputMode="decimal" aria-label="İndirim değeri" />
        <ButtonGroupText>%</ButtonGroupText>
      </ButtonGroup>
    </div>
  )
}
