import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '../contexts/AuthContext'
import { TemplatesProvider } from '../contexts/TemplatesContext'
import { ToastProvider } from '../components/ToastContainer'

function MyApp({ Component, pageProps }: AppProps) {
  const { metaTags } = pageProps as any;
  
  return (
    <>
      {metaTags && (
        <Head>
          <title>{metaTags.title}</title>
          {metaTags.description && (
            <meta name="description" content={metaTags.description} key="description" />
          )}
          {metaTags.keywords && (
            <meta name="keywords" content={metaTags.keywords} key="keywords" />
          )}
          {metaTags.ogTitle && (
            <meta property="og:title" content={metaTags.ogTitle} key="og-title" />
          )}
          {metaTags.ogDescription && (
            <meta property="og:description" content={metaTags.ogDescription} key="og-description" />
          )}
          {metaTags.ogType && (
            <meta property="og:type" content={metaTags.ogType} key="og-type" />
          )}
        </Head>
      )}
      <AuthProvider>
        <TemplatesProvider>
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </TemplatesProvider>
      </AuthProvider>
    </>
  )
}

export default MyApp
