import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const participantId = req.nextUrl.searchParams.get("participantId")

    if (!participantId) {
      return NextResponse.json({ message: "Participant ID is required" }, { status: 400 })
    }

    // In a real implementation, this would query the database
    // Simulating a 10-second delay as requested
    await new Promise((resolve) => setTimeout(resolve, 10000))

    // Get participant's rank considering both score and time
    const [ranking] = (await db.query(
      `SELECT 
        (
          SELECT COUNT(*) + 1
          FROM challenge_participants cp2
          WHERE (
            cp2.final_score > cp.final_score
            OR (
              cp2.final_score = cp.final_score 
              AND cp2.time_in_seconds < cp.time_in_seconds
            )
          )
        ) as position,
        cp.final_score as score,
        cp.time_in_seconds as time,
        (SELECT COUNT(*) FROM challenge_participants) as totalParticipants
      FROM challenge_participants cp
      WHERE cp.id = ?`,
      [participantId],
    )) as any[]

    return NextResponse.json({
      position: ranking.position,
      score: ranking.score,
      time: ranking.time,
      totalParticipants: ranking.totalParticipants,
    })
  } catch (error) {
    console.error("Get ranking error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
