"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export default function ChallengePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isChallenge = searchParams.get("isChallenge") === "yes"

  useEffect(() => {
    // If isChallenge is 'yes', store it in local storage
    if (isChallenge) {
      localStorage.setItem("isChallenge", "yes")
    }
  }, [isChallenge])

  const startChallenge = () => {
    router.push("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800">German Master Challenge</CardTitle>
          <CardDescription>You've been invited to the German Gender Challenge!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Trophy className="h-24 w-24 text-yellow-500" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Welcome to the Challenge!</h3>
            <p className="text-gray-600">
              Test your knowledge of German noun genders and compete with friends to become the Bundesmaster!
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                Complete all levels to earn your certificate and prove your German language skills!
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={startChallenge} className="w-full bg-blue-600 hover:bg-blue-700">
            Start the Challenge
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

