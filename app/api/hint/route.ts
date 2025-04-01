import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: Request) {
    try {
      // The request might contain a message object with content that is JSON
      const body = await req.json()
  
      // Extract the word - handle both direct word property and message content formats
      let word
      if (body.word) {
        word = body.word
      } else if (body.messages && body.messages.length > 0) {
        // Try to parse the content as JSON if it's a string
        const lastMessage = body.messages[body.messages.length - 1]
        try {
          const parsedContent = JSON.parse(lastMessage.content)
          word = parsedContent.word
        } catch (e) {
          // If parsing fails, use the content directly
          word = lastMessage.content
        }
      }
  
      if (!word) {
        console.error("Word is undefined in hint API")
        return new Response(JSON.stringify({ error: "Word parameter is missing" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
  
      console.log("Getting hint for word:", word)
  
      const systemPrompt = `
        You are a German language coach helping students learn noun genders. When asked for a hint about a word's gender:
        
        1. First check if the word follows any standard gender rules based on:
          - Word endings (e.g., -ung is feminine, -chen is neuter)
          - Word categories (e.g., male persons are masculine)
          - Prefixes (e.g., Ge- is usually neuter)
        
        2. If a rule applies:
          - State the rule clearly
          - Provide 1-2 other examples that follow the same pattern
          - Don't give away the answer directly
        
        3. If no clear rule applies:
          - Say "This word is an exception you'll need to memorize"
          - Optionally provide a mnemonic or association tip
        
        Format your response like this:
        💡 Hint: [Your hint here]
        
        Current word: ${word}
      `
  
      const result = streamText({
        model: openai("gpt-4"),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Give me a hint about the gender of "${word}" without revealing the answer directly.`,
          },
        ],
        temperature: 0.5, // Lower temperature for more focused hints
      })
  
      return result.toDataStreamResponse()
    } catch (error) {
      console.error("Error in hint API route:", error)
      return new Response(JSON.stringify({ error: "An error occurred processing your hint request" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
  
  