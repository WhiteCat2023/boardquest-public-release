import { Resend } from "resend";

interface SendPasswordResetMailOptions {
  toEmail: string;
  resetToken: string;
  userName?: string;
  resetUrl?: string;
  portalName?: string;
}

function getResendClient(): Resend | null {
  if (process.env.NODE_ENV === "test") {
    return null;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    "BoardQuest <onboarding@resend.dev>"
  );
}

export async function sendPasswordResetEmail({
  toEmail,
  resetToken,
  userName,
  resetUrl: customResetUrl,
  portalName,
}: SendPasswordResetMailOptions) {
  const frontendUrl = process.env.FRONTEND_URL;
  const resetUrl = customResetUrl || `${frontendUrl}/reset-password?token=${resetToken}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your BoardQuest Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: center;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase;">
                Password Reset <span style="color: #a60b0b;">Request</span>
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hello${userName ? ` <strong>${userName}</strong>` : ""}, we received a request to reset your BoardQuest account password. Click the button below to proceed.
              </p>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

             
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                <strong style="color: #4b5563;">Important:</strong> This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📧 [BOARDQUEST PASSWORD RESET SIMULATION]`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`🔗 Direct Reset Link: ${resetUrl}`);
    console.log(`==================================================\n`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: "Reset your BoardQuest password",
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send password reset email to ${toEmail}:`,
        error,
      );
      console.log(`[MailService Direct Reset Link for testing]: ${resetUrl}`);
      return null;
    }

    console.log(
      `[MailService] Password reset email sent successfully to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending email to ${toEmail}:`,
      error,
    );
    console.log(`[MailService Direct Reset Link for testing]: ${resetUrl}`);
    return null;
  }
}

interface SendFacultyCredentialsMailOptions {
  toEmail: string;
  name: string;
  password: string;
  role: string;
  employeeId?: string;
}

export type SendUserCredentialsMailOptions = SendFacultyCredentialsMailOptions;

export async function sendFacultyCredentialsEmail({
  toEmail,
  name,
  password,
  role,
  employeeId,
}: SendFacultyCredentialsMailOptions) {
  const frontendUrl = process.env.FRONTEND_URL;
  const loginUrl = `${frontendUrl}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BoardQuest - Your Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase; text-align: center;">
                User Account <span style="color: #a60b0b;">Created</span>
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hello <strong>${name}</strong>, your user account has been registered on the BoardQuest Evaluation Platform. Below are your login credentials:
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #374151;">
                  ${
                    employeeId
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600; width: 120px;">Employee ID:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${employeeId}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Assigned Role:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #a60b0b;">${role}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Email / Login:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${toEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Temporary Password:</td>
                    <td style="padding: 6px 0;">
                      <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #a60b0b; background-color: #fee2e2; padding: 4px 10px; border-radius: 8px;">${password}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Log In To BoardQuest
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                <strong style="color: #4b5563;">Security Notice:</strong> Please log in and change your temporary password under Profile Settings upon your first sign-in.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📧 [USER CREDENTIALS EMAIL SIMULATION]`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`🔑 Temp Password: ${password}`);
    console.log(`🔗 Login Link: ${loginUrl}`);
    console.log(`==================================================\n`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: "Your BoardQuest User Account Credentials",
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send credentials email to ${toEmail}:`,
        error,
      );
      console.log(
        `[MailService Credentials Log]: Email=${toEmail}, Password=${password}`,
      );
      return null;
    }

    console.log(
      `[MailService] User credentials email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending credentials email to ${toEmail}:`,
      error,
    );
    console.log(
      `[MailService Credentials Log]: Email=${toEmail}, Password=${password}`,
    );
    return null;
  }
}

export const sendUserCredentialsEmail = sendFacultyCredentialsEmail;

interface SendStudentCredentialsMailOptions {
  toEmail: string;
  name: string;
  password: string;
  studentId?: string;
}

export async function sendStudentCredentialsEmail({
  toEmail,
  name,
  password,
  studentId,
}: SendStudentCredentialsMailOptions) {
  const frontendUrl = process.env.FRONTEND_URL;
  const loginUrl = `${frontendUrl}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BoardQuest - Your Student Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase; text-align: center;">
                Student Account <span style="color: #a60b0b;">Enrolled</span>
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Welcome <strong>${name}</strong>! Your student account has been successfully enrolled on the BoardQuest Evaluation Platform. Below are your account login credentials:
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #374151;">
                  ${
                    studentId
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600; width: 120px;">Student ID:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${studentId}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Email / Login:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${toEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Temporary Password:</td>
                    <td style="padding: 6px 0;">
                      <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #a60b0b; background-color: #fee2e2; padding: 4px 10px; border-radius: 8px;">${password}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Log In To BoardQuest
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                <strong style="color: #4b5563;">Security Notice:</strong> Please log in and update your password upon your first sign-in.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📧 [STUDENT CREDENTIALS EMAIL SIMULATION]`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`🔑 Temp Password: ${password}`);
    console.log(`🔗 Login Link: ${loginUrl}`);
    console.log(`==================================================\n`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: "Your BoardQuest Student Account Credentials",
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send credentials email to ${toEmail}:`,
        error,
      );
      console.log(
        `[MailService Credentials Log]: Email=${toEmail}, Password=${password}`,
      );
      return null;
    }

    console.log(
      `[MailService] Student credentials email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending student credentials email to ${toEmail}:`,
      error,
    );
    console.log(
      `[MailService Credentials Log]: Email=${toEmail}, Password=${password}`,
    );
    return null;
  }
}

export interface SendReviewCenterCredentialsMailOptions {
  toEmail: string;
  name: string;
  password: string;
  companyName: string;
  employeeId?: string;
}

export async function sendReviewCenterCredentialsEmail({
  toEmail,
  name,
  password,
  companyName,
  employeeId,
}: SendReviewCenterCredentialsMailOptions) {
  const frontendUrl =
    process.env.REVIEW_CENTER_FRONTEND_URL ;
  const loginUrl = `${frontendUrl}/login`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BoardQuest - Review Center Portal Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 36px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 16px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase; text-align: center;">
                Review Center <span style="color: #a60b0b;">Partner Portal</span>
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hello <strong>${name}</strong>, your partner representative account for <strong>${companyName}</strong> has been registered on the BoardQuest Evaluation Platform. Below are your login credentials:
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #374151;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600; width: 140px;">Partner Center:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${companyName}</td>
                  </tr>
                  ${
                    employeeId
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Employee ID / Ref:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${employeeId}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Login / Email:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${toEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Temporary Password:</td>
                    <td style="padding: 6px 0;">
                      <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #a60b0b; background-color: #fee2e2; padding: 4px 10px; border-radius: 8px;">${password}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Log In To Review Center Portal
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                <strong style="color: #4b5563;">Security Notice:</strong> Please sign in and update your credentials upon initial access.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📧 [REVIEW CENTER CREDENTIALS EMAIL SIMULATION]`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`🏢 Partner: ${companyName}`);
    console.log(`🔑 Temp Password: ${password}`);
    console.log(`🔗 Login Link: ${loginUrl}`);
    console.log(`==================================================\n`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: `Your BoardQuest Review Center Partner Account Credentials (${companyName})`,
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send credentials email to ${toEmail}:`,
        error,
      );
      console.log(
        `[MailService Credentials Log]: Email=${toEmail}, Password=${password}, Partner=${companyName}`,
      );
      return null;
    }

    console.log(
      `[MailService] Review Center credentials email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending review center credentials email to ${toEmail}:`,
      error,
    );
    console.log(
      `[MailService Credentials Log]: Email=${toEmail}, Password=${password}, Partner=${companyName}`,
    );
    return null;
  }
}

export interface SendQuestionStatusMailOptions {
  toEmail: string;
  userName?: string;
  status: "APPROVED" | "PENDING_REVISION" | "COMMENT" | string;
  questionTitle?: string;
  subjectName?: string;
  message: string;
  feedback?: string;
  linkUrl?: string;
}

export async function sendQuestionStatusNotificationEmail({
  toEmail,
  userName,
  status,
  questionTitle,
  subjectName,
  message,
  feedback,
  linkUrl: customLinkUrl,
}: SendQuestionStatusMailOptions) {
  const adminUrl =
    process.env.ADMIN_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  const targetUrl = customLinkUrl || `${adminUrl}/question-bank`;

  const isApproved = status === "APPROVED";
  const isRevision = status === "PENDING_REVISION";
  const isComment = status === "COMMENT";

  const badgeBg = isApproved ? "#dcfce7" : isRevision ? "#fef3c7" : "#e0f2fe";
  const badgeColor = isApproved ? "#15803d" : isRevision ? "#b45309" : "#0369a1";
  const badgeBorder = isApproved ? "#86efac" : isRevision ? "#fde68a" : "#bae6fd";
  const badgeText = isApproved
    ? "APPROVED & PUBLISHED"
    : isRevision
      ? "REVISIONS REQUESTED"
      : isComment
        ? "REVIEWER COMMENT"
        : "QUESTION UPDATE";

  const subjectLine = isApproved
    ? "Question Approved and Published - BoardQuest"
    : isRevision
      ? "Revision Requested on Question - BoardQuest"
      : isComment
        ? "New Feedback on Your Question - BoardQuest"
        : "Question Status Update - BoardQuest";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectLine}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 36px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 14px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px; text-align: left;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: ${badgeColor}; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 9999px;">
                  ${badgeText}
                </span>
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827; text-align: center;">
                Question Bank Notification
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hello <strong>${userName || "Educator"}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                ${message}
              </p>

              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
                ${
                  subjectName
                    ? `
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                  <div style="font-size: 13px; font-weight: 700; color: #111827; margin-top: 2px;">${subjectName}</div>
                </div>`
                    : ""
                }
                ${
                  questionTitle
                    ? `
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Question / Topic</span>
                  <div style="font-size: 13px; font-weight: 600; color: #1f2937; margin-top: 2px; font-style: italic;">"${questionTitle}"</div>
                </div>`
                    : ""
                }
                ${
                  feedback
                    ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #d1d5db;">
                  <span style="font-size: 11px; font-weight: 700; color: #a60b0b; text-transform: uppercase; letter-spacing: 0.5px;">Reviewer Notes</span>
                  <div style="font-size: 13px; color: #374151; margin-top: 4px; background-color: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px solid #e5e7eb; line-height: 1.5;">${feedback}</div>
                </div>`
                    : ""
                }
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${targetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      View Question in Portal
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                You received this email because <em>Email Notifications</em> are enabled on your BoardQuest profile. You can change your preferences anytime under Settings.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📧 [QUESTION STATUS EMAIL SIMULATION]`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`🏷️ Status: ${status}`);
    console.log(`📝 Message: ${message}`);
    if (feedback) console.log(`💬 Feedback: ${feedback}`);
    console.log(`🔗 Link: ${targetUrl}`);
    console.log(`==================================================\n`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: subjectLine,
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send question status email to ${toEmail}:`,
        error,
      );
      return null;
    }

    console.log(
      `[MailService] Question status email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending question status email to ${toEmail}:`,
      error,
    );
    return null;
  }
}

export interface SendSecurityAlertMailOptions {
  toEmail: string;
  userName?: string;
  loginTime?: Date | string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export async function sendSecurityAlertEmail({
  toEmail,
  userName,
  loginTime,
  ipAddress,
  userAgent,
  location,
}: SendSecurityAlertMailOptions) {
  const adminUrl =
    process.env.ADMIN_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${adminUrl}/forgot-password`;

  const formattedTime = loginTime
    ? new Date(loginTime).toUTCString()
    : new Date().toUTCString();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert: New Sign-In to BoardQuest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 36px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 14px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px; text-align: left;">
              <div style="text-align: center; margin-bottom: 16px;">
                <span style="display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #991b1b; background-color: #fee2e2; border: 1px solid #fca5a5; border-radius: 9999px;">
                  SECURITY ALERT
                </span>
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827; text-align: center;">
                New Account Sign-In Detected
              </h2>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hello <strong>${userName || "User"}</strong>, your BoardQuest account was recently signed into. If this was you, no action is required.
              </p>

              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #374151;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600; width: 110px;">Date & Time:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${formattedTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">IP Address:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${ipAddress || "Unknown / Localhost"}</td>
                  </tr>
                  ${
                    location
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Approx. Region:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${location}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    userAgent
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Client Device:</td>
                    <td style="padding: 6px 0; color: #4b5563; font-size: 12px; word-break: break-all;">${userAgent}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>

              <!-- Warning Box -->
              <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; color: #9f1239; line-height: 1.5;">
                  <strong>Did not recognize this activity?</strong> Your credentials may be compromised. Please secure your account immediately by resetting your password.
                </p>
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 20px auto 10px auto;">
                <tr>
                  <td align="center" style="background-color: #111827; border-radius: 14px;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 12px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Secure My Account
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                You received this security alert because <em>Security & Login Alerts</em> are active on your account. Manage alerts in Account Settings.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
      );
      console.log(`\n==================================================`);
      console.log(`🛡️ [SECURITY LOGIN ALERT EMAIL SIMULATION]`);
      console.log(`📬 To: ${toEmail}`);
      console.log(`⏰ Time: ${formattedTime}`);
      console.log(`🌐 IP: ${ipAddress || "Unknown"}`);
      if (userAgent) console.log(`💻 Device: ${userAgent}`);
      console.log(`==================================================\n`);
    }
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: "Security Alert: New Sign-In to BoardQuest",
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send security alert email to ${toEmail}:`,
        error,
      );
      return null;
    }

    console.log(
      `[MailService] Security alert email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending security alert email to ${toEmail}:`,
      error,
    );
    return null;
  }
}

export interface WeeklyDigestMetrics {
  questionsCreated: number;
  questionsApproved: number;
  questionsPending: number;
  activeContributors: number;
  studentAttempts: number;
  averagePassingRate: number;
  periodLabel?: string;
}

export interface SendWeeklyDigestMailOptions {
  toEmail: string;
  userName?: string;
  metrics: WeeklyDigestMetrics;
}

export async function sendWeeklyDigestEmail({
  toEmail,
  userName,
  metrics,
}: SendWeeklyDigestMailOptions) {
  const adminUrl =
    process.env.ADMIN_URL || process.env.FRONTEND_URL || "http://localhost:5173";
  const dashboardUrl = `${adminUrl}/`;

  const periodText = metrics.periodLabel || "Past 7 Days";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your BoardQuest Weekly Performance Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 36px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 14px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px; text-align: left;">
              <div style="text-align: center; margin-bottom: 16px;">
                <span style="display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #1e40af; background-color: #dbeafe; border: 1px solid #bfdbfe; border-radius: 9999px;">
                  WEEKLY DIGEST &bull; ${periodText.toUpperCase()}
                </span>
              </div>

              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #111827; text-align: center;">
                Academic & Review Performance Digest
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #6b7280; text-align: center;">
                Executive summary of faculty authoring, question reviews, and student engagement.
              </p>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hello <strong>${userName || "Educator"}</strong>, here is your weekly breakdown of activity across BoardQuest:
              </p>

              <!-- Metrics Grid -->
              <table width="100%" border="0" cellspacing="8" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 900; color: #a60b0b;">${metrics.questionsCreated}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 4px;">New Questions</div>
                  </td>
                  <td width="50%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 900; color: #15803d;">${metrics.questionsApproved}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 4px;">Approved & Published</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 900; color: #b45309;">${metrics.questionsPending}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 4px;">Awaiting Review</div>
                  </td>
                  <td width="50%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 900; color: #1d4ed8;">${metrics.studentAttempts}</div>
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 4px;">Student Attempts</div>
                  </td>
                </tr>
              </table>

              <!-- Average Accuracy / Passing Rate Banner -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Student Cohort Passing / Accuracy Rate</div>
                <div style="font-size: 28px; font-weight: 900; color: #15803d; margin-top: 4px;">${metrics.averagePassingRate}%</div>
                <div style="font-size: 12px; color: #166534; margin-top: 2px;">Measured across all completed questions and assessments this period.</div>
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Open Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                You received this digest because <em>Weekly Performance Digest</em> is turned on. Manage your delivery settings under Notification Preferences.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📊 [WEEKLY PERFORMANCE DIGEST EMAIL SIMULATION]`);
    console.log(`📬 To: ${toEmail}`);
    console.log(`📈 Metrics:`, metrics);
    console.log(`🔗 Dashboard: ${dashboardUrl}`);
    console.log(`==================================================\n`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      subject: `BoardQuest Weekly Digest: ${metrics.questionsCreated} new questions, ${metrics.questionsApproved} approved`,
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send weekly digest email to ${toEmail}:`,
        error,
      );
      return null;
    }

    console.log(
      `[MailService] Weekly digest email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending weekly digest email to ${toEmail}:`,
      error,
    );
    return null;
  }
}

export interface SendAdvisorOutreachMailOptions {
  toEmail: string;
  studentName: string;
  advisorName: string;
  advisorEmail: string;
  advisorRole?: string;
  subject: string;
  message: string;
  meetingLink?: string;
  weakSubjects?: string[];
  drillCategory?: string;
}

export async function sendAdvisorOutreachEmail({
  toEmail,
  studentName,
  advisorName,
  advisorEmail,
  advisorRole = "Faculty Advisor",
  subject,
  message,
  meetingLink,
  weakSubjects = [],
  drillCategory,
}: SendAdvisorOutreachMailOptions) {
  const frontendUrl = process.env.FRONTEND_URL;
  const formattedMessage = message
    .split("\n")
    .map((line) => line.trim())
    .join("<br/>");

  const weakSubjectsHtml =
    (weakSubjects.length > 0 || drillCategory)
      ? `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 14px 18px; margin: 18px 0; text-align: left;">
        <div style="font-size: 11px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
          Focus Subject / Area Needing Attention:
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #b91c1c;">
          ${drillCategory ? `<strong>${drillCategory}</strong>` : ""}
          ${weakSubjects.length > 0 ? (drillCategory ? ` &bull; Weak domains: ${weakSubjects.join(", ")}` : weakSubjects.join(", ")) : ""}
        </div>
      </div>
      `
      : "";

  const meetingLinkHtml = meetingLink
    ? `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 14px 18px; margin: 18px 0; text-align: left;">
        <div style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
          Scheduled Consultation / Meeting Link:
        </div>
        <a href="${meetingLink}" target="_blank" style="font-size: 13px; font-weight: 700; color: #2563eb; text-decoration: underline; word-break: break-all;">
          ${meetingLink}
        </a>
      </div>
      `
    : "";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 36px 30px 18px 30px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1;">
                <span style="color: #111827;">B</span><span style="color: #a60b0b;">Q</span>
              </div>
              <div style="font-size: 14px; font-weight: 900; letter-spacing: 4px; color: #111827; margin-top: 6px;">
                BOARDQUEST
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px; text-align: left;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #fee2e2; color: #a60b0b; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Academic Guidance Notice
                </span>
                <h2 style="margin: 12px 0 6px 0; font-size: 18px; font-weight: 800; color: #111827;">
                  ${subject}
                </h2>
                <div style="font-size: 12px; color: #6b7280;">
                  From <strong>${advisorName}</strong> (${advisorRole})
                </div>
              </div>

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151; line-height: 1.6;">
                Dear <strong>${studentName}</strong>,
              </p>

              <!-- Main Message -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid #a60b0b; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; font-size: 14px; color: #1f2937; line-height: 1.7;">
                ${formattedMessage}
              </div>

              ${weakSubjectsHtml}
              ${meetingLinkHtml}

              <!-- Advisor Signature Card -->
              <div style="background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 14px; padding: 14px 18px; margin: 20px 0; text-align: left;">
                <div style="font-size: 11px; font-weight: 800; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                  Assigned Advisor Contact:
                </div>
                <div style="font-size: 13px; font-weight: 700; color: #111827;">
                  ${advisorName}
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                  ${advisorRole} &bull; <a href="mailto:${advisorEmail}" style="color: #7e22ce; text-decoration: underline;">${advisorEmail}</a>
                </div>
              </div>

              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 28px auto 16px auto;">
                <tr>
                  <td align="center" style="background-color: #a60b0b; border-radius: 14px;">
                    <a href="${frontendUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      Open BoardQuest Platform
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; line-height: 1.5; text-align: center;">
                You can directly reply to this email to reach <strong>${advisorName}</strong> at <strong>${advisorEmail}</strong>.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 30px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 11px; color: #9ca3af;">
              &copy; ${new Date().getFullYear()} BoardQuest Evaluation System. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[MailService Warning] RESEND_API_KEY is not configured. Email will not be sent over network.`,
    );
    console.log(`\n==================================================`);
    console.log(`📧 [ADVISOR OUTREACH EMAIL SIMULATION]`);
    console.log(`📬 To: ${toEmail} (${studentName})`);
    console.log(`👤 From Advisor: ${advisorName} <${advisorEmail}> (${advisorRole})`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`💬 Message:\n${message}`);
    if (meetingLink) console.log(`🔗 Consultation Link: ${meetingLink}`);
    console.log(`==================================================\n`);
    return { id: "simulated-outreach-id" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [toEmail],
      replyTo: advisorEmail,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error(
        `[MailService Error] Failed to send advisor outreach email to ${toEmail}:`,
        error,
      );
      return null;
    }

    console.log(
      `[MailService] Advisor outreach email sent to ${toEmail} (ID: ${data?.id})`,
    );
    return data;
  } catch (error) {
    console.error(
      `[MailService Error] Exception sending advisor outreach email to ${toEmail}:`,
      error,
    );
    return null;
  }
}


