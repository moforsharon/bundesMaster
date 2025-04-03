"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function SearchParamsHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Move any logic that depends on searchParams here
    const params = searchParams.toString()
    if (params) {
      console.log("Search params:", params)
      // Handle your search params logic here
    }
  }, [searchParams])

  // This component doesn't render anything visible
  return null
}

