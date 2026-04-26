import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Philadelphia Little Quakers',
  description: 'Official platform for the Philadelphia Little Quakers All-Star Football Team – Est. 1953',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F5F4F0]">{children}</body>
    </html>
  )
}
