// "use client"

// import { useState, useEffect, Suspense } from "react"
// import { Tabs, TabsContent } from "@/components/ui/tabs"
// import GenderGame from "@/components/gender-game"
// import PluralGame from "@/components/plural-game"
// import { useRouter } from "next/navigation"
// import SearchParamsHandler from "@/components/search-params-handler"

// export default function Home() {
//   const [activeTab, setActiveTab] = useState("gender")
//   const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null)
//   const router = useRouter()

//   useEffect(() => {
//     // Check if OpenAI API key is configured
//     const checkApiKey = async () => {
//       try {
//         const response = await fetch("/api/env-check")
//         const data = await response.json()
//         setApiKeyConfigured(data.hasApiKey)
//       } catch (error) {
//         console.error("Failed to check API key:", error)
//         setApiKeyConfigured(false)
//       }
//     }

//     checkApiKey()
//   }, [])

//   useEffect(() => {
//     // Check if user came from challenge link
//     const isChallenge = localStorage.getItem("isChallenge") === "yes"

//     if (isChallenge) {
//       console.log("User came from challenge:")
//       // You can now use this info throughout your app
//       router.push("/challenge?isChallenge=yes")
//     }
//   }, [router])

//   return (
//     <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-1 md:p-8 justify-center align-middle items-center overflow-hidden">
//       <div className="max-w-4xl mx-auto ">
//         {/* <Card className="mb-8">
//           <CardHeader>
//             <CardTitle className="text-3xl font-bold text-center text-blue-800">German Language Learning</CardTitle>
//             <CardDescription className="text-center text-lg">
//               Practice noun genders and plurals with AI-powered learning
//             </CardDescription>
//           </CardHeader>

//           {apiKeyConfigured === false && (
//             <CardContent>
//               <Alert variant="destructive" className="mb-4">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>API Key Missing</AlertTitle>
//                 <AlertDescription>
//                   Please set up your OpenAI API key as an environment variable named OPENAI_API_KEY to use this
//                   application.
//                 </AlertDescription>
//               </Alert>
//             </CardContent>
//           )}
//         </Card> */}

//         <Tabs
//           defaultValue="gender"
//           value={activeTab}
//           onValueChange={setActiveTab}
//           className="flex justify-center text-center items-center w-full"
//         >
//           {/* <TabsList className="grid w-full grid-cols-2 mb-8">
//             <TabsTrigger value="gender" className="text-lg py-3">
//               Noun Genders
//             </TabsTrigger>
//             <TabsTrigger value="plural" className="text-lg py-3">
//               Noun Plurals
//             </TabsTrigger>
//           </TabsList> */}

//           <TabsContent value="gender">{activeTab === "gender" && <GenderGame />}</TabsContent>

//           <TabsContent value="plural">{activeTab === "plural" && <PluralGame />}</TabsContent>
//         </Tabs>
//       </div>

//       {/* Wrap the search params usage in a Suspense boundary */}
//       <Suspense fallback={null}>
//         <SearchParamsHandler />
//       </Suspense>
//     </div>
//   )
// }

import { redirect } from "next/navigation"
import { i18n } from "@/i18n-config"
import { cookies } from "next/headers"

export default async function Home() {
  const cookieStore = await cookies()
  const locale = cookieStore.get("NEXT_LOCALE")?.value || i18n.defaultLocale

  // Redirect to the localized home page
  redirect(`/${locale}`)
}

