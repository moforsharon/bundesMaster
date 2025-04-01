import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Initialize the game if this is the first message
    let systemPrompt = `
      You are a German language learning assistant that helps users practice noun plurals.
      
      Rules:
      1. Present German nouns one at a time and ask the user to provide the plural form.
      2. Track words the user gets right, wrong, or needs hints for.
      3. Provide helpful feedback and explanations for the correct plural form.
      4. Use emojis and encouraging language.
      5. If the user types "hint", provide a hint about the plural formation rule.
      
      Format your responses like this:
      
      🃏 Next Word!
      👉 What is the plural of: "Word" (translation) ❓
      ✅ Type the plural form! 😊
      Or type "hint" if you need a clue! 💡
      
      After the user answers, respond with:
      
      ✅ Correct! "Die Plural" is the plural of "Word" (translation). 🎉
      💡 Hint: [Explain the rule that applies to this word]
      
      OR
      
      ❌ Wrong! The correct plural is "Die Plural" 
      💡 Hint: [Explain the rule that applies to this word]
      
      Common plural rules to reference:
      - Most masculine/neuter monosyllabic nouns add -e (often with umlaut)
      - Most feminine nouns and nouns ending in -e add -n or -en
      - Most nouns ending in -er, -el, -en keep the same form (sometimes with umlaut)
      - Most nouns ending in -heit, -keit, -ung, -schaft add -en
      - Most foreign words add -s
      - Some neuter nouns add -er (often with umlaut)
    `

    // If the user is asking for a new word
    if (messages.length > 0 && messages[messages.length - 1].content.toLowerCase().includes("next word")) {
      systemPrompt += "\nThe user is asking for a new word. Present a new German noun."
    }

    const result = streamText({
      model: openai("gpt-4"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
    })

    // Respond with the stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in plural-game API route:", error)
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

