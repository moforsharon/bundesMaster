"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Trophy, RotateCcw } from 'lucide-react'
import { useChat } from "ai/react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDictionary } from "@/hooks/use-dictionary"
import { i18n } from "@/i18n-config"
import { getCookie, setCookie } from "cookies-next"


type WordStats = {
  correct: string[]
  incorrect: string[]
  hesitated: string[]
}

export default function ChallengeGame() {
  const [currentWord, setCurrentWord] = useState<{ word: string; translation: string } | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [stats, setStats] = useState<WordStats>({ correct: [], incorrect: [], hesitated: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [hint, setHint] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [lastAnswer, setLastAnswer] = useState<"correct" | "incorrect" | null>(null)
  const { toast } = useToast()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [challengeEndTime, setChallengeEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [challengeCompleted, setChallengeCompleted] = useState(false)
  const [finalStats, setFinalStats] = useState<{score: number, total: number, position: number} | null>(null)
  const challengeLevel = typeof window !== 'undefined' ? localStorage.getItem("challengeLevel") : null
  const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
  const participantId = typeof window !== 'undefined' ? localStorage.getItem("participantId") : null

  const { dict } = useDictionary()

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [currentLocale, setCurrentLocale] = useState<string>("fr")

  useEffect(() => {
    const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
    setCurrentLocale(locale)
  }, [currentLocale])

  const { messages, append, setMessages, error } = useChat({
    api: "/api/gender-game",
    id: "gender-game",
    body: {  // Add this body parameter
      locale: currentLocale
    },
    onFinish: (message) => {
      setIsLoading(false)
      processAIResponse(message.content)
    },
    onError: (error) => {
      console.error("Error:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: error.message || "Failed to communicate with the AI.",
        variant: "destructive",
      })
    },
  })

  // Load challenge details on component mount
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const response = await fetch(`/api/challenge?id=${challengeLevel}`)
        const data = await response.json()
        
        if (data.endTime) {
          const endTime = new Date(data.endTime)
          startCountdown(endTime)
          startGame()
        }
      } catch (error) {
        console.error("Failed to load challenge:", error)
        toast({
          title: "Error",
          description: "Failed to load challenge details",
          variant: "destructive",
        })
      }
    }

    if (challengeLevel) {
      loadChallenge()
    }
  }, [challengeLevel, toast])

//   // Update timer every second
// // Update timer every second
// useEffect(() => {
//     const timer = setInterval(() => {
//       if (challengeEndTime && !challengeCompleted) {
//         // Use Date.UTC() for consistent timezone handling
//         const now = new Date()
//         const nowUTC = Date.UTC(
//           now.getUTCFullYear(),
//           now.getUTCMonth(),
//           now.getUTCDate(),
//           now.getUTCHours(),
//           now.getUTCMinutes(),
//           now.getUTCSeconds()
//         )
        
//         const endUTC = challengeEndTime.getTime()
//         const diff = endUTC - nowUTC
  
//         if (diff <= 0) {
//           clearInterval(timer)
//           endChallenge()
//           return
//         }
  
//         const hours = Math.floor(diff / (1000 * 60 * 60))
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
//         const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        
//         setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
//       }
//     }, 1000)
  
//     return () => clearInterval(timer)
//   }, [challengeEndTime, challengeCompleted])
const startCountdown = (targetDate: Date) => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        // endChallenge()
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Clean up interval on unmount
    return () => clearInterval(timer)
  }

  const startGame = async () => {
    setIsLoading(true)
    try {
      await append({
        role: "user",
        content: "Start the game and give me a new German noun to guess its gender.",
      })
    } catch (error) {
      console.error("Error starting game:", error)
      setIsLoading(false)
    }
  }

  const processAIResponse = (content: string) => {
    const wordMatch = content.match(/What is the gender of: "([^"]+)" \((.+)\)/)
    if (wordMatch) {
      setCurrentWord({
        word: wordMatch[1],
        translation: wordMatch[2],
      })
    }

    if (content.includes("Der ")) {
      setCorrectAnswer("der")
    } else if (content.includes("Die ")) {
      setCorrectAnswer("die")
    } else if (content.includes("Das ")) {
      setCorrectAnswer("das")
    }

    if (content.includes("✅ Correct!")) {
      setLastAnswer("correct")
      setStats(prev => ({
        ...prev,
        correct: [...prev.correct, currentWord?.word || ""].filter(Boolean),
      }))
    } else if (content.includes("❌ Wrong!")) {
      setLastAnswer("incorrect")
      setStats(prev => ({
        ...prev,
        incorrect: [...prev.incorrect, currentWord?.word || ""].filter(Boolean),
      }))
    }
  }

  const endChallenge = async () => {
    setChallengeCompleted(true)
    
    try {
      // Submit final score
      const response = await fetch('/api/challenge/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          score: stats.correct.length,
          totalQuestions: stats.correct.length + stats.incorrect.length
        })
      })

      const result = await response.json()
      setFinalStats({
        score: stats.correct.length,
        total: stats.correct.length + stats.incorrect.length,
        position: result.position
      })
    } catch (error) {
      console.error("Error submitting challenge:", error)
      toast({
        title: "Error",
        description: "Failed to submit challenge results",
        variant: "destructive",
      })
    }
  }

  const handleAnswer = async (answer: string) => {
    if (isLoading || !currentWord || challengeCompleted) return

    setShowHint(false)
    setIsLoading(true)
    setSelectedAnswer(answer)

    await append({
      role: "user",
      content: answer,
    })
  }

  const handleHint = async () => {
    if (!currentWord || isLoading) return

    setShowHint(true)
    setIsHintLoading(true)
    setStats(prev => ({
      ...prev,
      hesitated: [...prev.hesitated, currentWord.word],
    }))

    try {
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: currentWord.word })
      })
      const data = await response.json()
      setHint(data.hint)
    } catch (error) {
      console.error("Error getting hint:", error)
      setHint("Look at the word ending and apply German gender rules.")
    } finally {
      setIsHintLoading(false)
    }
  }

  const handleNextWord = async () => {
    setShowHint(false)
    setHint("")
    setLastAnswer(null)
    setIsLoading(true)
    setCurrentWord(null)
    
    await append({
      role: "user",
      content: "Next word please",
    })
  }

  const restartChallenge = () => {
    setMessages([])
    setStats({ correct: [], incorrect: [], hesitated: [] })
    setChallengeCompleted(false)
    setFinalStats(null)
    startGame()
  }

  if (!challengeLevel) {
    return (
      <div className="text-center py-8">
        <p>{dict?.game.noActiveChallenge}</p>
      </div>
    )
  }

  if (challengeCompleted) {
    return (
      <div className="text-center py-8 space-y-4">
        <h3 className="text-2xl font-bold">{dict?.challenge.challengeCompleted}</h3>
        {finalStats ? (
          <>
            <p>
              {dict?.challenge.yourScore
                .replace("{score}", finalStats.score.toString())
                .replace("{total}", finalStats.total.toString())}
            </p>
            <p>{dict?.challenge.yourPosition.replace("{position}", finalStats.position.toString())}</p>
          </>
        ) : (
          <p>{dict?.challenge.calculatingResults}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex justify-center text-center items-center">
      <div className="justify-self-center overflow-hidden justify-center text-center items-center">
        <Card className="border-none shadow-none">
          <CardContent>
            {error ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-red-500">{dict?.challenge.somethingWrong}</p>
                <Button onClick={restartChallenge}>{dict?.challenge.tryAgain}</Button>
              </div>
            ) : currentWord ? (
              <div className="space-y-8 mt-5">
                <div className="text-center text-sm text-gray-500 mb-4">
                  {dict?.challenge.timeRemaining
                    .replace("{days}", timeLeft.days.toString())
                    .replace("{hours}", timeLeft.hours.toString())
                    .replace("{minutes}", timeLeft.minutes.toString())
                    .replace("{seconds}", timeLeft.seconds.toString())}
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-blue-800">{currentWord.word}</h3>
                  <p className="text-gray-600">({currentWord.translation})</p>
                </div>

                {lastAnswer === null ? (
                  <div className="space-y-4">
                    <p className="text-center font-medium">{dict?.game.whatIsGender}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["der", "die", "das"].map((gender) => (
                        <Button
                          key={gender}
                          variant="outline"
                          className={`text-lg py-6 border-2 ${
                            gender === "der"
                              ? "hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800"
                              : gender === "die"
                                ? "hover:bg-pink-50 hover:text-pink-800 hover:border-pink-800"
                                : "hover:bg-green-50 hover:text-green-800 hover:border-green-800"
                          } relative`}
                          onClick={() => handleAnswer(gender)}
                          disabled={isLoading}
                        >
                          {gender}
                          {isLoading && selectedAnswer === gender && (
                            <div className="absolute bottom-0 left-0 right-0 text-center">
                              <span className="inline-flex">
                                <span className="animate-bounce mr-1">.</span>
                                <span className="animate-bounce animation-delay-200 mr-1">.</span>
                                <span className="animate-bounce animation-delay-400">.</span>
                              </span>
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-md text-center ${
                        lastAnswer === "correct"
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                    >
                      <p className="text-sm md:text-lg font-medium">
                        {lastAnswer === "correct"
                          ? `✅ ${dict?.game.correct}!`
                          : `❌ ${dict?.game.wrong}! ${dict?.game.correctAnswerIs} "${correctAnswer}"`}
                      </p>
                      {hint && (
                        <p className="mt-2 text-sm">
                          <span className="font-medium">{dict?.game.hint}:</span> {hint}
                        </p>
                      )}
                    </div>

                    <div className="text-center mt-6">
                      <Button onClick={handleNextWord} disabled={isLoading}>
                        {dict?.game.nextWord}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-green-50">
                <Trophy className="mr-1 h-3 w-3" />
                {stats.correct.length} {dict?.game.correctAnswers}
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                ❌ {stats.incorrect.length} {dict?.game.wrong}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )

  // if (!challengeLevel) {
  //   return (
  //     <div className="text-center py-8">
  //       <p>No active challenge found</p>
  //     </div>
  //   )
  // }

  // if (challengeCompleted) {
  //   return (
  //     <div className="text-center py-8 space-y-4">
  //       <h3 className="text-2xl font-bold">Challenge Completed!</h3>
  //       {finalStats ? (
  //         <>
  //           <p>You scored {finalStats.score} out of {finalStats.total}</p>
  //           <p>Your position: {finalStats.position}</p>
  //         </>
  //       ) : (
  //         <p>Calculating your results...</p>
  //       )}
  //       {/* <Button onClick={restartChallenge}>
  //         <RotateCcw className="mr-2 h-4 w-4" />
  //         Try Again
  //       </Button> */}
  //     </div>
  //   )
  // }

  // return (
  //   <div className="flex justify-center text-center items-center">
  //     <div className="justify-self-center overflow-hidden justify-center text-center items-center">
  //       <Card className="border-none shadow-none">
  //         <CardContent>
  //           {error ? (
  //             <div className="text-center py-8 space-y-4">
  //               <p className="text-red-500">Something went wrong!</p>
  //               <Button onClick={restartChallenge}>Try Again</Button>
  //             </div>
  //           ) : currentWord ? (
  //             <div className="space-y-8 mt-5">
  //               <div className="text-center text-sm text-gray-500 mb-4">
  //                 Time remaining: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
  //               </div>

  //               <div className="text-center space-y-2">
  //                 <h3 className="text-2xl font-bold text-blue-800">{currentWord.word}</h3>
  //                 <p className="text-gray-600">({currentWord.translation})</p>
  //               </div>

  //               {lastAnswer === null ? (
  //                 <div className="space-y-4">
  //                   <p className="text-center font-medium">What is the gender?</p>
  //                   <div className="grid grid-cols-3 gap-3">
  //                     {['der', 'die', 'das'].map((gender) => (
  //                       <Button
  //                         key={gender}
  //                         variant="outline"
  //                         className={`text-lg py-6 border-2 ${
  //                           gender === 'der' ? 'hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800' :
  //                           gender === 'die' ? 'hover:bg-pink-50 hover:text-pink-800 hover:border-pink-800' :
  //                           'hover:bg-green-50 hover:text-green-800 hover:border-green-800'
  //                         } relative`}
  //                         onClick={() => handleAnswer(gender)}
  //                         disabled={isLoading}
  //                       >
  //                         {gender}
  //                         {isLoading && selectedAnswer === gender && (
  //                           <div className="absolute bottom-0 left-0 right-0 text-center">
  //                             <span className="inline-flex">
  //                               <span className="animate-bounce mr-1">.</span>
  //                               <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                               <span className="animate-bounce animation-delay-400">.</span>
  //                             </span>
  //                           </div>
  //                         )}
  //                       </Button>
  //                     ))}
  //                   </div>

  //                   {/* <div className="text-center mt-6">
  //                     <Button
  //                       variant="ghost"
  //                       onClick={handleHint}
  //                       disabled={isLoading || showHint}
  //                       className="text-amber-600"
  //                     >
  //                       <Lightbulb className="mr-2 h-4 w-4" />
  //                       Hint
  //                     </Button>
  //                   </div> */}

  //                   {/* {showHint && (
  //                     <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
  //                       <p className="text-amber-800 text-sm md:text-base">
  //                         {isHintLoading ? (
  //                           <span className="inline-flex">
  //                             <span className="animate-bounce mr-1">.</span>
  //                             <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                             <span className="animate-bounce animation-delay-400">.</span>
  //                           </span>
  //                         ) : hint}
  //                       </p>
  //                     </div>
  //                   )} */}
  //                 </div>
  //               ) : (
  //                 <div className="space-y-4">
  //                   <div className={`p-4 rounded-md text-center ${
  //                     lastAnswer === "correct"
  //                       ? "bg-green-50 border border-green-200 text-green-800"
  //                       : "bg-red-50 border border-red-200 text-red-800"
  //                   }`}>
  //                     <p className="text-sm md:text-lg font-medium">
  //                       {lastAnswer === "correct"
  //                         ? "✅ Correct!"
  //                         : `❌ Wrong! The correct answer is "${correctAnswer}"`}
  //                     </p>
  //                     {hint && (
  //                       <p className="mt-2 text-sm">
  //                         <span className="font-medium">Hint:</span> {hint}
  //                       </p>
  //                     )}
  //                   </div>

  //                   <div className="text-center mt-6">
  //                     <Button onClick={handleNextWord} disabled={isLoading}>
  //                       Next Word
  //                     </Button>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           ) : (
  //             <div className="flex justify-center items-center py-12">
  //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
  //             </div>
  //           )}
  //         </CardContent>

  //         <CardFooter className="flex justify-between border-t pt-4">
  //           <div className="flex space-x-2">
  //             <Badge variant="outline" className="bg-green-50">
  //               <Trophy className="mr-1 h-3 w-3" />
  //               {stats.correct.length} correct
  //             </Badge>
  //             <Badge variant="outline" className="bg-red-50">
  //               ❌ {stats.incorrect.length} wrong
  //             </Badge>
  //           </div>
  //         </CardFooter>
  //       </Card>
  //     </div>
  //   </div>
  // )
}