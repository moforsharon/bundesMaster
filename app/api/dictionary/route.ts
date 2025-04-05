import { type NextRequest, NextResponse } from "next/server"
import { getDictionary } from "@/lib/dictionary"
import { i18n } from "@/i18n-config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const locale = searchParams.get("locale") || i18n.defaultLocale

  // Validate locale
  if (!i18n.locales.includes(locale as any)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 })
  }

  try {
    const dictionary = await getDictionary(locale as any)
    return NextResponse.json(dictionary)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load dictionary" }, { status: 500 })
  }
}

