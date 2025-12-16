'use client'

import './globals.css'
import { Montserrat, Lato, Playfair_Display } from 'next/font/google'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { Metadata } from 'next'
import { BookingCartProvider } from '@/app/lib/BookingCart'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['100', '200', '300', '400', '500', '600', '700'],
})

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: ['300', '400', '700'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

const metadata: Metadata = {
  title: 'i do hair studios - Professional Hair Styling & Wig Making Services',
  description: 'Expert hair styling, wig making, braids, locs, and bridal hair services. Book your appointment with i do hair studios for precision-engineered beauty and confidence. Professional hairstyling in Ghana.',
  keywords: 'i do hair studios, hair stylist, wig making, braids, locs, hair extensions, bridal hair, hair styling Ghana, professional hairstyling, custom wigs, hair installations',
  authors: [{ name: 'i do hair studios' }],
  creator: 'i do hair studios',
  publisher: 'i do hair studios',
  robots: 'index, follow',
  openGraph: {
    title: 'i do hair studios - Professional Hair Styling & Wig Making',
    description: 'Expert hair styling, wig making, braids, locs, and bridal hair services. Book your appointment for precision-engineered beauty and confidence.',
    type: 'website',
    locale: 'en_US',
    siteName: 'i do hair studios',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'i do hair studios - Professional Hair Styling & Wig Making',
    description: 'Expert hair styling, wig making, braids, locs, and bridal hair services. Book your appointment for precision-engineered beauty and confidence.',
  },
  viewport: 'width=device-width, initial-scale=1.0, user-scalable=yes',
  themeColor: '#ec4899',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // Disabled the long press admin access feature as it was triggering randomly
  // and interfering with normal user interactions (scrolling, reading, etc.)
  // Admin can access via /admin/login directly

  return (
    <html lang="en" className={`${montserrat.variable} ${lato.variable} ${playfair.variable}`}>
      <head>
        <link rel="canonical" href="https://hairengineer.vercel.app/" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Herr+Von+Muellerhoff&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        <meta name="geo.region" content="GH" />
        <meta name="geo.placename" content="Ghana" />
        <meta name="geo.position" content="5.6037;-0.1870" />
        <meta name="ICBM" content="5.6037, -0.1870" />
      </head>
      <body
        className="font-lato bg-black/95 text-white flex items-center justify-center min-h-screen overflow-x-hidden"
      >
        <BookingCartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              },
            }}
          />
          <div className="w-full max-w-screen-lg mx-auto h-screen overflow-y-auto relative flex flex-col items-center justify-center">
            {children}
          </div>

          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/233548947612?text=Hi%20there!%20I%20want%20to%20book%20an%20appointment%20with%20i%20do%20hair%20studios%20🌸"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-white text-black hover:bg-white/90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-slow border border-white/30"
            aria-label="Contact us on WhatsApp"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
          </a>
        </BookingCartProvider>
      </body>
    </html>
  )
}

