import React from "react"
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

// 1. Importamos o AuthProvider da sua pasta lib
import { AuthProvider } from "@/lib/auth-context"

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Odonto Studio AI | Roteiros Inteligentes para Dentistas',
  description: 'Crie roteiros profissionais para videos odontologicos com inteligencia artificial. Powered by BYB Midia Digital.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased`}>
        {/* 2. Colocamos o Provedor aqui para o useAuth funcionar em todas as páginas */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}