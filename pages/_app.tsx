import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../contexts/AuthContext'
import { TemplatesProvider } from '../contexts/TemplatesContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <TemplatesProvider>
        <Component {...pageProps} />
      </TemplatesProvider>
    </AuthProvider>
  )
}

export default MyApp
