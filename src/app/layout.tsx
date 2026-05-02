import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'PurpleBook — SAT Mock Tests',
  description: 'Practice with real SAT exam questions from 2023, 2024, and 2025.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Animated background orbs */}
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
