'use client'

import * as React from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Light theme is the default for Qtuor's clean white aesthetic.
  // We keep it simple and deterministic to avoid hydration mismatches.
  return <>{children}</>
}
