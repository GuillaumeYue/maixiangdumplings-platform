/**
 * Owner notifications. Uses Resend when RESEND_API_KEY is set, otherwise logs
 * to the console so the whole flow is demoable with zero configuration.
 */
import { Resend } from "resend";

type Mail = { subject: string; text: string };

export async function notifyAdmin({ subject, text }: Mail) {
  const to = process.env.ADMIN_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (!to) return;
  if (!key) {
    console.log(`[mail → ${to}] ${subject}\n${text}`);
    return;
  }
  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.MAIL_FROM ?? "Maixiangyuan <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("[mail] failed", err);
  }
}
