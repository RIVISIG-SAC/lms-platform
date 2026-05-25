import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
) {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: email,
    subject: 'Verifica tu correo electrónico — RIVISIG',
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

export async function sendAdminEnrollmentEmail(
  email: string,
  name: string,
  courseTitle: string,
  tempPassword: string | null,
) {
  const loginUrl = `${getAppUrl()}/login`;
  const isNewAccount = tempPassword !== null;

  const credentialsBlock = isNewAccount
    ? `
              <div style="margin:0 0 24px;padding:16px 20px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">
                  Tus credenciales de acceso
                </p>
                <p style="margin:0 0 4px;font-size:14px;color:#18181b;">
                  <strong>Correo:</strong> ${email}
                </p>
                <p style="margin:0;font-size:14px;color:#18181b;">
                  <strong>Contraseña temporal:</strong>
                  <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#ffffff;border:1px solid #e4e4e7;border-radius:6px;padding:2px 8px;margin-left:4px;">${tempPassword}</span>
                </p>
              </div>
              <p style="margin:0 0 24px;font-size:13px;color:#71717a;">
                Por seguridad, te recomendamos cambiar tu contraseña al iniciar sesión.
              </p>`
    : "";

  const intro = isNewAccount
    ? `Nuestro equipo ha creado una cuenta para ti y te ha inscrito en el curso <strong>${courseTitle}</strong>. Ya puedes ingresar a la plataforma con las credenciales que aparecen a continuación.`
    : `Te confirmamos que has sido inscrito en el curso <strong>${courseTitle}</strong>. Ya puedes acceder al contenido desde tu panel de estudiante.`;

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: email,
    subject: `Has sido inscrito en ${courseTitle} — RIVISIG`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscripción confirmada</title>
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
                ${intro}
              </p>
              ${credentialsBlock}
              <a href="${loginUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
                Ingresar a la plataforma
              </a>
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0;font-size:13px;color:#2563eb;word-break:break-all;">
                ${loginUrl}
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

function getSupportEmail() {
  return process.env.SUPPORT_EMAIL ?? 'soporte@rivisig.com';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendSupportEmail({
  fromEmail,
  fromName,
  subject,
  message,
}: {
  fromEmail: string;
  fromName: string;
  subject: string;
  message: string;
}) {
  const safeSubject = escapeHtml(subject);
  const safeName = escapeHtml(fromName);
  const safeEmail = escapeHtml(fromEmail);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: getSupportEmail(),
    replyTo: fromEmail,
    subject: `[Soporte] ${subject} — ${fromName}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo mensaje de soporte</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.5px;">RIV</span><span style="font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">ISIG</span>
              <p style="margin:8px 0 0;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Nuevo mensaje de soporte</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;">
              <div style="margin:0 0 20px;padding:16px 20px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Remitente</p>
                <p style="margin:0 0 4px;font-size:14px;color:#18181b;"><strong>${safeName}</strong></p>
                <p style="margin:0;font-size:13px;color:#2563eb;">${safeEmail}</p>
              </div>
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Asunto</p>
              <p style="margin:0 0 20px;font-size:15px;color:#18181b;font-weight:600;">${safeSubject}</p>
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Mensaje</p>
              <div style="margin:0;padding:16px 20px;background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;font-size:14px;color:#27272a;line-height:1.6;">
                ${safeMessage}
              </div>
              <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">
                Puedes responder directamente a este correo: la respuesta llegará a ${safeEmail}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background:#fafafa;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                &copy; ${new Date().getFullYear()} RIVISIG Consultores. Mensaje enviado desde el panel del estudiante.
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

export async function sendCertificateIssuedEmail(
  email: string,
  name: string,
  courseTitle: string,
  verificationCode: string,
) {
  const certificatesUrl = `${getAppUrl()}/student/certificates`;
  const verifyUrl = `${getAppUrl()}/verificar/${verificationCode}`;
  const safeCourse = escapeHtml(courseTitle);
  const safeName = escapeHtml(name);
  const safeCode = escapeHtml(verificationCode);

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: email,
    subject: `Certificado emitido: ${courseTitle} — RIVISIG`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificado emitido</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.5px;">RIV</span><span style="font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">ISIG</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Hola, ${safeName}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Te confirmamos que tu certificado del curso <strong>${safeCourse}</strong> ha sido emitido y ya está disponible en tu panel.
              </p>
              <div style="margin:0 0 24px;padding:16px 20px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">
                  Código de verificación
                </p>
                <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;font-weight:600;color:#18181b;letter-spacing:1px;">
                  ${safeCode}
                </p>
              </div>
              <a href="${certificatesUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
                Ver mi certificado
              </a>
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;">
                Cualquier persona puede verificar la autenticidad del certificado en:
              </p>
              <p style="margin:0;font-size:13px;color:#2563eb;word-break:break-all;">
                ${verifyUrl}
              </p>
            </td>
          </tr>
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

export async function sendAccessExpiringEmail(
  email: string,
  name: string,
  courseTitle: string,
  daysLeft: number,
) {
  const courseUrl = `${getAppUrl()}/student/my-courses`;
  const safeCourse = escapeHtml(courseTitle);
  const safeName = escapeHtml(name);

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: email,
    subject: `Tu acceso al curso vence en ${daysLeft} día(s) — RIVISIG`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Acceso por vencer</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.5px;">RIV</span><span style="font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">ISIG</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Hola, ${safeName}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Te recordamos que tu período de acceso al curso <strong>${safeCourse}</strong> vence en <strong>${daysLeft} día(s)</strong>. Una vez expirado, perderás el acceso al contenido y deberás recomprarlo si deseas continuar.
              </p>
              <a href="${courseUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
                Continuar el curso
              </a>
              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Si ya completaste el curso y aprobaste la evaluación, este aviso no afectará tu certificado.
              </p>
            </td>
          </tr>
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

export async function sendPasswordExpiringEmail(
  email: string,
  name: string,
  daysLeft: number,
) {
  const profileUrl = `${getAppUrl()}/student/profile`;
  const safeName = escapeHtml(name);

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: email,
    subject: `Tu contraseña vence en ${daysLeft} día(s) — RIVISIG`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contraseña por vencer</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f4f4f5;">
              <span style="font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.5px;">RIV</span><span style="font-size:20px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">ISIG</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Hola, ${safeName}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Por seguridad, las contraseñas en nuestra plataforma vencen periódicamente. La tuya expira en <strong>${daysLeft} día(s)</strong>. Te recomendamos actualizarla cuanto antes para no perder el acceso a tu cuenta.
              </p>
              <a href="${profileUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
                Cambiar mi contraseña
              </a>
              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Si no actualizas tu contraseña a tiempo, deberás restablecerla usando la opción "Olvidé mi contraseña" en el login.
              </p>
            </td>
          </tr>
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

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
) {
  const resetUrl = `${getAppUrl()}/recuperar/${token}`;

  await resend.emails.send({
    from: 'RIVISIG Consultores <onboarding@resend.dev>',
    to: email,
    subject: 'Restablece tu contraseña — RIVISIG',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablece tu contraseña</title>
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
                Solicitaste restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-bottom:24px;">
                Restablecer contraseña
              </a>
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#2563eb;word-break:break-all;">
                ${resetUrl}
              </p>
              <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;">
                Este enlace expira en <strong>1 hora</strong>.
              </p>
              <p style="margin:0;font-size:13px;color:#a1a1aa;">
                Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta sigue segura.
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
