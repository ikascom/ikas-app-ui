"use client"

import * as React from "react"
import { ClockIcon, MessageCircleIcon, SmartphoneIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleSection } from "@/components/ikas/toggle-section"

export default function ToggleSectionModules() {
  const [hours, setHours] = React.useState(true)
  const [greeting, setGreeting] = React.useState(false)
  const [mobile, setMobile] = React.useState(false)

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ToggleSection
        icon={<ClockIcon />}
        title="Mesai saatleri"
        description="Mesai dışında buton gizlenir, yerine e-posta formu çıkar."
        meta={hours ? <Badge status="success" size="sm" dot>Etkin</Badge> : undefined}
        checked={hours}
        onCheckedChange={setHours}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="start">Başlangıç</FieldLabel>
            <Input id="start" type="time" defaultValue="09:00" />
          </Field>
          <Field>
            <FieldLabel htmlFor="end">Bitiş</FieldLabel>
            <Input id="end" type="time" defaultValue="18:00" />
          </Field>
        </div>
      </ToggleSection>
      <ToggleSection
        icon={<MessageCircleIcon />}
        title="Karşılama mesajı"
        description="Ziyaretçi sohbeti açtığında ilk mesaj olarak gösterilir."
        checked={greeting}
        onCheckedChange={setGreeting}
      >
        <Textarea aria-label="Karşılama mesajı" rows={2} defaultValue="Merhaba! Siparişinizle ilgili nasıl yardımcı olabiliriz?" />
      </ToggleSection>
      <ToggleSection icon={<SmartphoneIcon />} title="Mobilde gizle" description="Ayarı olmayan, yalnızca açılıp kapanan bir özellik." checked={mobile} onCheckedChange={setMobile} />
    </div>
  )
}
