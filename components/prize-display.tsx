"use client"

import { useState, useEffect } from "react"
import { Award, Trophy, Medal, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getCookie } from "cookies-next"

interface PrizeDisplayProps {
  participantId: string | null
  challenge: any
}

interface RankData {
  position: number
  score: number
  time: number | null
  totalParticipants: number
}

export default function PrizeDisplay({ participantId, challenge }: PrizeDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [rankData, setRankData] = useState<RankData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const locale = (getCookie("NEXT_LOCALE") as string) || "en"

  useEffect(() => {
    const fetchRanking = async () => {
      if (!participantId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/challenge/rank?participantId=${participantId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch ranking")
        }

        const data = await response.json()
        setRankData(data)
      } catch (err) {
        console.error("Error fetching rank:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRanking()
  }, [participantId])

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "-"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getWinnerMessage = (position: number) => {
    if (locale === "fr") {
      switch (position) {
        case 1:
          return "Félicitations! Vous êtes le champion du défi!"
        case 2:
          return "Bravo! Vous avez obtenu la deuxième place!"
        case 3:
          return "Excellent! Vous avez obtenu la troisième place!"
        default:
          return ""
      }
    } else {
      switch (position) {
        case 1:
          return "Congratulations! You are the challenge champion!"
        case 2:
          return "Well done! You achieved second place!"
        case 3:
          return "Great job! You achieved third place!"
        default:
          return ""
      }
    }
  }

  const getRankText = (position: number, total: number) => {
    return locale === "fr" ? `Votre classement: ${position} sur ${total}` : `Your rank: ${position} out of ${total}`
  }

  const getScoreText = (score: number) => {
    return locale === "fr" ? `Score: ${score} points` : `Score: ${score} points`
  }

  const getTimeText = (time: number | null) => {
    return locale === "fr" ? `Temps: ${formatTime(time)}` : `Time: ${formatTime(time)}`
  }

  const getPrizeTitle = () => {
    return locale === "fr" ? "Récompenses du défi" : "Challenge Rewards"
  }

  const getLoadingText = () => {
    return locale === "fr" ? "Calcul de votre classement..." : "Calculating your ranking..."
  }

  const getNotParticipatedText = () => {
    return locale === "fr"
      ? "Vous n'avez pas encore participé au défi."
      : "You haven't participated in the challenge yet."
  }

  return (
    <div className="space-y-6">
      {challenge && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-700 flex items-center justify-center">
            <Award className="mr-2 h-5 w-5" />
            {getPrizeTitle()}
          </h4>
          <p className="text-gray-700 mt-2">{challenge.rewards}</p>
        </div>
      )}

      {participantId ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-gray-600">{getLoadingText()}</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                <p>{error}</p>
              </div>
            ) : rankData ? (
              <div className="space-y-4">
                {rankData.position <= 3 && (
                  <div
                    className={`p-4 text-center ${
                      rankData.position === 1
                        ? "bg-yellow-50 border-b border-yellow-200"
                        : rankData.position === 2
                          ? "bg-gray-50 border-b border-gray-200"
                          : "bg-amber-50 border-b border-amber-200"
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      {rankData.position === 1 ? (
                        <Trophy className="h-12 w-12 text-yellow-500" />
                      ) : rankData.position === 2 ? (
                        <Medal className="h-12 w-12 text-gray-400" />
                      ) : (
                        <Medal className="h-12 w-12 text-amber-600" />
                      )}
                    </div>
                    <p className="font-medium text-lg">{getWinnerMessage(rankData.position)}</p>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{getRankText(rankData.position, rankData.totalParticipants)}</span>
                    <Badge
                      variant="outline"
                      className={`${
                        rankData.position <= 3 ? "bg-green-50 text-green-800" : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      {rankData.position <= 3 ? <Trophy className="mr-1 h-3 w-3" /> : null}#{rankData.position}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">{getScoreText(rankData.score)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500">{getTimeText(rankData.time)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>{getNotParticipatedText()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
