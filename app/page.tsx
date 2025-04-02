"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GenderGame from "@/components/gender-game"
import PluralGame from "@/components/plural-game"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("gender")
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if OpenAI API key is configured
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/env-check")
        const data = await response.json()
        setApiKeyConfigured(data.hasApiKey)
      } catch (error) {
        console.error("Failed to check API key:", error)
        setApiKeyConfigured(false)
      }
    }

    checkApiKey()
  }, [])

  useEffect(() => {
    // Check if user came from challenge link
    const isChallenge = localStorage.getItem('isChallenge') === 'true'

    if (isChallenge) {
      console.log('User came from challenge:')
      // You can now use this info throughout your app
      router.push("/challenge?isChallenge=yes")
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-1 md:p-8 justify-center align-middle items-center overflow-hidden">
      <div className="max-w-4xl mx-auto ">
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-blue-800">German Language Learning</CardTitle>
            <CardDescription className="text-center text-lg">
              Practice noun genders and plurals with AI-powered learning
            </CardDescription>
          </CardHeader>

          {apiKeyConfigured === false && (
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Key Missing</AlertTitle>
                <AlertDescription>
                  Please set up your OpenAI API key as an environment variable named OPENAI_API_KEY to use this
                  application.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card> */}

        <Tabs defaultValue="gender" value={activeTab} onValueChange={setActiveTab} className="flex justify-center text-center items-center  w-full">
          {/* <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="gender" className="text-lg py-3">
              Noun Genders
            </TabsTrigger>
            <TabsTrigger value="plural" className="text-lg py-3">
              Noun Plurals
            </TabsTrigger>
          </TabsList> */}

          <TabsContent value="gender">{activeTab === "gender" && <GenderGame />}</TabsContent>

          <TabsContent value="plural">{activeTab === "plural" && <PluralGame />}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

