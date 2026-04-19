import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "RIVISIG Consultores <noreply@rivisig.com>",
    to: email,
    subject: "Verifica tu correo electrónico — RIVISIG",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verifica tu correo</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.5px;">RIV</span><span style="font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">ISIG</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Hola, ${name}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Gracias por registrarte en RIVISIG Consultores. Para activar tu cuenta y comenzar a acceder a nuestros cursos, verifica tu correo electrónico haciendo clic en el botón de abajo.
              </p>
              <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
                Verificar correo electrónico
              </a>
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#2563eb;word-break:break-all;">
                ${verifyUrl}
              </p>
              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Este enlace expira en <strong>24 horas</strong>. Si no creaste esta cuenta, puedes ignorar este correo.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#fafafa;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                &copy; ${new Date().getFullYear()} RIVISIG Consultores. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
