import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, gameStats } = body

    // Validate required fields
    if (!email || !phone) {
      return NextResponse.json({ message: "Email and phone are required" }, { status: 400 })
    }

    // Find user
    const users = await db.query("SELECT * FROM users WHERE email = ? AND phone = ?", [email, phone]) as any[]

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Update game stats if provided
    if (gameStats) {
      const { levels, currentLevel, levelProgress } = gameStats

      // Validate gameStats structure
      if (
        !Array.isArray(levels) ||
        typeof currentLevel !== "number" ||
        typeof levelProgress !== "object"
      ) {
        return NextResponse.json({ message: "Invalid gameStats format" }, { status: 400 })
      }

      // Check if user has existing progress
      const existingProgress = await db.query("SELECT * FROM user_progress WHERE user_id = ?", [user.id]) as any[]

      if (existingProgress.length > 0) {
        // Update existing progress
        await db.query(
          "UPDATE user_progress SET current_level = ?, levels_data = ?, level_progress = ?, updated_at = NOW() WHERE user_id = ?",
          [
            currentLevel,
            JSON.stringify(levels),
            JSON.stringify(levelProgress),
            user.id
          ]
        )
      } else {
        // Create new progress record
        await db.query(
          "INSERT INTO user_progress (user_id, current_level, levels_data, level_progress, updated_at) VALUES (?, ?, ?, ?, NOW())",
          [
            user.id,
            currentLevel,
            JSON.stringify(levels),
            JSON.stringify(levelProgress)
          ]
        )
      }
    }

    // Get user's progress
    const progressResults = await db.query("SELECT * FROM user_progress WHERE user_id = ?", [user.id]) as any[]

    let progress = null
    if (progressResults.length > 0) {
      // Check if data is already parsed or needs parsing
      const levelsData = typeof progressResults[0].levels_data === 'string' 
        ? JSON.parse(progressResults[0].levels_data)
        : progressResults[0].levels_data;

      const levelProgress = typeof progressResults[0].level_progress === 'string'
        ? JSON.parse(progressResults[0].level_progress)
        : progressResults[0].level_progress;

      progress = {
        currentLevel: progressResults[0].current_level,
        levels: levelsData,
        levelProgress: levelProgress,
      }
    }

    return NextResponse.json({
      message: "Login successful",
      userId: user.id,
      userName: user.name,
      progress,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}