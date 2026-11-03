'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { NavigationGuardProvider } from './NavigationGuardContext'

export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <NavigationGuardProvider>{children}</NavigationGuardProvider>
    </SessionProvider>
  )
}
