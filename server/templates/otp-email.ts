export const otpEmailTemplate = (otp: string) => {
    const [d1, d2, d3, d4, d5, d6] = otp.split('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Junta Account</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f0f4f2;
      margin: 0;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .email-card {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      border: 0.5px solid #d1dbd6;
    }
    .email-header {
      background: #064e3b;
      padding: 36px 40px 32px;
      position: relative;
      overflow: hidden;
    }
    .header-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(16, 185, 129, 0.15);
    }
    .brand {
      color: #fff;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
      position: relative;
      z-index: 1;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-tagline {
      color: rgba(255, 255, 255, 0.55);
      font-size: 13px;
      margin-top: 6px;
      position: relative;
      z-index: 1;
      letter-spacing: 0.3px;
    }
    .email-body {
      padding: 40px 40px 32px;
    }
    .icon-wrap {
      width: 52px;
      height: 52px;
      background: #ecfdf5;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .email-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px;
      letter-spacing: -0.3px;
    }
    .email-desc {
      font-size: 15px;
      color: #64748b;
      line-height: 1.65;
      margin: 0 0 28px;
    }
    .otp-block {
      background: #f0fdf4;
      border: 1px dashed #6ee7b7;
      border-radius: 14px;
      padding: 28px 32px;
      margin-bottom: 28px;
      text-align: center;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: #059669;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .otp-digits {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .otp-digit {
      width: 46px;
      height: 54px;
      background: #fff;
      border: 1.5px solid #a7f3d0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 26px;
      font-weight: 800;
      color: #064e3b;
    }
    .otp-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
      font-size: 13px;
      color: #10b981;
      font-weight: 500;
    }
    .divider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .divider-line {
      flex: 1;
      height: 0.5px;
      background: #e2e8f0;
    }
    .divider-text {
      font-size: 12px;
      color: #94a3b8;
    }
    .notice {
      background: #fafafa;
      border-radius: 10px;
      border: 0.5px solid #e2e8f0;
      padding: 14px 16px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .email-footer {
      background: #f8fafc;
      border-top: 0.5px solid #e2e8f0;
      padding: 24px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-brand {
      font-size: 13px;
      font-weight: 700;
      color: #064e3b;
    }
    .footer-sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .footer-links {
      display: flex;
      gap: 16px;
    }
    .footer-link {
      font-size: 12px;
      color: #94a3b8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-card">
    <div class="email-header">
      <div class="brand">Junta</div>
      <div class="header-tagline">Environmental Platform for the Future</div>
    </div>
    <div class="email-body">
      <h1 class="email-title">Verify your account</h1>
      <p class="email-desc">Use the verification code below to complete your sign-up.</p>
      <div class="otp-block">
        <div class="otp-label">Your one-time code</div>
        <div class="otp-digits">
          <div class="otp-digit">${d1}</div>
          <div class="otp-digit">${d2}</div>
          <div class="otp-digit">${d3}</div>
          <div class="otp-digit">${d4}</div>
          <div class="otp-digit">${d5}</div>
          <div class="otp-digit">${d6}</div>
        </div>
        <div class="otp-timer">Expires in 10 minutes</div>
      </div>
    </div>
    <div class="email-footer">
      <div class="footer-brand">Junta</div>
      <div class="footer-sub">&copy; 2024 All rights reserved.</div>
    </div>
  </div>
</body>
</html>
  `;
};
