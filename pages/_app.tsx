import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../contexts/AuthContext'
import { TemplatesProvider } from '../contexts/TemplatesContext'
import { ToastProvider } from '../components/ToastContainer'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <TemplatesProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </TemplatesProvider>
    </AuthProvider>
  )
}

export default MyApp
