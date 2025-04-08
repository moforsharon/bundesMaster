// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"
// import { match } from "@formatjs/intl-localematcher"
// import Negotiator from "negotiator"

// // List of supported locales
// export const locales = ["en", "fr"]
// export const defaultLocale = "en"

// // Get the preferred locale from the request
// function getLocale(request: NextRequest) {
//   const negotiatorHeaders: Record<string, string> = {}
//   request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

//   // Use negotiator and intl-localematcher to get the best locale
//   const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
//   return match(languages, locales, defaultLocale)
// }

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname

//     // Explicitly block favicon.ico
//     if (pathname === '/favicon.ico') {
//       return new NextResponse(null, { status: 404 });
//     }

//   // Check if the pathname already has a locale
//   const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

//   if (pathnameHasLocale) return NextResponse.next()

//   // Redirect if there is no locale in the pathname
//   const locale = getLocale(request)
//   request.nextUrl.pathname = `/${locale}${pathname}`

//   // Store the locale in a cookie for client-side access
//   const response = NextResponse.redirect(request.nextUrl)
//   response.cookies.set("NEXT_LOCALE", locale)

//   return response
// }

// // export const config = {
// //   matcher: [
// //     // Skip all internal paths (_next, api, etc)
// //     "/((?!_next|api|favicon.ico|.*\\.).*)",
// //   ],
// // }

// export const config = {
//   matcher: [
//     "/((?!_next|api|favicon\\.ico|.*\\..*).*)", // Explicitly exclude favicon.ico
//   ],
// };

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

// List of supported locales
export const locales = ["en", "fr"]
export const defaultLocale = "en"

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // Use negotiator and intl-localematcher to get the best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the request is for favicon.ico or other static assets
  if (
    pathname.includes(".") || // This catches all files with extensions
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect if there is no locale in the pathname
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  // Store the locale in a cookie for client-side access
  const response = NextResponse.redirect(request.nextUrl)
  response.cookies.set("NEXT_LOCALE", locale)

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths and files with extensions
    "/((?!api|_next|.*\\.).*)",
  ],
}
