import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'X Post Card Builder',
  description: 'Transform X posts into beautiful, customizable visual cards',
}

export const viewport: Viewport = {
  themeColor: '#FAFAFA',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params?: Promise<Record<string, string | string[]>>
}) {
  // Next.js 15: params is a Promise; await to satisfy async contract and avoid raw Promise in dev tools
  if (params) await params
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
