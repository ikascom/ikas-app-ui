"use client"

import * as React from "react"
import { BookOpenIcon, InboxIcon, LifeBuoyIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ikas/empty-state"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { SetupGuide } from "@/components/ikas/setup-guide"
import { StatCard } from "@/components/ikas/stat-card"
import { store } from "@/demos/_data"

/**
 * App home right after install: a setup guide on top, zeroed metrics and a
 * first-run empty state until the merchant creates their first record.
 */
export default function AppHomeExample() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ permissions: true })
  const [guideOpen, setGuideOpen] = React.useState(true)
  const complete = (id: string) => setDone((d) => ({ ...d, [id]: true }))

  const steps = [
    {
      id: "permissions",
      title: "İzinleri onaylayın",
      description: "Uygulama ürün ve sipariş verilerinizi okuyabilsin.",
      done: Boolean(done.permissions),
      action: <Button size="sm" onClick={() => complete("permissions")}>İzinleri onayla</Button>,
    },
    {
      id: "settings",
      title: "Temel ayarları yapın",
      description: "Bildirim e-postası ve para birimi gibi varsayılanları seçin.",
      done: Boolean(done.settings),
      action: <Button size="sm" onClick={() => complete("settings")}>Ayarlara git</Button>,
    },
    {
      id: "first",
      title: "İlk kaydınızı oluşturun",
      description: "Bir kayıt oluşturduğunuzda metrikler burada görünmeye başlar.",
      done: Boolean(done.first),
      action: (
        <Button size="sm" onClick={() => (complete("first"), toast.success("Kayıt oluşturuldu"))}>
          Kayıt oluştur
        </Button>
      ),
    },
  ]
  const allDone = steps.every((s) => s.done)

  return (
    <Page width="wide">
      <PageHeader
        title="Hoş geldiniz"
        description={`${store.name} için kurulum birkaç dakika sürer.`}
        actions={
          <Button onClick={() => (complete("first"), toast.success("Kayıt oluşturuldu"))}>
            <PlusIcon data-icon="inline-start" />
            Yeni kayıt
          </Button>
        }
      />

      {guideOpen && <SetupGuide description="Uygulamayı kullanmaya başlamak için üç adım." steps={steps} onDismiss={allDone ? () => setGuideOpen(false) : undefined} />}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Kayıtlar" value={done.first ? "1" : "0"} changeLabel="son 30 gün" />
        <StatCard label="Etkileşim" value="0" changeLabel="son 30 gün" />
        <StatCard label="Gelir katkısı" value="₺0" changeLabel="son 30 gün" />
      </div>

      <Layout columns="main-aside">
        <LayoutColumn>
          <Card>
            <CardContent>
              <EmptyState
                size="page"
                media={<InboxIcon />}
                title={done.first ? "İlk kaydınız hazır" : "Henüz kayıt yok"}
                description={
                  done.first
                    ? "Veriler toplandıkça metrikler ve grafikler burada görünür."
                    : "İlk kaydınızı oluşturun; mağazanızdaki etkisini buradan izleyin."
                }
                actions={
                  !done.first && (
                    <>
                      <Button onClick={() => (complete("first"), toast.success("Kayıt oluşturuldu"))}>Kayıt oluştur</Button>
                      <Button variant="ghost">Örnek verilerle dene</Button>
                    </>
                  )
                }
              />
            </CardContent>
          </Card>
        </LayoutColumn>

        <LayoutColumn>
          <Card>
            <CardHeader>
              <CardTitle>Yardım</CardTitle>
              <CardDescription>Takıldığınız bir yer mi var?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start">
                <BookOpenIcon data-icon="inline-start" />
                Kullanım kılavuzu
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => toast(`${store.supportEmail} adresine yazabilirsiniz`)}>
                <LifeBuoyIcon data-icon="inline-start" />
                Destek ekibine yazın
              </Button>
            </CardContent>
          </Card>
        </LayoutColumn>
      </Layout>
    </Page>
  )
}
