"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Trophy, RotateCcw, Lock, Download, ChevronRight } from 'lucide-react'
import { useChat  } from "ai/react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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

export default function GenderGame() {
  const [currentWord, setCurrentWord] = useState<{ word: string; translation: string } | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [stats, setStats] = useState<WordStats>({ correct: [], incorrect: [], hesitated: [] })
  const [gameStarted, setGameStarted] = useState(false)
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
      correctRequired: 16,
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
  const [currentLevel, setCurrentLevel] = useLocalStorage<number>("gender-game-current-level", 1)
  const [levelProgress, setLevelProgress] = useLocalStorage<Record<number, { attempts: number; correct: number }>>(
    "gender-game-level-progress",
    {},
  )
  const [showLevelComplete, setShowLevelComplete] = useState(false)
  const [showLevelFailed, setShowLevelFailed] = useState(false)
  const levelSelectorRef = useRef<HTMLDivElement>(null);

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

  // In your component
const { messages, append, setMessages, error } = useChat({
  api: "/api/gender-game",
  id: "gender-game",
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

  const selectLevel = (levelId: number) => {
    if (levels.find((l) => l.id === levelId)?.unlocked) {
      setCurrentLevel(levelId)
      setLevelProgress((prev) => ({
        ...prev,
        [levelId]: prev[levelId] || { attempts: 0, correct: 0 },
      }))
      startNewGame()
    }
  }

  const claimGift = (levelId: number) => {
    // Mark gift as claimed
    setLevels((prevLevels) =>
      prevLevels.map((level) => {
        if (level.id === levelId) {
          return { ...level, giftClaimed: true }
        }
        return level
      }),
    )

    // In a real app, you would trigger the PDF download here
    // For this example, we'll just show a toast
    toast({
      title: "Gift Claimed!",
      description: `You've downloaded the Level ${levelId} completion certificate.`,
    })
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
    <div className="space-y-0 md:space-y-6 flex flex-col max-w-11/12 md:max-w-full justify-center text-center items-center">
      {gameStarted && (
        <div className="w-3/4 md:w-full mb-4 px-40 md:px-8"> 
          <ScrollArea className="whitespace-nowrap" ref={levelSelectorRef}>
            <div className="flex space-x-4 p-4">
              {levels.map((level) => (
                <div
                  key={level.id}
                  id={`level-${level.id}`}
                  onClick={() => level.unlocked && selectLevel(level.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all
                    ${
                      level.id === currentLevel
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
        <Card className="shadow-lg w-full max-w-80 md:max-w-full">
        {!gameStarted && <CardHeader>
            <CardTitle className="text-2xl text-center">German Noun Gender Game</CardTitle>
          </CardHeader>}

          <CardContent>
            {!gameStarted ? (
              <div className="text-center space-y-6 py-8">
                {/* <h3 className="text-xl font-medium">Learn German Noun Genders</h3> */}
                <p className="text-gray-600 text-center space-y-6 pt-2 pb-8 text-sm md:text-base">
              Practice identifying whether German nouns are masculine (der), feminine (die), or neuter (das).
            </p>
                <Button size="lg" onClick={() => setGameStarted(true)} className="mt-4">
                  Start Game
                </Button>
              </div>
            ) : (
              <>
                {error ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-red-500">Failed to connect to the AI service. {error?.toString()}</p>
                    <p>Make sure your OpenAI API key is set up correctly.</p>
                    <Button onClick={startNewGame}>Try Again</Button>
                  </div>
                ) : showLevelComplete ? (
                  /* CHANGE: Added level complete screen */
                  <div className="space-y-6 py-8 text-center">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-green-700">Great! You crushed this level!</h3>
                    <p>
                      You got {getCurrentLevelProgress().correct} out of {getCurrentLevelConfig().wordsRequired} correct!
                    </p>

                    {!getCurrentLevelConfig().giftClaimed && (
                      <Button
                        onClick={() => claimGift(currentLevel)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Claim Your Gift
                      </Button>
                    )}

                    <div className="pt-4">
                      <Button onClick={moveToNextLevel} className="bg-green-600 hover:bg-green-700">
                        Next Level <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : showLevelFailed ? (
                  /* CHANGE: Added level failed screen */
                  <div className="space-y-6 py-8 text-center">
                    <h3 className="text-2xl font-bold text-red-600">Oops! You didn't pass this level.</h3>
                    <p>
                      You got {getCurrentLevelProgress().correct} out of {getCurrentLevelConfig().wordsRequired} correct,
                      but you need at least {getCurrentLevelConfig().correctRequired} to pass.
                    </p>
                    <Button onClick={restartLevel} className="bg-blue-600 hover:bg-blue-700">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                )
                
                : currentWord ? (
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
                      {getCurrentLevelProgress().attempts}/{getCurrentLevelConfig().wordsRequired} words •
                      {getCurrentLevelProgress().correct}/{getCurrentLevelProgress().attempts || 1} correct
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-blue-800">{currentWord.word}</h3>
                      <p className="text-gray-600">({currentWord.translation})</p>
                    </div>

                    {lastAnswer === null ? (
                        <div className="space-y-4">
                          <p className="text-center font-medium">What is the gender?</p>
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
                              Hint
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
                      ) 
                    
                    : (
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
                            Next Word
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
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-green-50">
                <Trophy className="mr-1 h-3 w-3" />
                {stats.correct.length} correct
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                ❌ {stats.incorrect.length} wrong
              </Badge>
            </div>

            {/* <Button variant="outline" size="sm" onClick={startNewGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button> */}
          </CardFooter>
        </Card>
      </div>
    </div>
    </div>
  )
}

