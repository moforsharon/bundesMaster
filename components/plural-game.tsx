"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Trophy, RotateCcw } from "lucide-react"
import { useChat } from "ai/react"

type WordStats = {
  correct: string[]
  incorrect: string[]
  hesitated: string[]
}

export default function PluralGame() {
  const [currentWord, setCurrentWord] = useState<{ word: string; translation: string } | null>(null)
  const [userInput, setUserInput] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [stats, setStats] = useState<WordStats>({ correct: [], incorrect: [], hesitated: [] })
  const [gameStarted, setGameStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hint, setHint] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [lastAnswer, setLastAnswer] = useState<"correct" | "incorrect" | null>(null)
  const { toast } = useToast()

  // Add debug logging to help troubleshoot
  const { messages, append, setMessages, error } = useChat({
    api: "/api/plural-game",
    id: "plural-game",
    onFinish: (message) => {
      console.log("AI response received:", message.content)
      setIsLoading(false)
      processAIResponse(message.content)
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to communicate with the AI. Please try again.",
        variant: "destructive",
      })
    },
  })

  const gameStartedRef = useRef(false)

  useEffect(() => {
    if (!gameStarted || gameStartedRef.current) return

    const startGame = async () => {
      gameStartedRef.current = true
      setIsLoading(true)
      try {
        await append({
          role: "user",
          content: "Start the game and give me a new German noun to guess its plural form.",
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

  // Fix the regex pattern in processAIResponse to match the actual response format
  const processAIResponse = (content: string) => {
    console.log("AI Response Content:", content);
  
    // Extract the word and translation
    const wordMatch = content.match(/What is the plural of: "([^"]+)" \((.+)\)/);
    if (wordMatch && (!currentWord || currentWord.word !== wordMatch[1])) {
      console.log("Extracted Word:", wordMatch[1], "Translation:", wordMatch[2]);
      setCurrentWord({
        word: wordMatch[1],
        translation: wordMatch[2],
      });
    }
  
    // Extract hint if present
    const hintMatch = content.match(/Hint:([^!]+)/);
    if (hintMatch) {
      console.log("Extracted Hint:", hintMatch[1].trim());
      setHint(hintMatch[1].trim());
    }
  
    // Extract correct answer if present
    const correctMatch = content.match(/correct plural is "([^"]+)"/);
    if (correctMatch) {
      setCorrectAnswer(correctMatch[1]);
    }
  
    // Update stats based on feedback
    if (content.includes("✅ Correct!")) {
      setLastAnswer("correct");
      setStats((prev) => {
        if (currentWord && !prev.correct.includes(currentWord.word)) {
          return {
            ...prev,
            correct: [...prev.correct, currentWord.word],
          };
        }
        return prev;
      });
    } else if (content.includes("❌ Wrong!") || content.includes("❌ Almost!")) {
      setLastAnswer("incorrect");
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
  
    // If we have a new word but no answer yet, make sure we're in the question state
    if (wordMatch && !content.includes("✅ Correct!") && !content.includes("❌ Wrong!")) {
      setLastAnswer(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || !currentWord || !userInput.trim()) return

    setShowHint(false)
    setIsLoading(true)

    await append({
      role: "user",
      content: userInput,
    })

    setUserInput("")
  }

  const handleHint = async () => {
    setShowHint(true)
    if (!stats.hesitated.includes(currentWord?.word || "")) {
      setStats((prev) => ({
        ...prev,
        hesitated: [...prev.hesitated, currentWord?.word || ""],
      }))
    }

    await append({
      role: "user",
      content: "hint",
    })
  }

  const handleNextWord = async () => {
    setShowHint(false)
    setLastAnswer(null)
    setIsLoading(true)

    await append({
      role: "user",
      content: "Next word please",
    })
  }

  const startNewGame = () => {
    setMessages([])
    setStats({ correct: [], incorrect: [], hesitated: [] })
    gameStartedRef.current = false
    setGameStarted(true)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">German Noun Plural Practice</CardTitle>
        </CardHeader>

        <CardContent>
          {!gameStarted ? (
            <div className="text-center space-y-6 py-8">
              <h3 className="text-xl font-medium">Learn German Noun Plurals</h3>
              <p className="text-gray-600">
                Practice forming the plural forms of German nouns. Type the correct plural or ask for a hint.
              </p>
              <Button size="lg" onClick={() => setGameStarted(true)} className="mt-4">
                Start Game
              </Button>
            </div>
          ) : (
            <>
              {error ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-red-500">Failed to connect to the AI service.</p>
                  <p>Make sure your OpenAI API key is set up correctly.</p>
                  <Button onClick={startNewGame}>Try Again</Button>
                </div>
              ) : currentWord ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-blue-800">{currentWord.word}</h3>
                    <p className="text-gray-600">({currentWord.translation})</p>
                  </div>

                  {lastAnswer === null ? (
                    <div className="space-y-4">
                      <p className="text-center font-medium">What is the plural form?</p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Type the plural form..."
                          className="text-lg py-6 text-center"
                          disabled={isLoading}
                        />

                        <div className="flex justify-center space-x-4">
                          <Button type="submit" disabled={isLoading || !userInput.trim()}>
                            Submit
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleHint}
                            disabled={isLoading || showHint}
                            className="text-amber-600"
                          >
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Hint
                          </Button>
                        </div>
                      </form>

                      {showHint && hint && (
                        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                          <p className="text-amber-800">{hint}</p>
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
                        <p className="text-lg font-medium">
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

