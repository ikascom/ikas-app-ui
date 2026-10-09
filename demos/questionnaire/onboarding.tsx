"use client"

import * as React from "react"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

type Item = {
  name: string
  prompt: string
  description?: string
  required?: boolean
  multiple?: boolean
  choices: { value: string; label: string; description?: string }[]
  input?: { label: string; placeholder: string }
}

const items: Item[] = [
  {
    name: "size",
    required: true,
    prompt: "Mağazanızda kaç ürün var?",
    choices: [
      { value: "small", label: "100'den az" },
      { value: "medium", label: "100 – 1.000" },
      { value: "large", label: "1.000'den fazla", description: "Toplu içe aktarma önerilir." },
    ],
  },
  {
    name: "channels",
    required: true,
    multiple: true,
    prompt: "Hangi kanallarda satış yapıyorsunuz?",
    description: "Birden fazla seçebilirsiniz.",
    choices: [
      { value: "web", label: "Online mağaza" },
      { value: "marketplace", label: "Pazaryeri" },
      { value: "social", label: "Sosyal medya" },
      { value: "store", label: "Fiziksel mağaza" },
    ],
  },
  {
    name: "source",
    prompt: "Uygulamayı nereden duydunuz?",
    description: "İsteğe bağlı.",
    choices: [
      { value: "store", label: "Uygulama mağazası" },
      { value: "friend", label: "Tavsiye" },
    ],
    input: { label: "Diğer", placeholder: "Başka bir kaynak" },
  },
]

/** First-run setup survey: required single and multiple choice, then an optional item. */
export default function QuestionnaireOnboarding() {
  const [done, setDone] = React.useState(false)

  if (done) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2Icon className="size-8 text-success" />
        <p className="font-medium">Kurulum tercihleri kaydedildi</p>
        <Button variant="outline" size="sm" onClick={() => setDone(false)}>
          Yeniden başlat
        </Button>
      </div>
    )
  }

  return (
    <Questionnaire
      className="max-w-md"
      items={items.map(({ name, required, choices }) => ({ name, required, choices }))}
      onSubmit={(event) => {
        event.preventDefault()
        setDone(true)
      }}
    >
      <QuestionnaireProgress />
      {items.map((item) => (
        <QuestionnaireItem
          key={item.name}
          name={item.name}
          required={item.required}
          multiple={item.multiple}
        >
          <QuestionnaireTitle>{item.prompt}</QuestionnaireTitle>
          {item.description && <QuestionnaireDescription>{item.description}</QuestionnaireDescription>}
          <QuestionnaireChoices>
            {item.choices.map((choice) => (
              <QuestionnaireChoice key={choice.value} value={choice.value}>
                {choice.label}
                {choice.description && <QuestionnaireChoiceDescription>{choice.description}</QuestionnaireChoiceDescription>}
              </QuestionnaireChoice>
            ))}
            {item.input && <QuestionnaireInput aria-label={item.input.label} placeholder={item.input.placeholder} />}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}
