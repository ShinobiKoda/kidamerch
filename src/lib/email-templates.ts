export function getAdminInviteEmailHtml(inviteLink: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Admin Invitation - KidaMerch</title>
  <style>
    :root { color-scheme: light dark; }

    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #111116 !important; }
      .email-card { background-color: #1e1e24 !important; border-color: #2a2a32 !important; }
      .email-heading { color: #f4f4f5 !important; }
      .email-text { color: #a1a1aa !important; }
      .email-btn { background-color: #dc2626 !important; color: #ffffff !important; }
      .email-footer { color: #52525b !important; }
      .email-logo { background-color: #dc2626 !important; color: #ffffff !important; }
      .email-divider { border-color: #2a2a32 !important; }
    }
  </style>
</head>
<body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 0; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Logo -->
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
          <tr>
            <td class="email-logo" style="width: 48px; height: 48px; background-color: #b91c1c; color: #ffffff; font-weight: 900; font-size: 24px; line-height: 48px; text-align: center; border-radius: 10px;">K</td>
          </tr>
        </table>

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="email-card" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 48px 40px;">
              <h1 class="email-heading" style="color: #18181b; font-size: 26px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.5px; text-align: center;">You're Invited</h1>
              <p class="email-text" style="color: #71717a; font-size: 15px; margin: 0 0 32px 0; line-height: 1.6; text-align: center;">A superadmin has invited you to join the <strong style="color: inherit; font-weight: 600;">KidaMerch</strong> operations team as an administrator. Click below to accept and set up your account.</p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" class="email-btn" style="display: inline-block; background-color: #b91c1c; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">Accept Invitation</a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px;">
                <tr>
                  <td class="email-divider" style="border-top: 1px solid #e4e4e7; padding-top: 24px;">
                    <p class="email-text" style="color: #a1a1aa; font-size: 13px; margin: 0; line-height: 1.5; text-align: center;">If you didn't expect this invitation, you can safely ignore this email. This link will expire in 24 hours.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <p class="email-footer" style="color: #a1a1aa; font-size: 12px; margin-top: 32px; text-align: center;">&copy; ${new Date().getFullYear()} KidaMerch. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getNewsletterWelcomeEmailHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to KidaMerch</title>
  <style>
    :root { color-scheme: light dark; }

    @media (prefers-color-scheme: dark) {
      .email-body { background-color: #111116 !important; }
      .email-card { background-color: #1e1e24 !important; border-color: #2a2a32 !important; }
      .email-heading { color: #f4f4f5 !important; }
      .email-text { color: #a1a1aa !important; }
      .email-footer { color: #52525b !important; }
      .email-logo { background-color: #dc2626 !important; color: #ffffff !important; }
    }
  </style>
</head>
<body class="email-body" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 0; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Logo -->
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 32px;">
          <tr>
            <td class="email-logo" style="width: 48px; height: 48px; background-color: #b91c1c; color: #ffffff; font-weight: 900; font-size: 24px; line-height: 48px; text-align: center; border-radius: 10px;">K</td>
          </tr>
        </table>

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="email-card" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <h1 class="email-heading" style="color: #18181b; font-size: 26px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.5px;">Welcome to KidaMerch</h1>
              <p class="email-text" style="color: #71717a; font-size: 15px; margin: 0 0 16px 0; line-height: 1.6;">You're on the list. You'll be the first to know about upcoming drops, exclusive previews, and behind-the-scenes content from our studio.</p>
              <p class="email-text" style="color: #71717a; font-size: 15px; margin: 0; line-height: 1.6; font-weight: 600;">Stay tuned.</p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <p class="email-footer" style="color: #a1a1aa; font-size: 12px; margin-top: 32px; text-align: center;">&copy; ${new Date().getFullYear()} KidaMerch. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
