import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"

interface Challenge {
  id: number
  title: string
  description: string
  start_date: Date | string
  end_date: Date | string
  rules: string
  prize_description: string
}

interface Participant {
  user_id: number
  challenge_level: number
}

interface User {
  id: number
  name: string
  email: string
  // Add other user properties as needed
}

interface EmailRecord {
  userId: number
  email: string
  type: "daily" | "10-minute"
  daysBefore?: number
  minutesBefore?: number
}

// Function to calculate time difference in days
function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// Function to calculate time difference in minutes
function getMinutesDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffTime / (1000 * 60))
}

export async function GET(request: Request) {
  try {
    // Verify the request has a valid secret token
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Find upcoming challenges with proper typing
    const upcomingChallenges = await db.query(`
      SELECT * FROM challenges 
      WHERE start_date > NOW() 
      ORDER BY start_date ASC
    `) as Challenge[]

    if (!upcomingChallenges || upcomingChallenges.length === 0) {
      return NextResponse.json({ message: "No upcoming challenges found" })
    }

    // Process each upcoming challenge
    const results = await Promise.all(
      upcomingChallenges.map(async (challenge) => {
        const challengeStartDate = new Date(challenge.start_date)
        const daysDifference = getDaysDifference(now, challengeStartDate)
        const minutesDifference = getMinutesDifference(now, challengeStartDate)

        // Get all participants for this challenge with proper typing
        const participants = await db.query(`
          SELECT user_id, challenge_level 
          FROM challenge_participants 
          WHERE status = 'active'
        `) as Participant[]

        if (!participants || participants.length === 0) {
          return {
            challengeId: challenge.id,
            title: challenge.title,
            message: "No participants found for this challenge",
          }
        }

        // Get user details for all participants
        const userIds = participants.map((p) => p.user_id)
        const users = (await db.query(`
          SELECT * FROM challange_users 
          WHERE id IN (${userIds.join(",")})
        `)) as User[]

        // Create maps with proper typing
        const userMap: Record<number, User> = users.reduce((acc, user) => {
          acc[user.id] = user
          return acc
        }, {} as Record<number, User>)

        const levelMap: Record<number, number> = participants.reduce((acc, participant) => {
          acc[participant.user_id] = participant.challenge_level
          return acc
        }, {} as Record<number, number>)

        const emailsSent: EmailRecord[] = []

        // Check if we need to send daily reminders
        if (daysDifference <= 7) {
          for (const user of users) {
            const level = levelMap[user.id]
            if (!user.email) continue

            const emailSubject = `Reminder: ${challenge.title} starts in ${daysDifference} day${daysDifference !== 1 ? "s" : ""}`
            const emailContent = `
              <h1>Challenge Reminder</h1>
              <p>Hello ${user.name},</p>
              <p>This is a reminder that the challenge "${challenge.title}" will start in ${daysDifference} day${daysDifference !== 1 ? "s" : ""}.</p>
              <p>You are registered for level ${level}.</p>
              <p>Challenge details:</p>
              <ul>
                <li>Start date: ${challengeStartDate.toLocaleString()}</li>
                <li>Description: ${challenge.description || "No description provided"}</li>
                <li>Rules: ${challenge.rules || "No specific rules"}</li>
                <li>Prize: ${challenge.prize_description || "No prize information"}</li>
              </ul>
              <p>Good luck!</p>
            `

            await sendEmail({
              to: user.email,
              subject: emailSubject,
              html: emailContent,
            })

            emailsSent.push({
              userId: user.id,
              email: user.email,
              type: "daily",
              daysBefore: daysDifference,
            })
          }
        }

        // Check if we need to send 10-minute reminder
        if (minutesDifference <= 15 && minutesDifference >= 10) {
          for (const user of users) {
            const level = levelMap[user.id]
            if (!user.email) continue

            const emailSubject = `🚨 ${challenge.title} starts in 10 minutes!`
            const emailContent = `
              <h1>Challenge Starting Soon!</h1>
              <p>Hello ${user.name},</p>
              <p><strong>Your challenge "${challenge.title}" is starting in just 10 minutes!</strong></p>
              <p>You are registered for level ${level}.</p>
              <p>Please make sure you're ready to participate.</p>
              <p>Good luck!</p>
            `

            await sendEmail({
              to: user.email,
              subject: emailSubject,
              html: emailContent,
            })

            emailsSent.push({
              userId: user.id,
              email: user.email,
              type: "10-minute",
              minutesBefore: minutesDifference,
            })
          }
        }

        return {
          challengeId: challenge.id,
          title: challenge.title,
          startDate: challengeStartDate.toISOString(),
          emailsSent,
        }
      })
    )

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    })
  } catch (error: unknown) {
    console.error("Challenge reminder cron job error:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: errorMessage,
        details: errorDetails 
      }, 
      { status: 500 }
    )
  }
}