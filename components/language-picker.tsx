"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { i18n } from "@/i18n-config"
import { getCookie, setCookie } from "cookies-next"

export default function LanguagePicker() {
  const pathName = usePathname()
  const router = useRouter()
  const [currentLocale, setCurrentLocale] = useState<string>("fr")

  useEffect(() => {
    const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
    setCurrentLocale(locale)
  }, [])

  const redirectedPathName = useCallback(
    (locale: string) => {
      if (!pathName) return "/"

      // Check if there's already a locale in the pathname
      const segments = pathName.split("/")
      segments[1] = locale

      return segments.join("/")
    },
    [pathName],
  )

  const switchLanguage = (locale: string) => {
    // Set cookie for future requests
    setCookie("NEXT_LOCALE", locale, { path: "/" })

    // Update state
    setCurrentLocale(locale)

    // Navigate to the new locale path
    router.push(redirectedPathName(locale))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={locale === currentLocale ? "font-bold bg-muted" : ""}
          >
            {locale === "en" ? "English" : "Français"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

