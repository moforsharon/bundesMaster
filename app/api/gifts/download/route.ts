import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export async function GET(req: NextRequest) {
  try {
    const levelId = req.nextUrl.searchParams.get("levelId")

    if (!levelId) {
      return NextResponse.json({ message: "Level ID is required" }, { status: 400 })
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])

    // Get the standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Set up some variables for positioning
    const { width, height } = page.getSize()
    const margin = 50

    // Draw a border
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - 2 * margin,
      height: height - 2 * margin,
      borderColor: rgb(0.2, 0.4, 0.6),
      borderWidth: 2,
    })

    // Add a title
    page.drawText("Certificate of Achievement", {
      x: 150,
      y: height - 150,
      size: 30,
      font: helveticaBold,
      color: rgb(0.2, 0.4, 0.6),
    })

    // Add congratulatory text
    page.drawText("This certificate is awarded to", {
      x: 180,
      y: height - 220,
      size: 16,
      font: helveticaFont,
    })

    // Add a placeholder for the name
    page.drawText("German Language Learner", {
      x: 180,
      y: height - 260,
      size: 24,
      font: helveticaBold,
      color: rgb(0.3, 0.5, 0.7),
    })

    // Add achievement text
    page.drawText(`for successfully completing Level ${levelId} of`, {
      x: 150,
      y: height - 320,
      size: 16,
      font: helveticaFont,
    })

    // Add program name
    page.drawText("The German Gender Learning Program", {
      x: 150,
      y: height - 360,
      size: 20,
      font: helveticaBold,
      color: rgb(0.3, 0.5, 0.7),
    })

    // Add date
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    page.drawText(`Awarded on ${date}`, {
      x: 200,
      y: height - 420,
      size: 14,
      font: helveticaFont,
    })

    // Add a congratulatory message
    page.drawText("Congratulations on your achievement!", {
      x: 170,
      y: 200,
      size: 16,
      font: helveticaFont,
      color: rgb(0.2, 0.4, 0.6),
    })

    page.drawText("Continue your journey to master German nouns.", {
      x: 140,
      y: 170,
      size: 14,
      font: helveticaFont,
    })

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()

    // Return the PDF as a response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="german-level-${levelId}-certificate.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ message: "Failed to generate certificate" }, { status: 500 })
  }
}

