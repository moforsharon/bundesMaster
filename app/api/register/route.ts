import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Define the expected types for query results
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface InsertResult {
  insertId: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, levelId, gameStats } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json({ message: "Name, email and phone are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = ? OR phone = ?", [email, phone]) as User[];

    if (existingUser.length > 0) {
      return NextResponse.json({ message: "User already exists", userId: existingUser[0].id }, { status: 409 });
    }

    // Create new user
    const result = await db.query(
      "INSERT INTO users (name, email, phone, created_at) VALUES (?, ?, ?, NOW())",
      [name, email, phone]
    ) as { insertId: number };

    const userId = result.insertId;

    // const userId = result.insertId;

    // Save game stats
    if (gameStats) {
      const { levels, currentLevel, levelProgress } = gameStats;

      if (levels && currentLevel && levelProgress) {
        // Save user progress
        await db.query(
          "INSERT INTO user_progress (user_id, current_level, levels_data, level_progress, updated_at) VALUES (?, ?, ?, ?, NOW())",
          [userId, currentLevel, JSON.stringify(levels), JSON.stringify(levelProgress)]
        );
      } else {
        console.warn("Invalid gameStats provided. Skipping user progress save.");
      }
    }

    // If this is for a gift claim, record it
    if (levelId) {
      await db.query("INSERT INTO gift_claims (user_id, level_id, claimed_at) VALUES (?, ?, NOW())", [userId, levelId]);
    }

    return NextResponse.json({
      message: "User registered successfully",
      userId: userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}