import { NextResponse } from "next/server"

// This would typically come from a database
const challenges = [
  {
    id: 1,
    title: "German Learning Challenge",
    description: "A 30-day challenge to improve your German language skills",
    startTime: "2025-04-03T14:54:00Z", // ISO format for dates
    endTime: "2025-04-03T14:55:00Z",
    rules: ["Complete daily exercises", "Practice for at least 30 minutes", "Submit your progress before midnight"],
    rewards: "Certificate of completion and premium learning materials",
    createdAt: "2025-04-03T12:07:09Z",
    updatedAt: "2025-04-03T12:07:09Z",
  },
  {
    id: 2,
    title: "German Grammar Mastery",
    description: "Master German grammar in 14 days",
    startTime: "2025-05-10T15:00:00Z",
    endTime: "2025-05-24T15:00:00Z",
    rules: ["Complete all grammar exercises", "Participate in daily quizzes", "Join weekly review sessions"],
    rewards: "Grammar mastery certificate and advanced learning materials",
    createdAt: "2025-04-03T12:07:09Z",
    updatedAt: "2025-04-03T12:07:09Z",
  },
]

export async function GET(request: Request) {
  // Get the challenge ID from the URL query parameters
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  // If no ID is provided, return all challenges
  if (!id) {
    return NextResponse.json(challenges)
  }

  // Find the challenge with the matching ID
  const challenge = challenges.find((c) => c.id === Number.parseInt(id))

  // If no challenge is found, return a 404 error
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  // Return the challenge data
  return NextResponse.json(challenge)
}

