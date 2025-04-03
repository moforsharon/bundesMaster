import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { participantId, score, totalQuestions } = body

    if (!participantId || score === undefined) {
      return NextResponse.json(
        { message: "Participant ID and score are required" },
        { status: 400 }
      )
    }

    // Update participant's score
    await db.query(
      `UPDATE challenge_participants 
       SET final_score = ?, updated_at = NOW()
       WHERE id = ?`,
      [score, participantId]
    )

    // Get participant's position
    const [ranking] = await db.query(
      `SELECT COUNT(*) + 1 as position
       FROM challenge_participants
       WHERE challenge_id = (
         SELECT challenge_id FROM challenge_participants WHERE id = ?
       ) AND final_score > ?`,
      [participantId, score]
    ) as any[]

    return NextResponse.json({
      success: true,
      position: ranking.position,
      score,
      totalQuestions
    })

  } catch (error) {
    console.error("Challenge submit error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}