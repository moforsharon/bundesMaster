import nodemailer from "nodemailer"
import { sendGraphEmail } from "./graph-email";

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}


export async function sendEmail(options: EmailOptions) {
  // Use Graph API as primary method
  try {
    return await sendGraphEmail(options);
  } catch (graphError) {
    console.error("Graph API failed, falling back to SMTP:", graphError);
    
    // Fallback to SMTP if Graph fails
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    return await transporter.sendMail({
      from: options.from || process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

