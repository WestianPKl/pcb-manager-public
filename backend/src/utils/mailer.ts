import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: env.GMAIL_USER,
		pass: env.GMAIL_PASSWORD,
	},
})

function buildEmailHtml(contentHtml: string): string {
	const year = new Date().getFullYear()
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PCB Manager</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:48px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px 0 rgba(0,0,0,0.06);border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                ⚡ PCB Manager
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.7;">
                This message was sent automatically by PCB Manager &bull; ${year}<br/>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendPasswordResetEmail(toAddress: string, resetLink: string): Promise<void> {
	const contentHtml = `
    <h2 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#111827;">Reset Your Password</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
      We received a request to reset the password for your PCB Manager account.
      Click the button below to choose a new password.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
      <tr>
        <td align="center">
          <a href="${resetLink}"
             style="display:inline-block;background:#0f172a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;">Or copy this link</p>
      <a href="${resetLink}" style="font-size:12px;color:#4f46e5;word-break:break-all;">${resetLink}</a>
    </div>

    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
            &#x23F1;&nbsp; This link will expire in <strong>1&nbsp;hour</strong>.<br/>
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `

	await transporter.sendMail({
		from: env.GMAIL_USER,
		to: toAddress,
		subject: 'Reset Your Password — PCB Manager',
		html: buildEmailHtml(contentHtml),
	})
}
