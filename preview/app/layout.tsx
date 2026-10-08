import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ikas App UI preview",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} ${geistMono.variable} light`}>
      <body className="min-h-full">
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  )
}
