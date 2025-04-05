"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ButtonWithRipple } from "@/components/ui/button-with-ripple"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Trophy, RotateCcw, Lock, Download, ChevronRight } from 'lucide-react'
import { useChat  } from "ai/react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import ChallengeUserLoginModal from "./challenge-user-login-modal"
import { useDictionary } from "@/hooks/use-dictionary"
import { i18n } from "@/i18n-config"
import { getCookie, setCookie } from "cookies-next"


type WordStats = {
  correct: string[]
  incorrect: string[]
  hesitated: string[]
}

type LevelConfig = {
  id: number
  name: string
  wordsRequired: number
  correctRequired: number
  completed: boolean
  unlocked: boolean
  giftClaimed: boolean
}

interface PreTestChallengeProps {
    setActiveStep?: (step: string) => void
  }

export default function PreTestChallenge({ setActiveStep }: PreTestChallengeProps) {
  const [currentWord, setCurrentWord] = useState<{ word: string; translation: string } | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [stats, setStats] = useState<WordStats>({ correct: [], incorrect: [], hesitated: [] })
  const [gameStarted, setGameStarted] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [hint, setHint] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [lastAnswer, setLastAnswer] = useState<"correct" | "incorrect" | null>(null)
  const { toast } = useToast()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [levels, setLevels] = useLocalStorage<LevelConfig[]>("gender-game-levels", [
    {
      id: 1,
      name: "Level 1",
      wordsRequired: 20,
      correctRequired: 10,
      completed: false,
      unlocked: true,
      giftClaimed: false,
    }
  ])
  const [currentLevel, setCurrentLevel] = useLocalStorage<number>("gender-game-current-level", 1)
  const [levelProgress, setLevelProgress] = useLocalStorage<Record<number, { attempts: number; correct: number }>>(
    "gender-game-level-progress",
    {},
  )
  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const [showLevelFailed, setShowLevelFailed] = useState(false)
  const levelSelectorRef = useRef<HTMLDivElement>(null);

  // User login modal state
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLoginReturningUserModal, setLoginReturningUserModal] = useState(false)
  const [userId, setUserId] = useLocalStorage<string | null>("userId", null)
  const [giftLevelId, setGiftLevelId] = useState<number | null>(null)
  const [showUserButton, setShowUserButton] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { dict } = useDictionary()


    // Reset all game-related states on first navigation
    useEffect(() => {
        // Only preserve user-related data
        const resetGameStates = () => {
          // Reset game progress
          setLevels([
            {
              id: 1,
              name: "Level 1",
              wordsRequired: 20,
              correctRequired: 10,
              completed: false,
              unlocked: true,
              giftClaimed: false,
            }
          ])
          setCurrentLevel(1)
          setLevelProgress({})
          
          // Reset game state
          setStats({ correct: [], incorrect: [], hesitated: [] })
          setCurrentWord(null)
          setShowHint(false)
          setHint("")
          setCorrectAnswer("")
          setLastAnswer(null)
          setSelectedAnswer(null)
          setShowLevelComplete(false)
          setShowLevelFailed(false)
          
          // Reset messages from AI
          setMessages([])
          
          // Set game as started to trigger the initial word fetch
          gameStartedRef.current = false
          setGameStarted(true)
          
          console.log("Game states have been reset")
        }
        
        resetGameStates()
      }, [])
  
    // Check for existing user on mount
    useEffect(() => {
      const checkExistingUser = async () => {
        const participantId = localStorage.getItem("participantId")
        const storedUserId = localStorage.getItem("userId")
        const existingName = localStorage.getItem("userName")
  
        if (participantId) {
          setUserId(storedUserId)
          setUserName(existingName)
        //   await loadUserProgress(storedUserId)
        } 
        // else if (gameStarted) {
        //   // If game is started and no user is found, show login modal
        //   setShowLoginModal(true)
        // }
      }
  
      checkExistingUser()
    }, [gameStarted, setUserId, setUserName])
  
    // Load user progress from server
    const loadUserProgress = async (userId: string) => {
      try {
        //     // Ensure userId is properly encoded and not double-encoded
        // const cleanUserId = userId.replace(/^"+|"+$/g, ''); // Remove any surrounding quotes
        // const response = await fetch(`/api/progress?userId=${encodeURIComponent(cleanUserId)}`);
        const response = await fetch(`/api/progress?userId=${userId}`)
  
        if (!response.ok) {
          throw new Error("Failed to load progress")
        }
  
        const data = await response.json()
  
        if (data.progress) {
          setCurrentLevel(data.progress.currentLevel)
          setLevels(data.progress.levels)
          setLevelProgress(data.progress.levelProgress)
  
          toast({
            title: "Progress loaded",
            description: "Your saved progress has been loaded.",
          })
        }
      } catch (error) {
        console.error("Error loading progress:", error)
      }
    }
  
    // Save user progress to server
    const saveUserProgress = async () => {
      if (!userId) return
  
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            currentLevel,
            levels,
            levelProgress,
          }),
        })
      } catch (error) {
        console.error("Error saving progress:", error)
      }
    }

  useEffect(() => {
    if (!levelSelectorRef.current || !gameStarted) return;
  
    const scrollContainer = levelSelectorRef.current;
    const currentLevelElement = document.getElementById(`level-${currentLevel}`);
    
    if (!currentLevelElement) return;
  
    // Calculate scroll position
    const containerWidth = scrollContainer.clientWidth;
    const elementOffset = currentLevelElement.offsetLeft;
    const elementWidth = currentLevelElement.offsetWidth;
    
    // Calculate the center position
    const scrollPosition = elementOffset - (containerWidth / 2) + (elementWidth / 2);
  
    // Use requestAnimationFrame for smoother animation
    const scroll = () => {
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    };
  
    // Check if the browser supports smooth scrolling
    if ('scrollBehavior' in document.documentElement.style) {
      scroll();
    } else {
      // Fallback for browsers that don't support smooth scrolling
      scrollContainer.scrollLeft = scrollPosition;
    }
  
  }, [currentLevel, gameStarted, levels]); // Added levels to dependencies

  useEffect(() => {
    console.log(`selectedAnswer is : ${selectedAnswer}`)
  }, [selectedAnswer])

    // Save progress whenever it changes
    useEffect(() => {
      if (userId && gameStarted) {
        saveUserProgress()
      }
    }, [levels, currentLevel, levelProgress, userId, gameStarted])

    const [currentLocale, setCurrentLocale] = useState<string>("fr")

    useEffect(() => {
      const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
      setCurrentLocale(locale)
    }, [currentLocale])

  // In your component
const { messages, append, setMessages, error } = useChat({
  api: "/api/gender-game",
  id: "gender-game",
  body: {  // Add this body parameter
    locale: currentLocale
  },
  onFinish: (message) => {
    console.log("AI response received:", message.content);
    setIsLoading(false);
    processAIResponse(message.content);
  },
  onError: (error) => {
    console.error("Detailed Chat Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      timestamp: new Date().toISOString()
    });

    setIsLoading(false);
    toast({
      title: "Error",
      description: error.message || "Failed to communicate with the AI. Please try again.",
      variant: "destructive",
    });
  },
});

const startGame = async () => {
  gameStartedRef.current = true;
  setIsLoading(true);
  setShowUserButton(true);
  
  try {
    console.log("Starting game...");
    const response = await append({
      role: "user",
      content: "Start the game and give me a new German noun to guess its gender.",
    });

    console.log("Append response:", response);
  } catch (error) {
    console.error("Detailed Start Game Error:", {
      error: error instanceof Error ? error : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    setIsLoading(false);
    toast({
      title: "Start Game Error",
      description: error instanceof Error ? error.message : "Failed to start the game",
      variant: "destructive",
    });
  }
};

  const gameStartedRef = useRef(false)

  useEffect(() => {
    if (!gameStarted || gameStartedRef.current) return

    // const startGame = async () => {
    //   gameStartedRef.current = true
    //   setIsLoading(true)
    //   try {
    //     await append({
    //       role: "user",
    //       content: "Start the game and give me a new German noun to guess its gender.",
    //     })
    //   } catch (error) {
    //     console.error("Error starting game:", error)
    //     setIsLoading(false)
    //     toast({
    //       title: "Error",
    //       description: "Failed to start the game. Please try again.",
    //       variant: "destructive",
    //     })
    //   }
    // }

    startGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted])


  const processAIResponse = (content: string) => {
    console.log("AI Response Content:", content);
  
    // Create a new object to hold all updates
    const updates: {
      newWord?: { word: string; translation: string };
      newHint?: string;
      newCorrectAnswer?: string;
      newLastAnswer?: "correct" | "incorrect" | null;
    } = {};
  
    // Extract the word and translation
    const wordMatch = content.match(/What is the gender of: "([^"]+)" \((.+)\)/);
    if (wordMatch && (!currentWord || currentWord.word !== wordMatch[1])) {
      updates.newWord = {
        word: wordMatch[1],
        translation: wordMatch[2],
      };
    }
  
    // Extract hint if present
    const hintMatch = content.match(/Hint:([^!]+)/);
    if (hintMatch) {
      updates.newHint = hintMatch[1].trim();
    }
  
    // Extract correct answer if present
    if (content.includes("Der ")) {
      updates.newCorrectAnswer = "der";
    } else if (content.includes("Die ")) {
      updates.newCorrectAnswer = "die";
    } else if (content.includes("Das ")) {
      updates.newCorrectAnswer = "das";
    }
  
    // Update all state at once
    setCurrentWord(prev => updates.newWord || prev);
    setHint(updates.newHint || "");
    setCorrectAnswer(updates.newCorrectAnswer || "");
  
    // Handle answer feedback
    if (content.includes("✅ Correct!")) {
      updates.newLastAnswer = "correct";
      setStats((prev) => {
        if (currentWord && !prev.correct.includes(currentWord.word)) {
          return {
            ...prev,
            correct: [...prev.correct, currentWord.word],
          };
        }
        return prev;
      });

      updateLevelProgress(true)
    } else if (content.includes("❌ Wrong!")) {
      updates.newLastAnswer = "incorrect";
      setStats((prev) => {
        if (currentWord && !prev.incorrect.includes(currentWord.word)) {
          return {
            ...prev,
            incorrect: [...prev.incorrect, currentWord.word],
          };
        }
        return prev;
      });
      updateLevelProgress(false)
    }
  
    setLastAnswer(updates.newLastAnswer || null);
  };

  const updateLevelProgress = (isCorrect: boolean) => {
    setLevelProgress((prev) => {
      const currentLevelProgress = prev[currentLevel] || { attempts: 0, correct: 0 }
      const updatedProgress = {
        ...prev,
        [currentLevel]: {
          attempts: currentLevelProgress.attempts + 1,
          correct: isCorrect ? currentLevelProgress.correct + 1 : currentLevelProgress.correct,
        },
      }

      // Check if level is complete
      const levelConfig = levels.find((l) => l.id === currentLevel)
      if (levelConfig) {
        if (updatedProgress[currentLevel].attempts >= levelConfig.wordsRequired) {
          // Level attempt is complete, check if passed
          if (updatedProgress[currentLevel].correct >= levelConfig.correctRequired) {
            // Level passed
            setLevels((prevLevels) =>
              prevLevels.map((level) => {
                if (level.id === currentLevel) {
                  return { ...level, completed: true }
                } else if (level.id === currentLevel + 1) {
                  return { ...level, unlocked: true }
                }
                return level
              }),
            )
            setShowLevelComplete(true)
          } else {
            // Level failed
            setShowLevelFailed(true)
          }
        }
      }

      return updatedProgress
    })
  }

  const handleAnswer = async (answer: string) => {
    if (isLoading || !currentWord) return

    setShowHint(false)
    setIsLoading(true)
    setSelectedAnswer(answer) // Track which button was clicked

    await append({
      role: "user",
      content: answer,
    })
  }

  const { messages: hintMessages, append: hintAppend } = useChat({
    api: "/api/hint",
    id: "hint",
    body: {  // Add this body parameter
      locale: currentLocale
    },
    onFinish: (message) => {
      const hintContent = message.content
      setHint(hintContent)
      setIsHintLoading(false)
    },
    onError: (error) => {
      console.error("Hint error:", error)
      setIsHintLoading(false)
      setHint("Look at the word ending and apply German gender rules.")
      toast({
        title: "Hint Error",
        description: "Couldn't get a hint. Showing default hint instead.",
        variant: "destructive",
      })
    },
  })

  // Update the handleHint function
  const handleHint = async () => {
    if (!currentWord || isLoading) return

    setShowHint(true)
    setIsHintLoading(true)

    // Add to hesitated stats
    setStats((prev) => {
      if (!prev.hesitated.includes(currentWord.word)) {
        return {
          ...prev,
          hesitated: [...prev.hesitated, currentWord.word],
        }
      }
      return prev
    })

    console.log("Requesting hint for word:", currentWord.word)

    // Send the word directly in the request body
    try {
      await hintAppend({
        role: "user",
        content: currentWord.word,
      })
    } catch (error) {
      console.error("Error requesting hint:", error)
      setIsHintLoading(false)
      setHint("Look at the word ending and apply German gender rules.")
      toast({
        title: "Hint Error",
        description: "Couldn't get a hint. Showing default hint instead.",
        variant: "destructive",
      })
    }
  }


  const handleNextWord = async () => {
    setShowHint(false);
    setHint(""); // Clear previous hint
    setLastAnswer(null);
    setIsLoading(true);
    setCurrentWord(null) // Clear current word while loading
    await append({
      role: "user",
      content: "Next word please",
    });
  };

  const startNewGame = () => {
    setMessages([])
    setStats({ correct: [], incorrect: [], hesitated: [] })
    gameStartedRef.current = false
    setGameStarted(true)
    setShowLevelComplete(false)
    setShowLevelFailed(false)
  }

  const restartLevel = () => {
    setLevelProgress((prev) => ({
      ...prev,
      [currentLevel]: { attempts: 0, correct: 0 },
    }))
    setShowLevelFailed(false)
    startNewGame()
  }

  // CHANGE: Added new function to move to the next level
  const moveToNextLevel = () => {
    setCurrentLevel((prev) => prev + 1)
    setLevelProgress((prev) => ({
      ...prev,
      [currentLevel + 1]: { attempts: 0, correct: 0 },
    }))
    setShowLevelComplete(false)
    startNewGame()
  }

  // const selectLevel = (levelId: number) => {
  //   if (levels.find((l) => l.id === levelId)?.unlocked) {
  //     setCurrentLevel(levelId)
  //     setLevelProgress((prev) => ({
  //       ...prev,
  //       [levelId]: prev[levelId] || { attempts: 0, correct: 0 },
  //     }))
  //     startNewGame()
  //   }
  // }
  const selectLevel = (levelId: number) => {
    if (levels.find((l) => l.id === levelId)?.unlocked) {
      setCurrentLevel(levelId)

      // Check if the level is already completed
      const isLevelCompleted = levels.find((l) => l.id === levelId)?.completed

      // If the level is completed, reset its progress
      if (isLevelCompleted) {
        setLevelProgress((prev) => ({
          ...prev,
          [levelId]: { attempts: 0, correct: 0 },
        }))
      } else {
        // Otherwise, keep existing progress or initialize new progress
        setLevelProgress((prev) => ({
          ...prev,
          [levelId]: prev[levelId] || { attempts: 0, correct: 0 },
        }))
      }

      setShowLevelComplete(false)
      setShowLevelFailed(false)
      startNewGame()
    }
  }

  // const claimGift = (levelId: number) => {
  //   // Mark gift as claimed
  //   setLevels((prevLevels) =>
  //     prevLevels.map((level) => {
  //       if (level.id === levelId) {
  //         return { ...level, giftClaimed: true }
  //       }
  //       return level
  //     }),
  //   )

  //   // In a real app, you would trigger the PDF download here
  //   // For this example, we'll just show a toast
  //   toast({
  //     title: "Gift Claimed!",
  //     description: `You've downloaded the Level ${levelId} completion certificate.`,
  //   })
  // }

  const handleStartChallenge = () => {
    // Check if user is logged in
    if (!userId) {
      setShowLoginModal(true)
    }
  }

  const claimGift = async (levelId: number) => {
    // Mark gift as claimed
    setLevels((prevLevels) =>
      prevLevels.map((level) => {
        if (level.id === levelId) {
          return { ...level, giftClaimed: true }
        }
        return level
      }),
    )

    try {
      // Trigger PDF download
      window.open(`/api/gifts/download?levelId=${levelId}`, "_blank")

      // Save the claim to the server if user is logged in
      if (userId) {
        await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            currentLevel,
            levels,
            levelProgress,
          }),
        })
      }

      toast({
        title: "Gift Claimed!",
        description: `Your Level ${levelId} certificate is being downloaded.`,
      })
    } catch (error) {
      console.error("Error claiming gift:", error)
      toast({
        title: "Download Error",
        description: "Failed to download your gift. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle successful login/registration
  const handleLoginSuccess = (newUserId: string, name?: string) => {
    setUserId(newUserId)
    if (name) setUserName(name);
    setShowLoginModal(false)
    setLoginReturningUserModal(false)

    // If this was for claiming a gift, proceed with the claim
    if (giftLevelId) {
      claimGift(giftLevelId)
      setGiftLevelId(null)
    }

    // Load user progress
    // loadUserProgress(newUserId)
  }

  // CHANGE: Added helper functions to get current level info
  const getCurrentLevelConfig = () => {
    return levels.find((l) => l.id === currentLevel) || levels[0]
  }

  const getCurrentLevelProgress = () => {
    return levelProgress[currentLevel] || { attempts: 0, correct: 0 }
  }

  return (
    <div className="flex justify-center text-center items-center">
      {showUserButton && (
        <div className="absolute top-4 right-4">
          {userId ? (
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10 bg-blue-100 hover:bg-blue-200">
              <span className="font-medium text-blue-800">
                {userName ? userName.charAt(0).toUpperCase() : userId.charAt(0).toUpperCase()}
              </span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setLoginReturningUserModal(true)}>
              {dict?.game.login}
            </Button>
          )}
        </div>
      )}
      {/* <div className="space-y-0 md:space-y-6 flex flex-col w-full justify-center text-center items-center"> */}
      <div className="justify-self-center overflow-hidden justify-center text-center items-center">
        <Card className=" border-none shadow-none">
          <CardContent>
            <>
              {error ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-red-500">{dict?.errors.genericError}</p>
                  <p>{dict?.errors.noInternet}</p>
                  <Button onClick={() => restartLevel()}>{dict?.game.tryAgain}</Button>
                </div>
              ) : showLevelComplete ? (
                /* CHANGE: Added level complete screen */
                <div className="space-y-6 py-8 text-center">
                  <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-green-700">{dict?.challenge.passedPreTest}</h3>
                  <p>
                    {dict?.game.greatJob
                      .replace("{correct}", getCurrentLevelProgress().correct.toString())
                      .replace("{required}", getCurrentLevelConfig().wordsRequired.toString())}
                  </p>
                  <div className="pt-4">
                    <Button onClick={() => handleStartChallenge()} className="bg-green-600 hover:bg-green-700">
                      {dict?.challenge.challenge} <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : showLevelFailed ? (
                /* CHANGE: Added level failed screen */
                <div className="space-y-6 py-8 text-center">
                  <h3 className="text-2xl font-bold text-red-600">{dict?.game.levelFailed}</h3>
                  <p>
                    {dict?.game.levelFailedDetails
                      .replace("{correct}", getCurrentLevelProgress().correct.toString())
                      .replace("{attempted}", getCurrentLevelConfig().wordsRequired.toString())
                      .replace("{required}", getCurrentLevelConfig().correctRequired.toString())}
                  </p>
                  <Button onClick={restartLevel} className="bg-blue-600 hover:bg-blue-700">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {dict?.game.tryAgain}
                  </Button>
                </div>
              ) : currentWord ? (
                <div className="space-y-8 mt-5">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (getCurrentLevelProgress().attempts / getCurrentLevelConfig().wordsRequired) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-gray-500 -mt-6 mb-4">
                    {getCurrentLevelProgress().attempts}/{getCurrentLevelConfig().wordsRequired} {dict?.game.words} •
                    {getCurrentLevelProgress().correct}/{getCurrentLevelProgress().attempts || 1}{" "}
                    {dict?.game.correctAnswers}
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-blue-800">{currentWord.word}</h3>
                    <p className="text-gray-600">({currentWord.translation})</p>
                  </div>

                  {lastAnswer === null ? (
                    <div className="space-y-4">
                      <p className="text-center font-medium">{dict?.game.whatIsGender}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant="outline"
                          className="text-lg py-6 border-2 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800 relative"
                          onClick={() => handleAnswer("der")}
                          disabled={isLoading}
                        >
                          der
                          {isLoading && selectedAnswer === "der" && (
                            <div className="absolute bottom-0 left-0 right-0 text-center">
                              <span className="inline-flex">
                                <span className="animate-bounce mr-1">.</span>
                                <span className="animate-bounce animation-delay-200 mr-1">.</span>
                                <span className="animate-bounce animation-delay-400">.</span>
                              </span>
                            </div>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-lg py-6 border-2 hover:bg-pink-50 hover:text-pink-800 hover:border-pink-800 relative"
                          onClick={() => handleAnswer("die")}
                          disabled={isLoading}
                        >
                          die
                          {isLoading && selectedAnswer === "die" && (
                            <div className="absolute bottom-0 left-0 right-0 text-center">
                              <span className="inline-flex">
                                <span className="animate-bounce mr-1">.</span>
                                <span className="animate-bounce animation-delay-200 mr-1">.</span>
                                <span className="animate-bounce animation-delay-400">.</span>
                              </span>
                            </div>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-lg py-6 border-2 hover:bg-green-50 hover:text-green-800 hover:border-green-800 relative"
                          onClick={() => handleAnswer("das")}
                          disabled={isLoading}
                        >
                          das
                          {isLoading && selectedAnswer === "das" && (
                            <div className="absolute bottom-0 left-0 right-0 text-center">
                              <span className="inline-flex">
                                <span className="animate-bounce mr-1">.</span>
                                <span className="animate-bounce animation-delay-200 mr-1">.</span>
                                <span className="animate-bounce animation-delay-400">.</span>
                              </span>
                            </div>
                          )}
                        </Button>
                      </div>

                      <div className="text-center mt-6">
                        <Button
                          variant="ghost"
                          onClick={handleHint}
                          disabled={isLoading || showHint || !currentWord}
                          className="text-amber-600"
                        >
                          <Lightbulb className="mr-2 h-4 w-4" />
                          {dict?.game.hint}
                        </Button>
                      </div>

                      {showHint && (
                        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                          <p className="text-amber-800 text-sm md:text-base">
                            {!hint ? (
                              <span className="inline-flex">
                                <span className="animate-bounce mr-1">.</span>
                                <span className="animate-bounce animation-delay-200 mr-1">.</span>
                                <span className="animate-bounce animation-delay-400">.</span>
                              </span>
                            ) : hint.startsWith("💡 Hint:") ? (
                              hint
                            ) : (
                              `💡 Hint: ${hint}`
                            )}
                          </p>
                        </div>
                      )}
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
                            ? "✅ Correct!"
                            : `❌ Wrong! The correct answer is "${correctAnswer}"`}
                        </p>
                        {hint && (
                          <p className="mt-2 text-sm">
                            <span className="font-medium">Hint:</span> {hint}
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
            </>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-green-50">
                <Trophy className="mr-1 h-3 w-3" />
                {stats.correct.length} {dict?.game.correct}
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                ❌ {stats.incorrect.length} {dict?.game.wrong}
              </Badge>
            </div>

            {/* <Button variant="outline" size="sm" onClick={startNewGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button> */}
          </CardFooter>
        </Card>
      </div>
      {/* </div> */}
      {/* User login modal */}
      <ChallengeUserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        isNewUser={true}
        challengeLevel={1}
        setActiveStep={setActiveStep}
      />
      <ChallengeUserLoginModal
        isOpen={showLoginReturningUserModal}
        onClose={() => setLoginReturningUserModal(false)}
        onSuccess={handleLoginSuccess}
        isNewUser={false}
        challengeLevel={1}
        setActiveStep={setActiveStep}
      />
    </div>
  )
  // return (
  //   <div className="flex justify-center text-center items-center">
  //       {showUserButton && (
  //         <div className="absolute top-4 right-4">
  //           {userId ? (
  //             <Button 
  //             variant="outline" 
  //             size="icon" 
  //             className="rounded-full w-10 h-10 bg-blue-100 hover:bg-blue-200"
  //           >
  //             <span className="font-medium text-blue-800">
  //               {userName ? userName.charAt(0).toUpperCase() : userId.charAt(0).toUpperCase()}
  //             </span>
  //           </Button>
  //           ) : (
  //             <Button 
  //               variant="outline" 
  //               size="sm"
  //               onClick={() => setLoginReturningUserModal(true)}
  //             >
  //               Login
  //             </Button>
  //           )}
  //         </div>
  //       )}
  //   {/* <div className="space-y-0 md:space-y-6 flex flex-col w-full justify-center text-center items-center"> */}
  //     <div className="justify-self-center overflow-hidden justify-center text-center items-center">
  //       <Card className=" border-none shadow-none">

  //         <CardContent>

  //             <>
  //               {error ? (
  //                 <div className="text-center py-8 space-y-4">
  //                   <p className="text-red-500">Something went wrong!</p>
  //                   <p>Please make sure you are connected to the internet</p>
  //                   <Button onClick={() => restartLevel()}>Try Again</Button>
  //                 </div>
  //               ) : showLevelComplete ? (
  //                 /* CHANGE: Added level complete screen */
  //                 <div className="space-y-6 py-8 text-center">
  //                   <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
  //                   <h3 className="text-2xl font-bold text-green-700">Great! You passed the Pre-test!</h3>
  //                   <p>
  //                     You got {getCurrentLevelProgress().correct} out of {getCurrentLevelConfig().wordsRequired} correct!
  //                   </p>
  //                   <div className="pt-4">
  //                     <Button onClick={() => handleStartChallenge()} className="bg-green-600 hover:bg-green-700">
  //                       Start Challenge <ChevronRight className="ml-2 h-4 w-4" />
  //                     </Button>
  //                   </div>
  //                 </div>
  //               ) : showLevelFailed ? (
  //                 /* CHANGE: Added level failed screen */
  //                 <div className="space-y-6 py-8 text-center">
  //                   <h3 className="text-2xl font-bold text-red-600">Oops! You didn't pass this level.</h3>
  //                   <p>
  //                     You got {getCurrentLevelProgress().correct} out of {getCurrentLevelConfig().wordsRequired} correct,
  //                     but you need at least {getCurrentLevelConfig().correctRequired} to pass.
  //                   </p>
  //                   <Button onClick={restartLevel} className="bg-blue-600 hover:bg-blue-700">
  //                     <RotateCcw className="mr-2 h-4 w-4" />
  //                     Try Again
  //                   </Button>
  //                 </div>
  //               )
                
  //               : currentWord ? (
  //                 <div className="space-y-8 mt-5">
  //                   <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
  //                     <div
  //                       className="bg-blue-600 h-2.5 rounded-full"
  //                       style={{
  //                         width: `${Math.min(100, (getCurrentLevelProgress().attempts / getCurrentLevelConfig().wordsRequired) * 100)}%`,
  //                       }}
  //                     ></div>
  //                   </div>
  //                   <div className="text-center text-sm text-gray-500 -mt-6 mb-4">
  //                     {getCurrentLevelProgress().attempts}/{getCurrentLevelConfig().wordsRequired} words •
  //                     {getCurrentLevelProgress().correct}/{getCurrentLevelProgress().attempts || 1} correct
  //                   </div>

  //                   <div className="text-center space-y-2">
  //                     <h3 className="text-2xl font-bold text-blue-800">{currentWord.word}</h3>
  //                     <p className="text-gray-600">({currentWord.translation})</p>
  //                   </div>

  //                   {lastAnswer === null ? (
  //                       <div className="space-y-4">
  //                         <p className="text-center font-medium">What is the gender?</p>
  //                         <div className="grid grid-cols-3 gap-3">
  //                           <Button
  //                             variant="outline"
  //                             className="text-lg py-6 border-2 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800 relative"
  //                             onClick={() => handleAnswer("der")}
  //                             disabled={isLoading}
  //                           >
  //                             der
  //                             {isLoading && selectedAnswer === "der" && (
  //                               <div className="absolute bottom-0 left-0 right-0 text-center">
  //                                 <span className="inline-flex">
  //                                   <span className="animate-bounce mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-400">.</span>
  //                                 </span>
  //                               </div>
  //                             )}
  //                           </Button>
  //                           <Button
  //                             variant="outline"
  //                             className="text-lg py-6 border-2 hover:bg-pink-50 hover:text-pink-800 hover:border-pink-800 relative"
  //                             onClick={() => handleAnswer("die")}
  //                             disabled={isLoading}
  //                           >
  //                             die
  //                             {isLoading && selectedAnswer === "die" && (
  //                               <div className="absolute bottom-0 left-0 right-0 text-center">
  //                                 <span className="inline-flex">
  //                                   <span className="animate-bounce mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-400">.</span>
  //                                 </span>
  //                               </div>
  //                             )}
  //                           </Button>
  //                           <Button
  //                             variant="outline"
  //                             className="text-lg py-6 border-2 hover:bg-green-50 hover:text-green-800 hover:border-green-800 relative"
  //                             onClick={() => handleAnswer("das")}
  //                             disabled={isLoading}
  //                           >
  //                             das
  //                             {isLoading && selectedAnswer === "das" && (
  //                               <div className="absolute bottom-0 left-0 right-0 text-center">
  //                                 <span className="inline-flex">
  //                                   <span className="animate-bounce mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-400">.</span>
  //                                 </span>
  //                               </div>
  //                             )}
  //                           </Button>
  //                         </div>

  //                         <div className="text-center mt-6">
  //                           <Button
  //                             variant="ghost"
  //                             onClick={handleHint}
  //                             disabled={isLoading || showHint || !currentWord}
  //                             className="text-amber-600"
  //                           >
  //                             <Lightbulb className="mr-2 h-4 w-4" />
  //                             Hint
  //                           </Button>
  //                         </div>

  //                         {showHint && (
  //                           <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
  //                             <p className="text-amber-800 text-sm md:text-base">
  //                               {!hint ? (
  //                                 <span className="inline-flex">
  //                                   <span className="animate-bounce mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-400">.</span>
  //                                 </span>
  //                               ) : hint.startsWith("💡 Hint:") ? (
  //                                 hint
  //                               ) : (
  //                                 `💡 Hint: ${hint}`
  //                               )}
  //                             </p>
  //                           </div>
  //                         )}
  //                       </div>
  //                     ) 
                    
  //                   : (
  //                     <div className="space-y-4">
  //                       <div
  //                         className={`p-4 rounded-md text-center ${
  //                           lastAnswer === "correct"
  //                             ? "bg-green-50 border border-green-200 text-green-800"
  //                             : "bg-red-50 border border-red-200 text-red-800"
  //                         }`}
  //                       >
  //                         <p className="text-sm md:text-lg font-medium">
  //                           {lastAnswer === "correct"
  //                             ? "✅ Correct!"
  //                             : `❌ Wrong! The correct answer is "${correctAnswer}"`}
  //                         </p>
  //                         {hint && (
  //                           <p className="mt-2 text-sm">
  //                             <span className="font-medium">Hint:</span> {hint}
  //                           </p>
  //                         )}
  //                       </div>

  //                       <div className="text-center mt-6">
  //                         <Button onClick={handleNextWord} disabled={isLoading}>
  //                           Next Word
  //                         </Button>
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>
  //               ) : (
  //                 <div className="flex justify-center items-center py-12">
  //                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
  //                 </div>
  //               )}
  //             </>
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

  //           {/* <Button variant="outline" size="sm" onClick={startNewGame}>
  //             <RotateCcw className="mr-2 h-4 w-4" />
  //             Restart
  //           </Button> */}
  //         </CardFooter>
  //       </Card>
  //     </div>
  //   {/* </div> */}
  //   {/* User login modal */}
  //   <ChallengeUserLoginModal
  //     isOpen={showLoginModal}
  //     onClose={() => setShowLoginModal(false)}
  //     onSuccess={handleLoginSuccess}
  //     isNewUser={true}
  //     challengeLevel={1}
  //     setActiveStep={setActiveStep}
  //   />
  //   <ChallengeUserLoginModal
  //     isOpen={showLoginReturningUserModal}
  //     onClose={() => setLoginReturningUserModal(false)}
  //     onSuccess={handleLoginSuccess}
  //     isNewUser={false}
  //     challengeLevel={1}
  //     setActiveStep={setActiveStep}
  //   />
  //   </div>
  // )
}

