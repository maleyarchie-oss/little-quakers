import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Philadelphia Little Quakers | All-Star Youth Football',
  description: 'Philadelphia\'s premier all-star youth football program. Est. 1953. Register for tryouts, view the roster, schedule, and more at littlequakers.us.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F5F4F0]">{children}</body>
    </html>
  )
}
