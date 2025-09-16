import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Fishing Expense Manager",
  description: "Gerencie suas pescarias e divida gastos facilmente",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["fishing", "expense", "split", "pescaria", "gastos"],
  authors: [{ name: "Fishing App Team" }],
  icons: {
    icon: "/icon-192x192.jpg",
    apple: "/icon-192x192.jpg",
  },
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="apple-touch-icon" href="/icon-192x192.jpg" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
