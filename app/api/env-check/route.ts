import { NextResponse } from "next/server"

export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY

  return NextResponse.json({
    hasApiKey,
    message: hasApiKey ? "OpenAI API key is configured" : "OpenAI API key is missing",
  })
}

