import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Reset all challenge participants' scores and times
    await db.query(
      `UPDATE challenge_participants 
       SET final_score = 0, time_in_seconds = NULL`,
      [],
    )

    return NextResponse.json({
      success: true,
      message: "All challenge statistics have been reset successfully",
    })
  } catch (error) {
    console.error("Error resetting challenge statistics:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
