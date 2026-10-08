"use client"

import * as React from "react"
import { BookOpenIcon, InboxIcon, LifeBuoyIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ikas/empty-state"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { Launchpad, type LaunchpadStep } from "@/components/ikas/launchpad"
import { StatCard } from "@/components/ikas/stat-card"
import { store } from "@/demos/_data"

/**
 * App home right after install: a Launchpad on top, zeroed metrics and a
 * first-run empty state until the store owner creates their first record.
 */
export default function AppHomeExample() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ permissions: true })
  const [guideOpen, setGuideOpen] = React.useState(true)
  const complete = (id: string) => setDone((d) => ({ ...d, [id]: true }))

  const status = (id: string): LaunchpadStep["status"] => (done[id] ? "done" : undefined)

  const steps: LaunchpadStep[] = [
    {
      id: "permissions",
      label: "İzinleri onayla",
      description: "Uygulama ürün ve sipariş verilerinizi okuyabilsin.",
      eta: "~1 dk",
      status: status("permissions"),
      actions: <Button size="sm" onClick={() => complete("permissions")}>İzinleri onayla</Button>,
    },
    {
      id: "settings",
      label: "Temel ayarları yap",
      description: "Bildirim e-postası ve para birimi gibi varsayılanları seçin.",
      eta: "~3 dk",
      status: status("settings"),
      actions: (
        <>
          <Button size="sm" onClick={() => complete("settings")}>Ayarları aç</Button>
          <Button size="sm" variant="ghost" onClick={() => complete("settings")}>
            Varsayılanları kullan
          </Button>
        </>
      ),
    },
    {
      id: "first",
      label: "İlk kaydı oluştur",
      description: "Bir kayıt oluşturduğunuzda metrikler burada görünmeye başlar.",
      status: status("first"),
      requires: ["permissions"],
      actions: (
        <Button size="sm" onClick={() => (complete("first"), toast.success("Kayıt oluşturuldu"))}>
          Kayıt oluştur
        </Button>
      ),
    },
  ]

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

      {guideOpen && <Launchpad steps={steps} onDismiss={() => setGuideOpen(false)} />}

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
