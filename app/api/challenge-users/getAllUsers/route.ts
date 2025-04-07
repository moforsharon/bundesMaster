import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Fetch challenge users with their final scores from challenge_participants
    const challengeUsers = await db.query(`
      SELECT 
        cu.id, 
        cu.name, 
        cu.email, 
        cu.phone, 
        cp.final_score
      FROM 
        challange_users cu
      LEFT JOIN 
        challenge_participants cp ON cu.id = cp.user_id
    `)

    return NextResponse.json(challengeUsers, { status: 200 })
  } catch (error) {
    console.error("Error fetching challenge users:", error)
    return NextResponse.json({ error: "Failed to fetch challenge users" }, { status: 500 })
  }
}

