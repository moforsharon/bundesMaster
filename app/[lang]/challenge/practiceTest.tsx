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
import UserLoginModal from "@/components/user-login-modal"
import { useDictionary } from "@/hooks/use-dictionary"
import { i18n } from "@/i18n-config"
import { getCookie, setCookie } from "cookies-next"


type GenderWordStats = {
  correct: string[]
  incorrect: string[]
  hesitated: string[]
}

type GenderLevelConfig = {
  id: number
  name: string
  wordsRequired: number
  correctRequired: number
  completed: boolean
  unlocked: boolean
  giftClaimed: boolean
}

export default function PracticeGame() {
  const [currentGenderWord, setCurrentGenderWord] = useState<{ word: string; translation: string } | null>(null)
  const [showGenderHint, setShowGenderHint] = useState(false)
  const [genderStats, setGenderStats] = useState<GenderWordStats>({ correct: [], incorrect: [], hesitated: [] })
  const [genderGameStarted, setGenderGameStarted] = useState(true)
  const [isGenderLoading, setIsGenderLoading] = useState(false)
  const [isGenderHintLoading, setIsGenderHintLoading] = useState(false)
  const [genderHint, setGenderHint] = useState("")
  const [genderCorrectAnswer, setGenderCorrectAnswer] = useState("")
  const [lastGenderAnswer, setLastGenderAnswer] = useState<"correct" | "incorrect" | null>(null)
  const { toast } = useToast()
  const [selectedGenderAnswer, setSelectedGenderAnswer] = useState<string | null>(null)
  const [genderLevels, setGenderLevels] = useLocalStorage<GenderLevelConfig[]>("gender-game-levels", [
    {
      id: 1,
      name: "Level 1",
      wordsRequired: 10,
      correctRequired: 8,
      completed: false,
      unlocked: true,
      giftClaimed: false,
    },
    {
      id: 2,
      name: "Level 2",
      wordsRequired: 20,
      correctRequired: 18,
      completed: false,
      unlocked: false,
      giftClaimed: false,
    },
    {
      id: 3,
      name: "Level 3",
      wordsRequired: 30,
      correctRequired: 25,
      completed: false,
      unlocked: false,
      giftClaimed: false,
    },
    {
      id: 4,
      name: "Level 4",
      wordsRequired: 40,
      correctRequired: 35,
      completed: false,
      unlocked: false,
      giftClaimed: false,
    },
    {
      id: 5,
      name: "Level 5",
      wordsRequired: 50,
      correctRequired: 45,
      completed: false,
      unlocked: false,
      giftClaimed: false,
    },
  ])
  const [currentGenderLevel, setCurrentGenderLevel] = useLocalStorage<number>("gender-game-current-level", 1)
  const [genderLevelProgress, setGenderLevelProgress] = useLocalStorage<Record<number, { attempts: number; correct: number }>>(
    "gender-game-level-progress",
    {},
  )
  const [showGenderLevelComplete, setShowGenderLevelComplete] = useState(false)
  const [showGenderLevelFailed, setShowGenderLevelFailed] = useState(false)
  const genderLevelSelectorRef = useRef<HTMLDivElement>(null);

  // User login modal state (keeping these the same)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLoginReturningUserModal, setLoginReturningUserModal] = useState(false)
  const [userId, setUserId] = useLocalStorage<string | null>("userId", null)
  const [giftLevelId, setGiftLevelId] = useState<number | null>(null)
  const [showUserButton, setShowUserButton] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const { dict } = useDictionary()

  const [currentLocale, setCurrentLocale] = useState<string>("fr")

  useEffect(() => {
    const locale = (getCookie("NEXT_LOCALE") as string) || i18n.defaultLocale
    setCurrentLocale(locale)
  }, [currentLocale])

  
  // Check for existing user on mount (keeping this the same)
  useEffect(() => {
    const checkExistingUser = async () => {
      const storedUserId = localStorage.getItem("userId")
      const existingName = localStorage.getItem("userName")

      if (storedUserId) {
        setUserId(storedUserId)
        setUserName(existingName)
        // await loadUserProgress(storedUserId)
      } 
    }

    checkExistingUser()
  }, [genderGameStarted, setUserId, setUserName])

  // Load user progress from server (keeping this the same)
  const loadUserProgress = async (userId: string) => {
    try {
      const response = await fetch(`/api/progress?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to load progress")
      }

      const data = await response.json()

      if (data.progress) {
        setCurrentGenderLevel(data.progress.currentLevel)
        setGenderLevels(data.progress.levels)
        setGenderLevelProgress(data.progress.levelProgress)

        toast({
          title: "Progress loaded",
          description: "Your saved progress has been loaded.",
        })
      }
    } catch (error) {
      console.error("Error loading progress:", error)
    }
  }

  // Save user progress to server (keeping this the same)
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
          currentLevel: currentGenderLevel,
          levels: genderLevels,
          levelProgress: genderLevelProgress,
        }),
      })
    } catch (error) {
      console.error("Error saving progress:", error)
    }
  }

  useEffect(() => {
    if (!genderLevelSelectorRef.current || !genderGameStarted) return;
  
    const scrollContainer = genderLevelSelectorRef.current;
    const currentLevelElement = document.getElementById(`level-${currentGenderLevel}`);
    
    if (!currentLevelElement) return;
  
    // Calculate scroll position
    const containerWidth = scrollContainer.clientWidth;
    const elementOffset = currentLevelElement.offsetLeft;
    const elementWidth = currentLevelElement.offsetWidth;
    
    // Calculate the center position
    const scrollPosition = elementOffset - (containerWidth / 2) + (elementWidth / 2);
  
    const scroll = () => {
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    };
  
    if ('scrollBehavior' in document.documentElement.style) {
      scroll();
    } else {
      scrollContainer.scrollLeft = scrollPosition;
    }
  
  }, [currentGenderLevel, genderGameStarted, genderLevels]);

  useEffect(() => {
    console.log(`selectedGenderAnswer is : ${selectedGenderAnswer}`)
  }, [selectedGenderAnswer])

  // Save progress whenever it changes
  useEffect(() => {
    if (userId && genderGameStarted) {
      // saveUserProgress()
    }
  }, [genderLevels, currentGenderLevel, genderLevelProgress, userId, genderGameStarted])

  const { messages: genderMessages, append: genderAppend, setMessages: setGenderMessages, error: genderError } = useChat({
    api: "/api/gender-game",
    id: "gender-game",
    body: {  // Add this body parameter
      locale: currentLocale
    },
    onFinish: (message) => {
      console.log("AI response received:", message.content);
      setIsGenderLoading(false);
      processGenderAIResponse(message.content);
    },
    onError: (error) => {
      console.error("Detailed Chat Error:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause,
        timestamp: new Date().toISOString()
      });

      setIsGenderLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to communicate with the AI. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startGenderGame = async () => {
    genderGameStartedRef.current = true;
    setIsGenderLoading(true);
    setShowUserButton(true);
    
    try {
      console.log("Starting game...");
      const response = await genderAppend({
        role: "user",
        content: "Start the game and give me a new German noun to guess its gender.",
      });

      console.log("Append response:", response);
    } catch (error) {
      console.error("Detailed Start Game Error:", {
        error: error instanceof Error ? error : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      setIsGenderLoading(false);
      toast({
        title: "Start Game Error",
        description: error instanceof Error ? error.message : "Failed to start the game",
        variant: "destructive",
      });
    }
  };

  const genderGameStartedRef = useRef(false)

  useEffect(() => {
    if (!genderGameStarted || genderGameStartedRef.current) return
    startGenderGame()
  }, [genderGameStarted])

  const processGenderAIResponse = (content: string) => {
    console.log("AI Response Content:", content);
  
    const updates: {
      newWord?: { word: string; translation: string };
      newHint?: string;
      newCorrectAnswer?: string;
      newLastAnswer?: "correct" | "incorrect" | null;
    } = {};
  
    const wordMatch = content.match(/What is the gender of: "([^"]+)" \((.+)\)/);
    if (wordMatch && (!currentGenderWord || currentGenderWord.word !== wordMatch[1])) {
      updates.newWord = {
        word: wordMatch[1],
        translation: wordMatch[2],
      };
    }
  
    const hintMatch = content.match(/Hint:([^!]+)/);
    if (hintMatch) {
      updates.newHint = hintMatch[1].trim();
    }
  
    if (content.includes("Der ")) {
      updates.newCorrectAnswer = "der";
    } else if (content.includes("Die ")) {
      updates.newCorrectAnswer = "die";
    } else if (content.includes("Das ")) {
      updates.newCorrectAnswer = "das";
    }
  
    setCurrentGenderWord(prev => updates.newWord || prev);
    setGenderHint(updates.newHint || "");
    setGenderCorrectAnswer(updates.newCorrectAnswer || "");
  
    if (content.includes("✅ Correct!")) {
      updates.newLastAnswer = "correct";
      setGenderStats((prev) => {
        if (currentGenderWord && !prev.correct.includes(currentGenderWord.word)) {
          return {
            ...prev,
            correct: [...prev.correct, currentGenderWord.word],
          };
        }
        return prev;
      });

      updateGenderLevelProgress(true)
    } else if (content.includes("❌ Wrong!")) {
      updates.newLastAnswer = "incorrect";
      setGenderStats((prev) => {
        if (currentGenderWord && !prev.incorrect.includes(currentGenderWord.word)) {
          return {
            ...prev,
            incorrect: [...prev.incorrect, currentGenderWord.word],
          };
        }
        return prev;
      });
      updateGenderLevelProgress(false)
    }
  
    setLastGenderAnswer(updates.newLastAnswer || null);
  };

  const updateGenderLevelProgress = (isCorrect: boolean) => {
    setGenderLevelProgress((prev) => {
      const currentLevelProgress = prev[currentGenderLevel] || { attempts: 0, correct: 0 }
      const updatedProgress = {
        ...prev,
        [currentGenderLevel]: {
          attempts: currentLevelProgress.attempts + 1,
          correct: isCorrect ? currentLevelProgress.correct + 1 : currentLevelProgress.correct,
        },
      }

      const levelConfig = genderLevels.find((l) => l.id === currentGenderLevel)
      if (levelConfig) {
        if (updatedProgress[currentGenderLevel].attempts >= levelConfig.wordsRequired) {
          if (updatedProgress[currentGenderLevel].correct >= levelConfig.correctRequired) {
            setGenderLevels((prevLevels) =>
              prevLevels.map((level) => {
                if (level.id === currentGenderLevel) {
                  return { ...level, completed: true }
                } else if (level.id === currentGenderLevel + 1) {
                  return { ...level, unlocked: true }
                }
                return level
              }),
            )
            setShowGenderLevelComplete(true)
          } else {
            setShowGenderLevelFailed(true)
          }
        }
      }

      return updatedProgress
    })
  }

  const handleGenderAnswer = async (answer: string) => {
    if (isGenderLoading || !currentGenderWord) return

    setShowGenderHint(false)
    setIsGenderLoading(true)
    setSelectedGenderAnswer(answer)

    await genderAppend({
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
      setGenderHint(hintContent)
      setIsGenderHintLoading(false)
    },
    onError: (error) => {
      console.error("Hint error:", error)
      setIsGenderHintLoading(false)
      setGenderHint("Look at the word ending and apply German gender rules.")
      toast({
        title: "Hint Error",
        description: "Couldn't get a hint. Showing default hint instead.",
        variant: "destructive",
      })
    },
  })

  const handleGenderHint = async () => {
    if (!currentGenderWord || isGenderLoading) return

    setShowGenderHint(true)
    setIsGenderHintLoading(true)

    setGenderStats((prev) => {
      if (!prev.hesitated.includes(currentGenderWord.word)) {
        return {
          ...prev,
          hesitated: [...prev.hesitated, currentGenderWord.word],
        }
      }
      return prev
    })

    console.log("Requesting hint for word:", currentGenderWord.word)

    try {
      await hintAppend({
        role: "user",
        content: currentGenderWord.word,
      })
    } catch (error) {
      console.error("Error requesting hint:", error)
      setIsGenderHintLoading(false)
      setGenderHint("Look at the word ending and apply German gender rules.")
      toast({
        title: "Hint Error",
        description: "Couldn't get a hint. Showing default hint instead.",
        variant: "destructive",
      })
    }
  }

  const handleNextGenderWord = async () => {
    setShowGenderHint(false);
    setGenderHint("");
    setLastGenderAnswer(null);
    setIsGenderLoading(true);
    setCurrentGenderWord(null)
    await genderAppend({
      role: "user",
      content: "Next word please",
    });
  };

  const startNewGenderGame = () => {
    setGenderMessages([])
    setGenderStats({ correct: [], incorrect: [], hesitated: [] })
    genderGameStartedRef.current = false
    setGenderGameStarted(true)
    setShowGenderLevelComplete(false)
    setShowGenderLevelFailed(false)
  }

  const restartGenderLevel = () => {
    setGenderLevelProgress((prev) => ({
      ...prev,
      [currentGenderLevel]: { attempts: 0, correct: 0 },
    }))
    setShowGenderLevelFailed(false)
    startNewGenderGame()
  }

  const moveToNextGenderLevel = () => {
    setCurrentGenderLevel((prev) => prev + 1)
    setGenderLevelProgress((prev) => ({
      ...prev,
      [currentGenderLevel + 1]: { attempts: 0, correct: 0 },
    }))
    setShowGenderLevelComplete(false)
    startNewGenderGame()
  }

  const selectGenderLevel = (levelId: number) => {
    if (genderLevels.find((l) => l.id === levelId)?.unlocked) {
      setCurrentGenderLevel(levelId)

      const isLevelCompleted = genderLevels.find((l) => l.id === levelId)?.completed

      if (isLevelCompleted) {
        setGenderLevelProgress((prev) => ({
          ...prev,
          [levelId]: { attempts: 0, correct: 0 },
        }))
      } else {
        setGenderLevelProgress((prev) => ({
          ...prev,
          [levelId]: prev[levelId] || { attempts: 0, correct: 0 },
        }))
      }

      setShowGenderLevelComplete(false)
      setShowGenderLevelFailed(false)
      startNewGenderGame()
    }
  }

  const handleClaimGift = (levelId: number) => {
    if (!userId) {
      setGiftLevelId(levelId)
      setShowLoginModal(true)
    } else {
      claimGift(levelId)
    }
  }

  const claimGift = async (levelId: number) => {
    setGenderLevels((prevLevels) =>
      prevLevels.map((level) => {
        if (level.id === levelId) {
          return { ...level, giftClaimed: true }
        }
        return level
      }),
    )

    try {
      window.open(`/api/gifts/download?levelId=${levelId}`, "_blank")

      if (userId) {
        await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            currentLevel: currentGenderLevel,
            levels: genderLevels,
            levelProgress: genderLevelProgress,
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

  // Keeping these the same
  const handleLoginSuccess = (newUserId: string, name?: string) => {
    setUserId(newUserId)
    if (name) setUserName(name);
    setShowLoginModal(false)
    setLoginReturningUserModal(false)

    if (giftLevelId) {
      claimGift(giftLevelId)
      setGiftLevelId(null)
    }

    // loadUserProgress(newUserId)
  }

  const getCurrentGenderLevelConfig = () => {
    return genderLevels.find((l) => l.id === currentGenderLevel) || genderLevels[0]
  }

  const getCurrentGenderLevelProgress = () => {
    return genderLevelProgress[currentGenderLevel] || { attempts: 0, correct: 0 }
  }

  useEffect(() => {
    console.log("Levels data:", genderLevels);
    console.log("Game started:", genderGameStarted);
    console.log("Current level:", currentGenderLevel);
  }, [genderLevels, genderGameStarted, currentGenderLevel]);


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
      <div className="space-y-0 md:space-y-6 flex flex-col w-full justify-center text-center items-center">
        {genderGameStarted && (
          <div className="w-3/4 md:w-full mb-4 px-40 md:px-8">
            <ScrollArea className="whitespace-nowrap w-full" ref={genderLevelSelectorRef}>
              <div className="flex space-x-4 p-4 w-max">
                {" "}
                {/* Added w-max */}
                {genderLevels.map((level) => (
                  // {genderLevels.map((level) => (
                  <div
                    key={level.id}
                    id={`level-${level.id}`}
                    onClick={() => level.unlocked && selectGenderLevel(level.id)}
                    className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all
                    ${
                      level.id === currentGenderLevel
                        ? "bg-primary text-primary-foreground font-bold scale-110"
                        : level.unlocked
                          ? "bg-secondary hover:bg-secondary/80"
                          : "bg-muted text-muted-foreground"
                    }
                    ${level.completed ? "border-2 border-green-500" : ""}
                  `}
                  >
                    <span>{level.name}</span>
                    {!level.unlocked && <Lock className="h-4 w-4" />}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
        <div className="justify-self-center overflow-hidden justify-center text-center items-center">
          <Card className="w-full shadow-none border-none">
            {/* {!genderGameStarted && <CardHeader>
            <CardTitle className="text-2xl text-center">German Noun Gender Game</CardTitle>
          </CardHeader>} */}

            <CardContent>
              {/* {!genderGameStarted ? (
              <div className="text-center space-y-6 py-8">
                <p className="text-gray-600 text-center space-y-6 pt-2 pb-8 text-sm md:text-base">
              Practice identifying whether German nouns are masculine (der), feminine (die), or neuter (das).
            </p>
                <Button size="lg" onClick={() => setGenderGameStarted(true)} className="mt-4">
                  Start Game
                </Button>
              </div>
            ) : ( */}
              <>
                {genderError ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-red-500">{dict?.errors.genericError}</p>
                    <p>{dict?.errors.noInternet}</p>
                    <Button onClick={() => restartGenderLevel()}>{dict?.game.tryAgain}</Button>
                  </div>
                ) : showGenderLevelComplete ? (
                  <div className="space-y-6 py-8 text-center">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-green-700">{dict?.game.levelComplete}</h3>
                    <p>
                      {dict?.game.greatJob
                        .replace("{correct}", getCurrentGenderLevelProgress().correct.toString())
                        .replace("{required}", getCurrentGenderLevelConfig().wordsRequired.toString())}
                    </p>

                    {!getCurrentGenderLevelConfig().giftClaimed && (
                      <Button
                        onClick={() => handleClaimGift(currentGenderLevel)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {dict?.game.claimGift}
                      </Button>
                    )}

                    <div className="pt-4">
                      <Button onClick={moveToNextGenderLevel} className="bg-green-600 hover:bg-green-700">
                        {dict?.game.nextLevel} <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : showGenderLevelFailed ? (
                  <div className="space-y-6 py-8 text-center">
                    <h3 className="text-2xl font-bold text-red-600">{dict?.game.levelFailed}</h3>
                    <p>
                      {dict?.game.levelFailedDetails
                        .replace("{correct}", getCurrentGenderLevelProgress().correct.toString())
                        .replace("{attempted}", getCurrentGenderLevelConfig().wordsRequired.toString())
                        .replace("{required}", getCurrentGenderLevelConfig().correctRequired.toString())}
                    </p>
                    <Button onClick={restartGenderLevel} className="bg-blue-600 hover:bg-blue-700">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {dict?.game.tryAgain}
                    </Button>
                  </div>
                ) : currentGenderWord ? (
                  <div className="space-y-8 mt-5">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (getCurrentGenderLevelProgress().attempts / getCurrentGenderLevelConfig().wordsRequired) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-500 -mt-6 mb-4">
                      {getCurrentGenderLevelProgress().attempts}/{getCurrentGenderLevelConfig().wordsRequired}{" "}
                      {dict?.game.words} •{getCurrentGenderLevelProgress().correct}/
                      {getCurrentGenderLevelProgress().attempts || 1} {dict?.game.correctAnswers}
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-blue-800">{currentGenderWord.word}</h3>
                      <p className="text-gray-600">({currentGenderWord.translation})</p>
                    </div>

                    {lastGenderAnswer === null ? (
                      <div className="space-y-4">
                        <p className="text-center font-medium">{dict?.game.whatIsGender}</p>
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant="outline"
                            className="text-lg py-6 border-2 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800 relative"
                            onClick={() => handleGenderAnswer("der")}
                            disabled={isGenderLoading}
                          >
                            der
                            {isGenderLoading && selectedGenderAnswer === "der" && (
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
                            onClick={() => handleGenderAnswer("die")}
                            disabled={isGenderLoading}
                          >
                            die
                            {isGenderLoading && selectedGenderAnswer === "die" && (
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
                            onClick={() => handleGenderAnswer("das")}
                            disabled={isGenderLoading}
                          >
                            das
                            {isGenderLoading && selectedGenderAnswer === "das" && (
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
                            onClick={handleGenderHint}
                            disabled={isGenderLoading || showGenderHint || !currentGenderWord}
                            className="text-amber-600"
                          >
                            <Lightbulb className="mr-2 h-4 w-4" />
                            {dict?.game.hint}
                          </Button>
                        </div>

                        {showGenderHint && (
                          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                            <p className="text-amber-800 text-sm md:text-base">
                              {!genderHint ? (
                                <span className="inline-flex">
                                  <span className="animate-bounce mr-1">.</span>
                                  <span className="animate-bounce animation-delay-200 mr-1">.</span>
                                  <span className="animate-bounce animation-delay-400">.</span>
                                </span>
                              ) : genderHint.startsWith("💡 Hint:") ? (
                                genderHint
                              ) : (
                                `💡 ${dict?.game.hint}: ${genderHint}`
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div
                          className={`p-4 rounded-md ${
                            lastGenderAnswer === "correct"
                              ? "bg-green-50 border border-green-200 text-green-800"
                              : "bg-red-50 border border-red-200 text-red-800"
                          }`}
                        >
                          <p className="text-sm md:text-lg font-medium">
                            {lastGenderAnswer === "correct"
                              ? `✅ ${dict?.game.correct}!`
                              : `❌ ${dict?.game.wrong}! The correct answer is "${genderCorrectAnswer}"`}
                          </p>
                          {genderHint && (
                            <p className="mt-2 text-sm">
                              <span className="font-medium">{dict?.game.hint}:</span> {genderHint}
                            </p>
                          )}
                        </div>

                        <div className="text-center mt-6">
                          <Button onClick={handleNextGenderWord} disabled={isGenderLoading}>
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
              {/* )} */}
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-green-50">
                  <Trophy className="mr-1 h-3 w-3" />
                  {genderStats.correct.length} {dict?.game.correct}
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  ❌ {genderStats.incorrect.length} {dict?.game.wrong}
                </Badge>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      {/* User login modal */}
      {/* <UserLoginModal
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={handleLoginSuccess}
      isNewUser={true}
      levelId={giftLevelId || 0}
      gameStats={{ levels: genderLevels, currentLevel: currentGenderLevel, levelProgress: genderLevelProgress }}
    />
    <UserLoginModal
      isOpen={showLoginReturningUserModal}
      onClose={() => setLoginReturningUserModal(false)}
      onSuccess={handleLoginSuccess}
      isNewUser={false}
      levelId={giftLevelId || 0}
      gameStats={{ levels: genderLevels, currentLevel: currentGenderLevel, levelProgress: genderLevelProgress }}
    /> */}
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
  //   <div className="space-y-0 md:space-y-6 flex flex-col w-full justify-center text-center items-center">
  //     {genderGameStarted && (
  //       <div className="w-3/4 md:w-full mb-4 px-40 md:px-8"> 
  //         <ScrollArea className="whitespace-nowrap w-full" ref={genderLevelSelectorRef}>
  //           <div className="flex space-x-4 p-4 w-max">  {/* Added w-max */}
  //             {genderLevels.map((level) => (
  //             // {genderLevels.map((level) => (
  //               <div
  //                 key={level.id}
  //                 id={`level-${level.id}`}
  //                 onClick={() => level.unlocked && selectGenderLevel(level.id)}
  //                 className={`
  //                   flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all
  //                   ${
  //                     level.id === currentGenderLevel
  //                       ? "bg-primary text-primary-foreground font-bold scale-110"
  //                       : level.unlocked
  //                         ? "bg-secondary hover:bg-secondary/80"
  //                         : "bg-muted text-muted-foreground"
  //                   }
  //                   ${level.completed ? "border-2 border-green-500" : ""}
  //                 `}
  //               >
  //                 <span>{level.name}</span>
  //                 {!level.unlocked && <Lock className="h-4 w-4" />}
  //               </div>
  //             ))}
  //           </div>
  //           <ScrollBar orientation="horizontal" />
  //         </ScrollArea>
  //       </div>
  //     )}
  //     <div className="justify-self-center overflow-hidden justify-center text-center items-center">
  //       <Card className="w-full shadow-none border-none">
  //       {/* {!genderGameStarted && <CardHeader>
  //           <CardTitle className="text-2xl text-center">German Noun Gender Game</CardTitle>
  //         </CardHeader>} */}

  //         <CardContent>
  //           {/* {!genderGameStarted ? (
  //             <div className="text-center space-y-6 py-8">
  //               <p className="text-gray-600 text-center space-y-6 pt-2 pb-8 text-sm md:text-base">
  //             Practice identifying whether German nouns are masculine (der), feminine (die), or neuter (das).
  //           </p>
  //               <Button size="lg" onClick={() => setGenderGameStarted(true)} className="mt-4">
  //                 Start Game
  //               </Button>
  //             </div>
  //           ) : ( */}
  //             <>
  //               {genderError ? (
  //                 <div className="text-center py-8 space-y-4">
  //                   <p className="text-red-500">Something went wrong!</p>
  //                   <p>Please make sure you are connected to the internet</p>
  //                   <Button onClick={() => restartGenderLevel()}>Try Again</Button>
  //                 </div>
  //               ) : showGenderLevelComplete ? (
  //                 <div className="space-y-6 py-8 text-center">
  //                   <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
  //                   <h3 className="text-2xl font-bold text-green-700">Great! You crushed this level!</h3>
  //                   <p>
  //                     You got {getCurrentGenderLevelProgress().correct} out of {getCurrentGenderLevelConfig().wordsRequired} correct!
  //                   </p>

  //                   {!getCurrentGenderLevelConfig().giftClaimed && (
  //                     <Button
  //                     onClick={() => handleClaimGift(currentGenderLevel)}
  //                       className="bg-yellow-500 hover:bg-yellow-600 text-white"
  //                     >
  //                       <Download className="mr-2 h-4 w-4" />
  //                       Claim Your Gift
  //                     </Button>
  //                   )}

  //                   <div className="pt-4">
  //                     <Button onClick={moveToNextGenderLevel} className="bg-green-600 hover:bg-green-700">
  //                       Next Level <ChevronRight className="ml-2 h-4 w-4" />
  //                     </Button>
  //                   </div>
  //                 </div>
  //               ) : showGenderLevelFailed ? (
  //                 <div className="space-y-6 py-8 text-center">
  //                   <h3 className="text-2xl font-bold text-red-600">Oops! You didn't pass this level.</h3>
  //                   <p>
  //                     You got {getCurrentGenderLevelProgress().correct} out of {getCurrentGenderLevelConfig().wordsRequired} correct,
  //                     but you need at least {getCurrentGenderLevelConfig().correctRequired} to pass.
  //                   </p>
  //                   <Button onClick={restartGenderLevel} className="bg-blue-600 hover:bg-blue-700">
  //                     <RotateCcw className="mr-2 h-4 w-4" />
  //                     Try Again
  //                   </Button>
  //                 </div>
  //               )
                
  //               : currentGenderWord ? (
  //                 <div className="space-y-8 mt-5">
  //                   <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
  //                     <div
  //                       className="bg-blue-600 h-2.5 rounded-full"
  //                       style={{
  //                         width: `${Math.min(100, (getCurrentGenderLevelProgress().attempts / getCurrentGenderLevelConfig().wordsRequired) * 100)}%`,
  //                       }}
  //                     ></div>
  //                   </div>
  //                   <div className="text-center text-sm text-gray-500 -mt-6 mb-4">
  //                     {getCurrentGenderLevelProgress().attempts}/{getCurrentGenderLevelConfig().wordsRequired} words •
  //                     {getCurrentGenderLevelProgress().correct}/{getCurrentGenderLevelProgress().attempts || 1} correct
  //                   </div>

  //                   <div className="text-center space-y-2">
  //                     <h3 className="text-2xl font-bold text-blue-800">{currentGenderWord.word}</h3>
  //                     <p className="text-gray-600">({currentGenderWord.translation})</p>
  //                   </div>

  //                   {lastGenderAnswer === null ? (
  //                       <div className="space-y-4">
  //                         <p className="text-center font-medium">What is the gender?</p>
  //                         <div className="grid grid-cols-3 gap-3">
  //                           <Button
  //                             variant="outline"
  //                             className="text-lg py-6 border-2 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800 relative"
  //                             onClick={() => handleGenderAnswer("der")}
  //                             disabled={isGenderLoading}
  //                           >
  //                             der
  //                             {isGenderLoading && selectedGenderAnswer === "der" && (
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
  //                             onClick={() => handleGenderAnswer("die")}
  //                             disabled={isGenderLoading}
  //                           >
  //                             die
  //                             {isGenderLoading && selectedGenderAnswer === "die" && (
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
  //                             onClick={() => handleGenderAnswer("das")}
  //                             disabled={isGenderLoading}
  //                           >
  //                             das
  //                             {isGenderLoading && selectedGenderAnswer === "das" && (
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
  //                             onClick={handleGenderHint}
  //                             disabled={isGenderLoading || showGenderHint || !currentGenderWord}
  //                             className="text-amber-600"
  //                           >
  //                             <Lightbulb className="mr-2 h-4 w-4" />
  //                             Hint
  //                           </Button>
  //                         </div>

  //                         {showGenderHint && (
  //                           <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
  //                             <p className="text-amber-800 text-sm md:text-base">
  //                               {!genderHint ? (
  //                                 <span className="inline-flex">
  //                                   <span className="animate-bounce mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-200 mr-1">.</span>
  //                                   <span className="animate-bounce animation-delay-400">.</span>
  //                                 </span>
  //                               ) : genderHint.startsWith("💡 Hint:") ? (
  //                                 genderHint
  //                               ) : (
  //                                 `💡 Hint: ${genderHint}`
  //                               )}
  //                             </p>
  //                           </div>
  //                         )}
  //                       </div>
  //                     ) 
                    
  //                   : (
  //                     <div className="space-y-4">
  //                       <div
  //                         className={`p-4 rounded-md ${
  //                           lastGenderAnswer === "correct"
  //                             ? "bg-green-50 border border-green-200 text-green-800"
  //                             : "bg-red-50 border border-red-200 text-red-800"
  //                         }`}
  //                       >
  //                         <p className="text-sm md:text-lg font-medium">
  //                           {lastGenderAnswer === "correct"
  //                             ? "✅ Correct!"
  //                             : `❌ Wrong! The correct answer is "${genderCorrectAnswer}"`}
  //                         </p>
  //                         {genderHint && (
  //                           <p className="mt-2 text-sm">
  //                             <span className="font-medium">Hint:</span> {genderHint}
  //                           </p>
  //                         )}
  //                       </div>

  //                       <div className="text-center mt-6">
  //                         <Button onClick={handleNextGenderWord} disabled={isGenderLoading}>
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
  //           {/* )} */}
  //         </CardContent>

  //         <CardFooter className="flex justify-between border-t pt-4">
  //           <div className="flex space-x-2">
  //             <Badge variant="outline" className="bg-green-50">
  //               <Trophy className="mr-1 h-3 w-3" />
  //               {genderStats.correct.length} correct
  //             </Badge>
  //             <Badge variant="outline" className="bg-red-50">
  //               ❌ {genderStats.incorrect.length} wrong
  //             </Badge>
  //           </div>
  //         </CardFooter>
  //       </Card>
  //     </div>
  //   </div>
  //   {/* User login modal */}
  //   {/* <UserLoginModal
  //     isOpen={showLoginModal}
  //     onClose={() => setShowLoginModal(false)}
  //     onSuccess={handleLoginSuccess}
  //     isNewUser={true}
  //     levelId={giftLevelId || 0}
  //     gameStats={{ levels: genderLevels, currentLevel: currentGenderLevel, levelProgress: genderLevelProgress }}
  //   />
  //   <UserLoginModal
  //     isOpen={showLoginReturningUserModal}
  //     onClose={() => setLoginReturningUserModal(false)}
  //     onSuccess={handleLoginSuccess}
  //     isNewUser={false}
  //     levelId={giftLevelId || 0}
  //     gameStats={{ levels: genderLevels, currentLevel: currentGenderLevel, levelProgress: genderLevelProgress }}
  //   /> */}
  //   </div>
  // )
}