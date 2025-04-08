// import type React from "react"
// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import "../globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { i18n } from "@/i18n-config"
// import type { Locale } from "@/i18n-config"
// import LanguagePicker from "@/components/language-picker"
// import { getDictionary } from "@/lib/dictionary"
// import { DictionaryProvider } from "@/hooks/use-dictionary"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "German Language Learning",
//   description: "Learn German noun genders and plurals with AI assistance",
//   generator: "bundesmaster.com",
// }

// export async function generateStaticParams() {
//   return i18n.locales.map((locale) => ({ lang: locale }))
// }

// export default async function RootLayout({
//     children,
//     params: { lang },
//   }: {
//     children: React.ReactNode
//     params: { lang: Locale }
//   }) {
//     const dictionary = await getDictionary(lang)
  
//     return (
//       <html lang={lang}>
//         <body className={inter.className}>
//           <ThemeProvider attribute="class" defaultTheme="light">
//             <DictionaryProvider initialDictionary={dictionary}>
//               <div className="fixed top-4 left-4 z-50">
//                 <LanguagePicker />
//               </div>
//               {children}
//             </DictionaryProvider>
//           </ThemeProvider>
//         </body>
//       </html>
//     )
//   }

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { i18n } from "@/i18n-config"
import type { Locale } from "@/i18n-config"
import LanguagePicker from "@/components/language-picker"
import { getDictionary } from "@/lib/dictionary"
import { DictionaryProvider } from "@/hooks/use-dictionary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "German Language Learning",
  description: "Learn German noun genders and plurals with AI assistance",
  generator: "bundesmaster.com",
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  // Await the params object to fix the error
  const { lang } = params
  const dictionary = await getDictionary(lang)

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <DictionaryProvider initialDictionary={dictionary}>
            <div className="fixed top-4 left-4 z-50">
              <LanguagePicker />
            </div>
            {children}
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
