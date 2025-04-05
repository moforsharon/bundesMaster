"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle, Award, FileQuestion, Loader2 } from "lucide-react"
import PreTestChallenge from "./preTest"
import ChallengeGame from "./challengeGame"
import CountdownTimer from "@/components/countdown-timer"
import ChallengeEnded from "@/components/challenge-ended"
import ChallengeDetails from "@/components/challenge-details"
import { useLocalStorage } from "@/hooks/use-local-storage"
import PracticeGame from "./practiceTest"
import { useDictionary } from "@/hooks/use-dictionary"

interface Challenge {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  rules: string[]
  rewards: string
  createdAt: string
  updatedAt: string
}

enum ChallengeStatus {
  LOADING = 0,
  NOT_STARTED = 1,
  ACTIVE = 2,
  ENDED = 3,
  ERROR = 4,
}

export default function ChallengePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isChallenge = searchParams.get("isChallenge") === "yes"
  const [activeStep, setActiveStep] = useState<string>("main")
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus>(ChallengeStatus.LOADING)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useLocalStorage<string | null>("userId", null)
  const [userName, setUserName] = useState<string | null>(null)
  const [storedUserId, setStoredUserId] = useState<string | null>(null)
  const [challengeLevel, setChallengeLevel] = useState<string | null>(null)

  const { dict } = useDictionary()

  // Check for existing user on mount (client-side only)
  useEffect(() => {
    const checkExistingUser = async () => {
      const participantId = typeof window !== 'undefined' ? localStorage.getItem("participantId") : null
      const existingName = typeof window !== 'undefined' ? localStorage.getItem("userName") : null
      const level = typeof window !== 'undefined' ? localStorage.getItem("challengeLevel") : null

      setStoredUserId(participantId)
      setChallengeLevel(level)
      
      if (participantId) {
        setUserId(participantId)
        setUserName(existingName)
      }
    }

    checkExistingUser()
  }, [setUserId])
  // Add event listener for messages from child components
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SET_ACTIVE_STEP") {
        setActiveStep(event.data.step)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  useEffect(() => {
    // If isChallenge is 'yes', store it in local storage
    if (isChallenge) {
      localStorage.setItem("isChallenge", "yes")
    }
  }, [isChallenge])

  // Fetch challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch("/api/challenge?id=1")

        if (!response.ok) {
          throw new Error("Failed to fetch challenge data")
        }

        const data = await response.json()
        setChallenge(data)

        // Determine challenge status based on time
        updateChallengeStatus(data.startTime, data.endTime)
      } catch (err) {
        console.error("Error fetching challenge:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
        setChallengeStatus(ChallengeStatus.ERROR)
      }
    }

    fetchChallenge()
  }, [])

  // Function to update challenge status based on time
  const updateChallengeStatus = (startTimeStr: string, endTimeStr: string) => {
    const now = new Date()
    const startTime = new Date(startTimeStr)
    const endTime = new Date(endTimeStr)

    if (now < startTime) {
      setChallengeStatus(ChallengeStatus.NOT_STARTED)
    } else if (now >= startTime && now < endTime) {
      setChallengeStatus(ChallengeStatus.ACTIVE)
    } else {
      setChallengeStatus(ChallengeStatus.ENDED)
    }
  }

  // Set up interval to check challenge status
  useEffect(() => {
    if (!challenge) return

    // Update status immediately
    updateChallengeStatus(challenge.startTime, challenge.endTime)

    // Set interval to check status every minute
    const intervalId = setInterval(() => {
      updateChallengeStatus(challenge.startTime, challenge.endTime)
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [challenge])

  const startChallenge = () => {
    setActiveStep("pretest")
  }

  // Handle countdown completion
  const handleCountdownComplete = () => {
    setChallengeStatus(ChallengeStatus.ACTIVE)
  }

  // Render challenge content based on status
  const renderChallengeContent = () => {
    if (!challenge) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-blue-600">Loading challenge...</span>
        </div>
      )
    }

    switch (challengeStatus) {
      case ChallengeStatus.NOT_STARTED:
        return (
          <div className="space-y-6">
            <CountdownTimer targetDate={new Date(challenge.startTime)} onComplete={handleCountdownComplete} />
            {/* <ChallengeDetails challenge={challenge} /> */}
          </div>
        )

      case ChallengeStatus.ACTIVE:
        return <ChallengeGame />

      case ChallengeStatus.ENDED:
        return <ChallengeEnded challengeTitle={challenge.title} />

      case ChallengeStatus.ERROR:
        return (
          <div className="text-center py-8 space-y-4">
            <p className="text-red-500">Something went wrong!</p>
            <p>{error || "Failed to load challenge data"}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )

      default:
        return (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )
    }
  }

  // return (
  //   <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
  //     <Card className="w-full max-w-md shadow-lg" data-component="ChallengePage">
  //       <CardHeader className="text-center">
  //         <CardTitle className="text-2xl font-bold text-blue-800">
  //           {challenge ? challenge.title : "German Master Challenge"}
  //         </CardTitle>
  //         {/* {challenge && <CardDescription>{challenge.description}</CardDescription>} */}
  //       </CardHeader>

  //       {/* Step Cards */}
  //       <div className="flex justify-between px-6 mb-4">
  //         <div
  //           className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${activeStep === "pretest" ? "bg-blue-100" : "hover:bg-blue-50"}`}
  //           onClick={() => setActiveStep("pretest")}
  //         >
  //           <FileQuestion className="h-8 w-8 text-blue-600 mb-1" />
  //           <span className="text-xs font-medium">{storedUserId ? "Practice" : "Pre-test"}</span>
  //         </div>

  //         <div className="w-1/6 border-t-2 border-dashed border-blue-200 self-center"></div>

  //         <div
  //           className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${activeStep === "challenge" ? "bg-blue-100" : "hover:bg-blue-50"}`}
  //           // onClick={() => setActiveStep("challenge")}
  //               onClick={() => {
  //                   if (storedUserId) {
  //                   setActiveStep("challenge");
  //                   } else {
  //                   // You can add an error message or redirect here
  //                   console.error("User ID is not stored");
  //                   }
  //               }}
  //         >
  //           <CheckCircle className="h-8 w-8 text-blue-600 mb-1" />
  //           <span className="text-xs font-medium">Challenge</span>
  //         </div>

  //         <div className="w-1/6 border-t-2 border-dashed border-blue-200 self-center"></div>

  //         <div
  //           className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${activeStep === "prizes" ? "bg-blue-100" : "hover:bg-blue-50"}`}
  //           // onClick={() => setActiveStep("prizes")}
  //               onClick={() => {
  //                   if (storedUserId) {
  //                   setActiveStep("prizes");
  //                   } else {
  //                   // You can add an error message or redirect here
  //                   console.error("User ID is not stored");
  //                   }
  //               }}
  //         >
  //           <Award className="h-8 w-8 text-blue-600 mb-1" />
  //           <span className="text-xs font-medium">Prizes</span>
  //         </div>
  //       </div>

  //       <CardContent className="space-y-6">
  //       {activeStep === "main" && (
  //           <>
  //               <div className="flex justify-center">
  //               <Trophy className="h-24 w-24 text-yellow-500" />
  //               </div>
  //               <div className="text-center space-y-4">
  //               <h3 className="text-xl font-semibold">
  //                   {storedUserId ? "You passed the pre-test!" : "Welcome to the Challenge!"}
  //               </h3>
                
  //               {storedUserId ? (
  //                   <>
  //                   <p className="text-gray-600">
  //                       Practice while waiting for the challenge to start!
  //                   </p>
  //                   <div className="bg-green-50 p-4 rounded-lg border border-green-100">
  //                       <p className="text-sm text-green-800">
  //                       You're eligible to participate when the challenge begins.
  //                       </p>
  //                   </div>
  //                   </>
  //               ) : (
  //                   <>
  //                   <p className="text-gray-600">
  //                       Test your knowledge of German noun genders and compete with friends to become the Bundesmaster!
  //                   </p>
  //                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
  //                       <p className="text-sm text-blue-800">
  //                       Pass the pre-test to become eligible for the challenge!
  //                       </p>
  //                   </div>
  //                   </>
  //               )}
  //               </div>
  //           </>
  //           )}

  //           {activeStep === "pretest" && (
  //           storedUserId ? (
  //               <PracticeGame />
  //           ) : (
  //               <PreTestChallenge setActiveStep={setActiveStep} />
  //           )
  //           )}

  //         {activeStep === "challenge"  && <div className="text-center py-4">{renderChallengeContent()}</div>}

  //         {activeStep === "prizes" && (
  //           <div className="text-center py-8">
  //             {/* <h3 className="text-xl font-semibold mb-4">This is the prizes tab</h3> */}
  //             {challenge && (
  //               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
  //                 <h4 className="font-medium text-blue-700 flex items-center justify-center">
  //                   <Award className="mr-2 h-5 w-5" />
  //                   Challenge Rewards
  //                 </h4>
  //                 <p className="text-gray-700 mt-2">{challenge.rewards}</p>
  //               </div>
  //             )}
  //           </div>
  //         )}
  //       </CardContent>

  //       {activeStep === "main" && !storedUserId  &&  (
  //           <CardFooter>
  //           <Button 
  //               onClick={storedUserId ? () => setActiveStep("pretest") : startChallenge} 
  //               className="w-full bg-blue-600 hover:bg-blue-700"
  //           >
  //               {storedUserId ? "Practice Now" : "Start the Pre-test"}
  //           </Button>
  //           </CardFooter>
  //       )}
  //     </Card>
  //   </div>
  // )
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg" data-component="ChallengePage">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800">
            {dict?.challenge?.title || "German Together"}
          </CardTitle>
        </CardHeader>

        {/* Step Cards */}
        <div className="flex justify-between px-6 mb-4">
          <div
            className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${activeStep === "pretest" ? "bg-blue-100" : "hover:bg-blue-50"}`}
            onClick={() => setActiveStep("pretest")}
          >
            <FileQuestion className="h-8 w-8 text-blue-600 mb-1" />
            <span className="text-xs font-medium">{storedUserId ? dict?.challenge.practiceNow : dict?.challenge.preTest}</span>
          </div>

          <div className="w-1/6 border-t-2 border-dashed border-blue-200 self-center"></div>

          <div
            className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${activeStep === "challenge" ? "bg-blue-100" : "hover:bg-blue-50"}`}
            onClick={() => {
              if (storedUserId) {
                setActiveStep("challenge");
              } else {
                console.error("User ID is not stored");
              }
            }}
          >
            <CheckCircle className="h-8 w-8 text-blue-600 mb-1" />
            <span className="text-xs font-medium">{dict?.challenge.challenge}</span>
          </div>

          <div className="w-1/6 border-t-2 border-dashed border-blue-200 self-center"></div>

          <div
            className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-colors ${activeStep === "prizes" ? "bg-blue-100" : "hover:bg-blue-50"}`}
            onClick={() => {
              if (storedUserId) {
                setActiveStep("prizes");
              } else {
                console.error("User ID is not stored");
              }
            }}
          >
            <Award className="h-8 w-8 text-blue-600 mb-1" />
            <span className="text-xs font-medium">{dict?.challenge.prizes}</span>
          </div>
        </div>

        <CardContent className="space-y-6">
          {activeStep === "main" && (
            <>
              <div className="flex justify-center">
                <Trophy className="h-24 w-24 text-yellow-500" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">
                  {storedUserId ? dict?.challenge.passedPreTest : dict?.challenge.welcome}
                </h3>
                
                {storedUserId ? (
                  <>
                    <p className="text-gray-600">
                      {dict?.challenge.practiceWhileWaiting}
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-green-800">
                        {dict?.challenge.eligible}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">
                      {dict?.challenge.testDescription}
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800">
                        {dict?.challenge.passPreTest}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeStep === "pretest" && (
            storedUserId ? (
              <PracticeGame />
            ) : (
              <PreTestChallenge setActiveStep={setActiveStep} />
            )
          )}

          {activeStep === "challenge" && <div className="text-center py-4">{renderChallengeContent()}</div>}

          {activeStep === "prizes" && (
            <div className="text-center py-8">
              {challenge && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-700 flex items-center justify-center">
                    <Award className="mr-2 h-5 w-5" />
                    {dict?.challenge.prizes}
                  </h4>
                  <p className="text-gray-700 mt-2">{challenge.rewards}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {activeStep === "main" && !storedUserId && (
          <CardFooter>
            <Button 
              onClick={storedUserId ? () => setActiveStep("pretest") : startChallenge} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {storedUserId ? dict?.challenge.practiceNow : dict?.challenge.startPreTest}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

