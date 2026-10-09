import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const questions = [
  {
    value: "sync",
    question: "Ürünler ne sıklıkla eşitlenir?",
    answer: "Stok ve fiyat değişiklikleri birkaç dakika içinde, yeni ürünler her saat başı eşitlenir.",
  },
  {
    value: "billing",
    question: "Deneme süresi bitince ne olur?",
    answer: "Plan seçmezseniz uygulama salt okunur moda geçer. Verileriniz 30 gün saklanır.",
  },
  {
    value: "uninstall",
    question: "Uygulamayı kaldırırsam verilerim silinir mi?",
    answer: "Mağazanızdaki ürünler ve siparişler etkilenmez. Yalnızca uygulamanın kendi ayarları silinir.",
  },
]

export default function AccordionFaq() {
  return (
    <Accordion type="single" collapsible defaultValue="sync" className="max-w-lg">
      {questions.map((q) => (
        <AccordionItem key={q.value} value={q.value}>
          <AccordionTrigger>{q.question}</AccordionTrigger>
          <AccordionContent>{q.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
