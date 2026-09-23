const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function getConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM;

  if (!apiKey || !senderEmail) {
    throw new Error("Email is not configured (missing BREVO_API_KEY or EMAIL_FROM)");
  }

  return { apiKey, senderEmail, senderName: process.env.EMAIL_FROM_NAME ?? "Fashion" };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const { apiKey, senderEmail, senderName } = getConfig();

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject: "Reset your password",
      htmlContent: `
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to send email (${res.status}): ${body}`);
  }
}
