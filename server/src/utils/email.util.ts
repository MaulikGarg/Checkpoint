import { Resend } from "resend";
import { EmailError } from "./error.util";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  const { data, error } = await resend.emails.send({
    from: "checkpoint <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (error) {
    throw new EmailError(`Error sending email: ${error.message}`);
  }
};
