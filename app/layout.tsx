"use client" 

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "German Language Learning",
//   description: "Learn German noun genders and plurals with AI assistance",
//     generator: 'bundesmaster.com'
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  useEffect(() => {
    // Initialize cron jobs when the app starts
    fetch('/api/setup-crons');
  }, []);


  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'