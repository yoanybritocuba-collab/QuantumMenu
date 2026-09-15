import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { WhatsAppButton } from '@/components/whatsapp-button'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuantumMenu — Diseño web, menús QR y catálogos digitales',
  description:
    'Estudio web independiente en Barcelona. Páginas web profesionales, menús digitales QR, catálogos interactivos y soluciones digitales para negocios.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'manifest',
      url: '/site.webmanifest',
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        {/* 🔽 Botón flotante de WhatsApp — cambia el teléfono por el tuyo real */}
        <WhatsAppButton phone="34600000000" position="left" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}