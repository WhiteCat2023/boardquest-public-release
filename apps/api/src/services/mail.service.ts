import nodemailer from "nodemailer";

interface SendPasswordResetMailOptions {
  toEmail: string;
  resetToken: string;
  userName?: string;
}

let testTransporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      service: "gmail",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return testTransporter;
}

export async function sendPasswordResetEmail({
  toEmail,
  resetToken,
  userName,
}: SendPasswordResetMailOptions) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

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

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #a60b0b; word-break: break-all; font-weight: 600;">${resetUrl}</a>
              </p>

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

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: "Reset your BoardQuest password",
    html: htmlContent,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter!.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n==================================================`);
      console.log(`📧 [BOARDQUEST MAIL SENT TO: ${toEmail}]`);
      console.log(`🔗 PREVIEW EMAIL LINK: ${previewUrl}`);
      console.log(`==================================================\n`);
    } else {
      console.log(
        `[MailService] Email sent successfully to ${toEmail} (Message ID: ${info.messageId})`,
      );
    }
    return info;
  } catch (error) {
    console.error(
      `[MailService Error] Failed to send email to ${toEmail}:`,
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
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
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

  const mailOptions = {
    from:
      process.env.SMTP_FROM || '"BoardQuest Admin" <noreply@boardquest.com>',
    to: toEmail,
    subject: "Your BoardQuest User Account Credentials",
    html: htmlContent,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter!.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n==================================================`);
      console.log(`📧 [USER CREDENTIALS EMAIL SENT TO: ${toEmail}]`);
      console.log(`🔑 Temp Password: ${password}`);
      console.log(`🔗 PREVIEW EMAIL LINK: ${previewUrl}`);
      console.log(`==================================================\n`);
    } else {
      console.log(
        `[MailService] User credentials email sent to ${toEmail} (Message ID: ${info.messageId})`,
      );
    }
    return info;
  } catch (error) {
    console.error(
      `[MailService Error] Failed to send credentials email to ${toEmail}:`,
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
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
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

  const mailOptions = {
    from:
      process.env.SMTP_FROM || '"BoardQuest Admin" <noreply@boardquest.com>',
    to: toEmail,
    subject: "Your BoardQuest Student Account Credentials",
    html: htmlContent,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter!.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n==================================================`);
      console.log(`📧 [STUDENT CREDENTIALS EMAIL SENT TO: ${toEmail}]`);
      console.log(`🔑 Temp Password: ${password}`);
      console.log(`🔗 PREVIEW EMAIL LINK: ${previewUrl}`);
      console.log(`==================================================\n`);
    } else {
      console.log(
        `[MailService] Student credentials email sent to ${toEmail} (Message ID: ${info.messageId})`,
      );
    }
    return info;
  } catch (error) {
    console.error(
      `[MailService Error] Failed to send credentials email to ${toEmail}:`,
      error,
    );
    console.log(
      `[MailService Credentials Log]: Email=${toEmail}, Password=${password}`,
    );
    return null;
  }
}
