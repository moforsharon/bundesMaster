import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone } = body

    // Validate required fields
    if (!email || !phone) {
      return NextResponse.json(
        { message: "Email and phone are required" }, 
        { status: 400 }
      )
    }

    // Find user with their challenge participation and progress
    const [user] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone,
        cp.id as participant_id, 
        cp.challenge_level,
        cp.status as challenge_status,
        cp.final_score,
        cp.registration_date,
        prog.current_stage,
        prog.completed_stages,
        prog.score as current_score
      FROM challange_users u
      LEFT JOIN challenge_participants cp ON cp.user_id = u.id
      LEFT JOIN challenge_progress prog ON 
        prog.user_id = u.id AND 
        prog.challenge_level = cp.challenge_level
      WHERE u.email = ? AND u.phone = ?`,
      [email, phone]
    ) as any[]

    if (!user) {
      return NextResponse.json(
        { message: "User not found" }, 
        { status: 404 }
      )
    }

    if (!user.participant_id) {
      return NextResponse.json(
        { message: "User is not registered for any challenge" }, 
        { status: 403 }
      )
    }

    // Safely parse completed_stages
    let completedStages = [];
    try {
      if (user.completed_stages) {
        // Handle case where it might be a string or already parsed
        completedStages = typeof user.completed_stages === 'string' 
          ? JSON.parse(user.completed_stages)
          : user.completed_stages;
      }
    } catch (parseError) {
      console.error("Error parsing completed_stages:", parseError);
      completedStages = [];
    }

    // Format the response
    const response = {
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      challengeInfo: {
        participantId: user.participant_id,
        challengeLevel: user.challenge_level,
        status: user.challenge_status,
        finalScore: user.final_score,
        registrationDate: user.registration_date
      },
      progress: {
        currentStage: user.current_stage,
        completedStages: completedStages,
        currentScore: user.current_score
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Challenge login error:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}