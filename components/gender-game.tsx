"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Trophy, RotateCcw } from "lucide-react"
import { useChat  } from "ai/react"

type WordStats = {
  correct: string[]
  incorrect: string[]
  hesitated: string[]
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

  useEffect(() => {
    console.log(`selectedAnswer is : ${selectedAnswer}`)
  }, [selectedAnswer])
  // Add debug logging to help troubleshoot
  // const { messages, append, setMessages, error } = useChat({
  //   api: "/api/gender-game",
  //   id: "gender-game",
  //   onFinish: (message) => {
  //     console.log("AI response received:", message.content)
  //     setIsLoading(false)
  //     processAIResponse(message.content)
  //   },
  //   onError: (error) => {
  //     console.error("Chat error:", error)
  //     setIsLoading(false)
  //     toast({
  //       title: "Error",
  //       description: "Failed to communicate with the AI. Please try again.",
  //       variant: "destructive",
  //     })
  //   },
  // })

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

    const startGame = async () => {
      gameStartedRef.current = true
      setIsLoading(true)
      try {
        await append({
          role: "user",
          content: "Start the game and give me a new German noun to guess its gender.",
        })
      } catch (error) {
        console.error("Error starting game:", error)
        setIsLoading(false)
        toast({
          title: "Error",
          description: "Failed to start the game. Please try again.",
          variant: "destructive",
        })
      }
    }

    startGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted])

  // const processAIResponse = (content: string) => {
  //   console.log("AI Response Content:", content);
  
  //   // Extract the word and translation
  //   const wordMatch = content.match(/What is the gender of: "([^"]+)" \((.+)\)/);
  //   if (wordMatch && (!currentWord || currentWord.word !== wordMatch[1])) {
  //     console.log("Extracted Word:", wordMatch[1], "Translation:", wordMatch[2]);
  //     setCurrentWord({
  //       word: wordMatch[1],
  //       translation: wordMatch[2],
  //     });
  //   }
  
  //   // Extract hint if present
  //   const hintMatch = content.match(/Hint:([^!]+)/);
  //   if (hintMatch) {
  //     console.log("Extracted Hint:", hintMatch[1].trim());
  //     setHint(hintMatch[1].trim());
  //   }
  
  //   // Extract correct answer if present
  //   if (content.includes("Der ")) {
  //     setCorrectAnswer("der");
  //   } else if (content.includes("Die ")) {
  //     setCorrectAnswer("die");
  //   } else if (content.includes("Das ")) {
  //     setCorrectAnswer("das");
  //   }
  
  //   // Update stats based on feedback
  //   if (content.includes("✅ Correct!")) {
  //     setLastAnswer("correct");
  //     setStats((prev) => {
  //       if (currentWord && !prev.correct.includes(currentWord.word)) {
  //         return {
  //           ...prev,
  //           correct: [...prev.correct, currentWord.word],
  //         };
  //       }
  //       return prev;
  //     });
  //   } else if (content.includes("❌ Wrong!")) {
  //     setLastAnswer("incorrect");
  //     setStats((prev) => {
  //       if (currentWord && !prev.incorrect.includes(currentWord.word)) {
  //         return {
  //           ...prev,
  //           incorrect: [...prev.incorrect, currentWord.word],
  //         };
  //       }
  //       return prev;
  //     });
  //   }
  
  //   // If we have a new word but no answer yet, make sure we're in the question state
  //   if (wordMatch && !content.includes("✅ Correct!") && !content.includes("❌ Wrong!")) {
  //     setLastAnswer(null);
  //   }
  // };

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
    }
  
    setLastAnswer(updates.newLastAnswer || null);
  };

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

  // const handleHint = async () => {
  //   setShowHint(true)
  //   if (!stats.hesitated.includes(currentWord?.word || "")) {
  //     setStats((prev) => ({
  //       ...prev,
  //       hesitated: [...prev.hesitated, currentWord?.word || ""],
  //     }))
  //   }
  // }

  // Inside your component, add a new chat hook for hints
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

  // const handleNextWord = async () => {
  //   setShowHint(false)
  //   setLastAnswer(null)
  //   setIsLoading(true)

  //   await append({
  //     role: "user",
  //     content: "Next word please",
  //   })
  // }

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
  }

  return (
    <div className="space-y-0 md:space-y-6 flex justify-center text-center items-center overflow-hidden">
      <Card className="shadow-lg w-11/12 md:w-full">
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
              ) : currentWord ? (
                <div className="space-y-8 mt-5">
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

          <Button variant="outline" size="sm" onClick={startNewGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

