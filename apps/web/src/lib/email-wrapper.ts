const ACCENT = "#00e87b";

const LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
  <rect width="32" height="32" rx="8.5" fill="${ACCENT}"/>
  <path d="M 16 25 A 9 9 0 1 0 7 16" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M 4.5 18.5 L 7 16 L 9.5 18.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

export function wrapEmail(inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #eef0f3;padding:32px;">
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
                  ${LOGO_SVG}
                  <span style="font-weight:700;font-size:15px;color:#0f172a;vertical-align:middle;margin-left:8px;">dunlo</span>
                </div>
                ${inner}
                <p style="margin-top:32px;font-size:12px;color:#94a3b8;">If you didn't expect this email, you can safely ignore it.</p>
              </td>
            </tr>
          </table>
          <p style="margin-top:16px;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Dunlo</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
