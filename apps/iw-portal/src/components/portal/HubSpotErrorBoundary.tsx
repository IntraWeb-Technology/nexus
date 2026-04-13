'use client'

import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }

type State = { hasError: boolean }

/**
 * Catches render errors in client descendants. Server Component async failures still rely on route error.tsx
 * or non-throwing server fetch helpers.
 */
export class HubSpotErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
