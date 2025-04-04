import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Helper function to convert ISO string to MySQL datetime format
function toMySQLDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

// GET: Fetch a specific challenge by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const challenge = (await db.query(
      `SELECT * FROM challenges WHERE id = ?`,
      [id],
    )) as any[]

    if (!challenge || challenge.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Format the challenge data to match the expected structure
    const formattedChallenge = {
      id: challenge[0].id,
      title: challenge[0].title,
      description: challenge[0].description || "",
      startTime: challenge[0].start_date,
      endTime: challenge[0].end_date,
      rules: challenge[0].rules ? challenge[0].rules.split("\n") : [],
      rewards: challenge[0].prize_description || "",
      createdAt: challenge[0].created_at,
      updatedAt: challenge[0].updated_at,
    }

    return NextResponse.json(formattedChallenge)
  } catch (error) {
    console.error("Error fetching challenge:", error)
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 })
  }
}

// PUT: Update a challenge
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.start_date || !body.end_date) {
      return NextResponse.json({ error: "Title, start date, and end date are required" }, { status: 400 })
    }

    // Check if the challenge exists
    const existingChallenge = (await db.query(
      `SELECT * FROM challenges WHERE id = ?`,
      [id],
    )) as any[]

    if (!existingChallenge || existingChallenge.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Convert dates to MySQL format
    const startDate = toMySQLDateTime(body.start_date)
    const endDate = toMySQLDateTime(body.end_date)

    // Update the challenge
    await db.query(
      `UPDATE challenges SET
        title = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        rules = ?,
        prize_description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        body.title,
        body.description || null,
        startDate,
        endDate,
        body.rules || null,
        body.prize_description || null,
        id,
      ],
    )

    // Get the updated challenge
    const updatedChallenge = (await db.query(
      `SELECT * FROM challenges WHERE id = ?`,
      [id],
    )) as any[]

    return NextResponse.json(updatedChallenge[0])
  } catch (error) {
    console.error("Error updating challenge:", error)
    return NextResponse.json(
      { error: "Failed to update challenge", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// DELETE: Delete a challenge
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if the challenge exists
    const existingChallenge = (await db.query(
      `SELECT * FROM challenges WHERE id = ?`,
      [id],
    )) as any[]

    if (!existingChallenge || existingChallenge.length === 0) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Delete the challenge
    await db.query(
      `DELETE FROM challenges WHERE id = ?`,
      [id],
    )

    return NextResponse.json({ success: true, message: "Challenge deleted successfully" })
  } catch (error) {
    console.error("Error deleting challenge:", error)
    return NextResponse.json({ error: "Failed to delete challenge" }, { status: 500 })
  }
}