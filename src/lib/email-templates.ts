export function getAdminInviteEmailHtml(inviteLink: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Invitation - KidaMerch</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c0c0c;
      color: #f3f3f3;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      display: inline-block;
      width: 40px;
      height: 40px;
      background-color: #f3f3f3;
      color: #0c0c0c;
      font-weight: 900;
      font-size: 20px;
      line-height: 40px;
      text-align: center;
      border-radius: 4px;
      text-decoration: none;
    }
    .content {
      background-color: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    p {
      color: #a1a1aa;
      font-size: 15px;
      margin-bottom: 32px;
    }
    .button {
      display: inline-block;
      background-color: #f3f3f3;
      color: #0c0c0c !important;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #52525b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">K</div>
    </div>
    <div class="content">
      <h1>You've been invited to KidaMerch</h1>
      <p>A superadmin has invited you to join the KidaMerch operations team. Click the button below to accept the invitation and access the admin dashboard.</p>
      <a href="${inviteLink}" class="button">Accept Invitation</a>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} KidaMerch. All rights reserved.
    </div>
  </div>
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
  <title>Welcome to KidaMerch</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c0c0c;
      color: #f3f3f3;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      display: inline-block;
      width: 40px;
      height: 40px;
      background-color: #f3f3f3;
      color: #0c0c0c;
      font-weight: 900;
      font-size: 20px;
      line-height: 40px;
      text-align: center;
      border-radius: 4px;
      text-decoration: none;
    }
    .content {
      background-color: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
    p {
      color: #a1a1aa;
      font-size: 15px;
      margin-bottom: 32px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #52525b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">K</div>
    </div>
    <div class="content">
      <h1>Welcome to KidaMerch</h1>
      <p>You're on the list. You'll be the first to know about upcoming drops, exclusive previews, and behind-the-scenes content from our studio.</p>
      <p>Stay tuned.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} KidaMerch. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}
