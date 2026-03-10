import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import SocketProvider from '@/components/provider/socket-provider'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RedioCast',
  description: 'RedioCast',
  generator: 'RedioCast',
  icons: {
    icon: [
      {
        url: '/r-icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/r-icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/r-icon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/r-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SocketProvider>
          <Toaster />
          {children}
          <Analytics />
        </SocketProvider>
      </body>
    </html>
  )
}
