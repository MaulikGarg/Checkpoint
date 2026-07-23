import nodemailer from "nodemailer";
import { google } from "googleapis";
import { EmailError } from "./error.util";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const OAuth2 = google.auth.OAuth2;

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    // the oauth2 client which will send the mails
    const oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URL,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token as string,
      },
    });

    await transporter.sendMail({
      from: `Checkpoint <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new EmailError(`Error sending email: ${message}`);
  }

  // if (error) {
  //   throw new EmailError(`Error sending email: ${error.message}`);
  // }
};

export function otpEmailTemplate(otp: string) {
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 16px;">Your OTP Code</h1>
        <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
           Use the following One-Time Password (OTP) to complete your verification process. This code is valid for <strong>10 minutes</strong>.
        </p>
        <div style="background-color: #f4f6f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; max-width: 300px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a73e8;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; color: #777777; line-height: 1.5;">
          If you did not request this code, please ignore this email. Never share your OTP with anyone.
        </p>
      </div>
    `;
  return htmlContent;
}
