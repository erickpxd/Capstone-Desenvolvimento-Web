import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useState } from 'react'
import { ThemeProvider } from './theme'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
    },
  }))

  return <ThemeProvider><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></ThemeProvider>
}
