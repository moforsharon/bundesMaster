"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCookie } from "cookies-next"
import { i18n } from "@/i18n-config"
import type { Dictionary } from "@/lib/dictionary"

// Create a context for the dictionary
const DictionaryContext = createContext<{ dict: Dictionary | null }>({ dict: null })

// Provider component
export function DictionaryProvider({
  children,
  initialDictionary,
}: {
  children: ReactNode
  initialDictionary: Dictionary
}) {
  const [dict, setDict] = useState<Dictionary>(initialDictionary)

  useEffect(() => {
    const fetchDictionary = async () => {
      const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
      try {
        const response = await fetch(`/api/dictionary?locale=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setDict(data)
        }
      } catch (error) {
        console.error("Failed to fetch dictionary:", error)
      }
    }

    fetchDictionary()
  }, [])

  return <DictionaryContext.Provider value={{ dict }}>{children}</DictionaryContext.Provider>
}

// Hook to use the dictionary
export function useDictionary() {
  const context = useContext(DictionaryContext)
  if (context === undefined) {
    throw new Error("useDictionary must be used within a DictionaryProvider")
  }
  return context
}

