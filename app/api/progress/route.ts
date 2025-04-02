import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface ProgressResult {
  current_level: string;
  levels_data: any; // Changed from string to any
  level_progress: any; // Changed from string to any
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Get user's progress
    const progressResults = await db.query(
      "SELECT current_level, levels_data, level_progress FROM user_progress WHERE user_id = ?", 
      [userId]
    ) as unknown as ProgressResult[];

    if (progressResults.length === 0) {
      return NextResponse.json({ message: "No progress found for this user" }, { status: 404 });
    }

    // Safe parsing function
    const safeParse = (data: any) => {
      try {
        // If it's already an object, return it
        if (typeof data === 'object' && data !== null) {
          return data;
        }
        // If it's a string, try to parse it
        if (typeof data === 'string') {
          return JSON.parse(data);
        }
        // Fallback for other cases
        return {};
      } catch (e) {
        console.error("Error parsing data:", e);
        return {};
      }
    };

    const progress = {
      currentLevel: progressResults[0].current_level,
      levels: safeParse(progressResults[0].levels_data),
      levelProgress: safeParse(progressResults[0].level_progress),
    };

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, currentLevel, levels, levelProgress } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Ensure data is properly stringified before saving
    const levelsData = typeof levels === 'string' ? levels : JSON.stringify(levels);
    const levelProgressData = typeof levelProgress === 'string' ? levelProgress : JSON.stringify(levelProgress);

    // Check if user has existing progress
    const existingProgress = await db.query(
      "SELECT 1 FROM user_progress WHERE user_id = ? LIMIT 1", 
      [userId]
    ) as unknown as any[];

    if (existingProgress.length > 0) {
      // Update existing progress
      await db.query(
        "UPDATE user_progress SET current_level = ?, levels_data = ?, level_progress = ?, updated_at = NOW() WHERE user_id = ?",
        [currentLevel, levelsData, levelProgressData, userId],
      );
    } else {
      // Create new progress record
      await db.query(
        "INSERT INTO user_progress (user_id, current_level, levels_data, level_progress, updated_at) VALUES (?, ?, ?, ?, NOW())",
        [userId, currentLevel, levelsData, levelProgressData],
      );
    }

    return NextResponse.json({
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}