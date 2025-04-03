import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, challengeLevel = 1 } = body

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { message: "Name, email and phone are required" }, 
        { status: 400 }
      )
    }

    // Check if user exists
    let [user] = await db.query(
      "SELECT * FROM challange_users WHERE email = ? OR phone = ?",
      [email, phone]
    ) as any[]

    let isNewUser = false
    let userId: number

    if (user) {
      userId = user.id
      // Check if user is already registered for any challenge
      const [existingParticipant] = await db.query(
        "SELECT * FROM challenge_participants WHERE user_id = ?",
        [userId]
      ) as any[]

      if (existingParticipant) {
        return NextResponse.json({
          message: "User already registered for a challenge",
          userId,
          participantId: existingParticipant.id,
          challengeLevel: existingParticipant.challenge_level
        })
      }
    } else {
      // Create new user
      const result = await db.query(
        "INSERT INTO challange_users (name, email, phone) VALUES (?, ?, ?)",
        [name, email, phone]
      ) as { insertId: number }

      userId = result.insertId
      isNewUser = true
    }

    // Register user for challenge
    const participantResult = await db.query(
      `INSERT INTO challenge_participants 
       (user_id, challenge_level, registration_date) 
       VALUES (?, ?, NOW())`,
      [userId, challengeLevel]
    ) as { insertId: number }

    const participantId = participantResult.insertId

    // Initialize challenge progress
    await db.query(
      `INSERT INTO challenge_progress 
       (user_id, challenge_level, current_stage, completed_stages, score)
       VALUES (?, ?, 1, JSON_ARRAY(), 0)`,
      [userId, challengeLevel]
    )

    // Get the full user data with challenge info
    const [newUser] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        cp.id as participant_id, 
        cp.challenge_level,
        cp.status,
        cp.final_score,
        cp.registration_date,
        prog.current_stage,
        prog.completed_stages,
        prog.score as current_score
      FROM challange_users u
      JOIN challenge_participants cp ON cp.user_id = u.id
      JOIN challenge_progress prog ON 
        prog.user_id = u.id AND 
        prog.challenge_level = cp.challenge_level
      WHERE u.id = ?`,
      [userId]
    ) as any[]

    // Safely parse completed_stages
    let completedStages = []
    try {
      if (newUser.completed_stages) {
        // Handle case where it might already be parsed or might be a string
        completedStages = typeof newUser.completed_stages === 'string' 
          ? JSON.parse(newUser.completed_stages)
          : newUser.completed_stages
      }
    } catch (parseError) {
      console.error("Error parsing completed_stages:", parseError)
      completedStages = []
    }

    // Format the response
    const response = {
      message: isNewUser 
        ? "User created and registered for challenge" 
        : "User registered for challenge",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      },
      challengeInfo: {
        participantId: newUser.participant_id,
        challengeLevel: newUser.challenge_level,
        status: newUser.status,
        finalScore: newUser.final_score,
        registrationDate: newUser.registration_date
      },
      progress: {
        currentStage: newUser.current_stage,
        completedStages: completedStages,
        currentScore: newUser.current_score
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Challenge registration error:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}