export function generateWinBackEmail(options: {
  htmlBody: string;
  unsubscribeUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background-color:#f4f7fa;">
  <table role="presentation" style="width:100%; border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px; max-width:100%; border-collapse:collapse; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:40px 40px 30px; text-align:center; background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%); border-radius:12px 12px 0 0;">
              <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700;">Receipt Generator</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px; font-size:15px; line-height:1.6; color:#374151;">
              ${options.htmlBody}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px; text-align:center; background-color:#f8fafc; border-radius:0 0 12px 12px;">
              <p style="margin:0 0 8px; color:#64748b; font-size:13px;">
                <a href="mailto:contact@receiptgenerator.net" style="color:#0d9488; text-decoration:none;">contact@receiptgenerator.net</a>
              </p>
              <p style="margin:0 0 8px; color:#94a3b8; font-size:12px;">
                &copy; ${new Date().getFullYear()} Receipt Generator. All rights reserved.
              </p>
              <p style="margin:0; color:#94a3b8; font-size:11px;">
                <a href="${options.unsubscribeUrl}" style="color:#94a3b8; text-decoration:underline;">Unsubscribe</a> from these emails
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
