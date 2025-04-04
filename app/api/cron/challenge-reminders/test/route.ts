import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email"

interface Challenge {
  id: number
  title: string
  description: string
  start_date: Date
  end_date: Date
  rules: string
  prize_description: string
}

interface User {
  id: number
  name: string
  email: string
  // Add other user properties as needed
}

// This is a test endpoint to manually trigger the reminder process
export async function GET(request: Request) {
  try {
    // Get current date and time
    const now = new Date()

    // For testing, we'll create a mock challenge that's about to start
    const mockChallenge: Challenge = {
      id: 999,
      title: "Test Challenge",
      description: "This is a test challenge",
      start_date: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes from now
      end_date: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
      rules: "Test rules",
      prize_description: "Test prize",
    }

    // Get a test user
    const testUser = await db.query(`
      SELECT * FROM challange_users 
      LIMIT 1
    `) as User[]

    if (!testUser || testUser.length === 0) {
      return NextResponse.json(
        { error: "No test user found" }, 
        { status: 404 }
      )
    }

    const user = testUser[0]

    // Send a test email
    const emailSubject = `🧪 TEST: ${mockChallenge.title} starts in 10 minutes!`
    const emailContent = `
      <h1>TEST EMAIL - Challenge Starting Soon!</h1>
      <p>Hello ${user.name},</p>
      <p><strong>This is a TEST email. Your challenge "${mockChallenge.title}" would be starting in just 10 minutes!</strong></p>
      <p>You are registered for level 1.</p>
      <p>Please make sure you're ready to participate.</p>
      <p>Good luck!</p>
      <p><em>This is a test email sent at ${now.toISOString()}</em></p>
    `

    // Send the email
    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailContent,
    })

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      to: user.email,
      timestamp: now.toISOString(),
    })
  } catch (error: unknown) {
    console.error("Test email error:", error)
    
    let errorMessage = "Internal server error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : null 
      }, 
      { status: 500 }
    )
  }
}