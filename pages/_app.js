// pages/_app.js

import '../styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import Head from 'next/head'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', 'G-PG1S76T9QW', { page_path: url })
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        {/* 🚨 ここが最重要：スマホに「スマホ幅で表示せよ」と命令する */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Layout>
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-PG1S76T9QW" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PG1S76T9QW', { page_path: window.location.pathname });
          `}
        </Script>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

export default MyApp