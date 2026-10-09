"use client"

import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

const items = [
  {
    name: "ease",
    prompt: "Kurulum ne kadar kolaydı?",
    choices: ["Çok kolay", "Kolay", "Zor"],
  },
  {
    name: "missing",
    prompt: "En çok hangi özelliği istersiniz?",
    choices: ["Toplu düzenleme", "Otomatik raporlar", "Daha fazla entegrasyon"],
  },
]

/** Short feedback survey in a card. Letter keys pick an answer, Enter moves on. */
export default function QuestionnaireCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Görüşünüz bizim için önemli</CardTitle>
        <CardDescription>İki soru, 30 saniye.</CardDescription>
      </CardHeader>
      <CardContent>
        <Questionnaire
          shortcuts="letters"
          items={items.map((item) => ({ name: item.name, required: true, choices: item.choices.map((value) => ({ value })) }))}
          onSubmit={(event) => {
            event.preventDefault()
            toast.success("Teşekkürler, yanıtınız kaydedildi")
            event.currentTarget.reset()
          }}
        >
          <QuestionnaireProgress label={(current, total) => `${current}/${total}`} />
          {items.map((item) => (
            <QuestionnaireItem key={item.name} name={item.name} required>
              <QuestionnaireTitle>{item.prompt}</QuestionnaireTitle>
              <QuestionnaireChoices>
                {item.choices.map((choice) => (
                  <QuestionnaireChoice key={choice} value={choice}>
                    {choice}
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
          ))}
          <QuestionnaireActions>
            <QuestionnairePrevious />
            <QuestionnaireNext />
            <QuestionnaireSubmit />
          </QuestionnaireActions>
        </Questionnaire>
      </CardContent>
    </Card>
  )
}
