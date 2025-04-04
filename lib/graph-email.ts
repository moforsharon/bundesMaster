import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendGraphEmail({ to, subject, html, from = process.env.AZURE_SENDER_EMAIL }: EmailOptions) {
  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    throw new Error("Missing Azure AD configuration in environment variables");
  }

  // Create credentials
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  // Create auth provider
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  });

  // Create Graph client
  const client = Client.initWithMiddleware({
    authProvider,
  });

  try {
    // Send email
    await client.api("/users/" + from + "/sendMail").post({
      message: {
        subject,
        body: {
          contentType: "html",
          content: html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
    });

    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email via Graph API:", error);
    throw error;
  }
}