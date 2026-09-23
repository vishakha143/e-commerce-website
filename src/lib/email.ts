import nodemailer from "nodemailer";

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Email is not configured (missing GMAIL_USER or GMAIL_APP_PASSWORD)");
  }

  return { user, transporter: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }) };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const { user, transporter } = getTransport();

  await transporter.sendMail({
    from: `"Fashion" <${user}>`,
    to,
    subject: "Reset your password",
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
