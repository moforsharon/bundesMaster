// import { NextResponse } from "next/server"

// // This would typically come from a database
// const challenges = [
//   {
//     id: 1,
//     title: "German Learning Challenge",
//     description: "A 30-day challenge to improve your German language skills",
//     startTime: "2025-04-03T14:54:00Z", // ISO format for dates
//     endTime: "2025-04-03T14:55:00Z",
//     rules: ["Complete daily exercises", "Practice for at least 30 minutes", "Submit your progress before midnight"],
//     rewards: "Certificate of completion and premium learning materials",
//     createdAt: "2025-04-03T12:07:09Z",
//     updatedAt: "2025-04-03T12:07:09Z",
//   },
//   {
//     id: 2,
//     title: "German Grammar Mastery",
//     description: "Master German grammar in 14 days",
//     startTime: "2025-05-10T15:00:00Z",
//     endTime: "2025-05-24T15:00:00Z",
//     rules: ["Complete all grammar exercises", "Participate in daily quizzes", "Join weekly review sessions"],
//     rewards: "Grammar mastery certificate and advanced learning materials",
//     createdAt: "2025-04-03T12:07:09Z",
//     updatedAt: "2025-04-03T12:07:09Z",
//   },
// ]

// export async function GET(request: Request) {
//   // Get the challenge ID from the URL query parameters
//   const { searchParams } = new URL(request.url)
//   const id = searchParams.get("id")

//   // If no ID is provided, return all challenges
//   if (!id) {
//     return NextResponse.json(challenges)
//   }

//   // Find the challenge with the matching ID
//   const challenge = challenges.find((c) => c.id === Number.parseInt(id))

//   // If no challenge is found, return a 404 error
//   if (!challenge) {
//     return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
//   }

//   // Return the challenge data
//   return NextResponse.json(challenge)
// }

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Challenge {
  id: number
  title: string
  description: string | null
  start_date: Date | string
  end_date: Date | string
  rules: string | null
  prize_description: string | null
  created_at: Date | string
  updated_at: Date | string
}

interface FormattedChallenge {
  id: number
  title: string
  description: string
  startTime: Date | string
  endTime: Date | string
  rules: string[]
  rewards: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface CreateChallengeRequest {
  title: string
  start_date: Date | string
  end_date: Date | string
  description?: string
  rules?: string
  prize_description?: string
}

// GET: Fetch all challenges or a specific challenge by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    // If ID is provided, fetch a specific challenge
    if (id) {
      const challenges = await db.query(
        `SELECT * FROM challenges WHERE id = ?`,
        [id]
      ) as Challenge[]

      if (!challenges || challenges.length === 0) {
        return NextResponse.json(
          { error: "Challenge not found" }, 
          { status: 404 }
        )
      }

      const challenge = challenges[0]
      const formattedChallenge: FormattedChallenge = {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description || "",
        startTime: challenge.start_date,
        endTime: challenge.end_date,
        rules: challenge.rules ? challenge.rules.split("\n") : [],
        rewards: challenge.prize_description || "",
        createdAt: challenge.created_at,
        updatedAt: challenge.updated_at,
      }

      return NextResponse.json(formattedChallenge)
    }

    // Otherwise, fetch all challenges
    const challenges = await db.query(`
      SELECT * FROM challenges ORDER BY start_date DESC
    `) as Challenge[]

    const formattedChallenges: FormattedChallenge[] = challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description || "",
      startTime: challenge.start_date,
      endTime: challenge.end_date,
      rules: challenge.rules ? challenge.rules.split("\n") : [],
      rewards: challenge.prize_description || "",
      createdAt: challenge.created_at,
      updatedAt: challenge.updated_at,
    }))

    return NextResponse.json(formattedChallenges)
  } catch (error: unknown) {
    console.error("Error fetching challenges:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch challenges", details: errorMessage },
      { status: 500 }
    )
  }
}

// POST: Create a new challenge
export async function POST(request: Request) {
  try {
    const body: CreateChallengeRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 }
      )
    }

    // Insert the new challenge
    const result = await db.query(
      `INSERT INTO challenges (
        title, 
        description, 
        start_date, 
        end_date, 
        rules, 
        prize_description
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        body.title,
        body.description || null,
        body.start_date,
        body.end_date,
        body.rules || null,
        body.prize_description || null,
      ]
    )

    // Get the inserted challenge
    const insertedId = (result as any).insertId
    const challenges = await db.query(
      `SELECT * FROM challenges WHERE id = ?`,
      [insertedId]
    ) as Challenge[]

    if (!challenges || challenges.length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve created challenge" },
        { status: 500 }
      )
    }

    return NextResponse.json(challenges[0], { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating challenge:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to create challenge", details: errorMessage },
      { status: 500 }
    )
  }
}