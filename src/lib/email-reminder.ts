import { Turno } from '@/types/turnofa';

export interface EmailResult {
  exito: boolean;
  asunto: string;
  destinatario: string;
  cuerpoHtml: string;
  mensaje: string;
  simulado: boolean;
}

export function generateReminderEmailHtml(turno: Turno, tipo: '1_dia_antes' | 'momento_turno'): { asunto: string; html: string } {
  const fechaObj = new Date(turno.fecha_hora);
  const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires'
  }).format(fechaObj);

  const horaFormateada = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  }).format(fechaObj);

  const esPrevio = tipo === '1_dia_antes';
  const asunto = esPrevio
    ? `🗓️ Recordatorio: Mañana tenés tu turno en TURNOFA (${horaFormateada} hs)`
    : `✨ ¡Es el momento de tu turno en TURNOFA! Te esperamos (${horaFormateada} hs)`;

  const tituloBanner = esPrevio
    ? 'Recordatorio de tu Turno para Mañana'
    : '¡Te esperamos hoy en TURNOFA!';

  const subtitulo = esPrevio
    ? 'Queremos recordarte tu cita programada para el cuidado y belleza de tus pies.'
    : 'Todo está listo para tu sesión de estética podológica y relax.';

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${asunto}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0fdfa; color: #134e4a; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(13, 148, 136, 0.1); border: 1px solid #ccfbf1; }
    .header { background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%); padding: 30px; text-align: center; color: #ffffff; }
    .logo-text { font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 0; }
    .tagline { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; margin-top: 5px; }
    .content { padding: 30px; }
    .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; }
    .details-box { background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 18px; border-radius: 8px; margin: 20px 0; }
    .detail-item { margin: 8px 0; font-size: 15px; color: #334155; }
    .detail-item strong { color: #0f172a; }
    .tips-box { background-color: #ecfdf5; border: 1px dashed #34d399; padding: 15px; border-radius: 8px; font-size: 13.5px; color: #065f46; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-weight: 700; border-radius: 9999px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-text">TURNOFA</div>
      <div class="tagline">Estética de Pies & Podología Especializada</div>
      <h2 style="margin: 15px 0 5px 0; font-size: 22px;">${tituloBanner}</h2>
      <p style="margin: 0; font-size: 14px; opacity: 0.95;">${subtitulo}</p>
    </div>
    <div class="content">
      <p class="greeting">Hola, ${turno.cliente_nombre}</p>
      <p style="color: #475569; line-height: 1.6;">
        ${esPrevio 
          ? 'Te recordamos que tenés agendada una cita para consentir y cuidar la salud de tus pies.' 
          : '¡Llegó la hora de tu cita! La especialista y el gabinete ya se encuentran preparados para recibirte.'}
      </p>

      <div class="details-box">
        <div class="detail-item">🦶 <strong>Servicio:</strong> ${turno.servicio}</div>
        <div class="detail-item">📅 <strong>Fecha:</strong> ${fechaFormateada}</div>
        <div class="detail-item">⏰ <strong>Horario:</strong> ${horaFormateada} hs</div>
        <div class="detail-item">⏳ <strong>Duración estimada:</strong> ${turno.duracion_minutos} minutos</div>
        <div class="detail-item">📍 <strong>Lugar:</strong> Recepción Central TURNOFA</div>
      </div>

      <div class="tips-box">
        💡 <strong>Recomendación para tu sesión:</strong>
        <br />
        Si tu tratamiento incluye esmaltado o exfoliación profunda, te recomendamos asistir con calzado cómodo o sandalias abiertas para el correcto secado.
      </div>

      <div style="text-align: center;">
        <a href="https://turnofacilia.online" class="btn">Ver Mi Reserva en TURNOFA</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 5px 0;">TURNOFA · Gestión de Turnos Inteligente para Estética de Pies</p>
      <p style="margin: 0;">Enviado a tu Gmail registrado: ${turno.cliente_email}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { asunto, html };
}

export async function sendGmailReminder(turno: Turno, tipo: '1_dia_antes' | 'momento_turno'): Promise<EmailResult> {
  const { asunto, html } = generateReminderEmailHtml(turno, tipo);
  
  // Si en el entorno se configuran credenciales SMTP o API de email, se puede despachar directamente.
  // Sin proveedor de correo configurado, sólo se devuelve el borrador. No se envió ningún mensaje.
  return {
    exito: false,
    asunto,
    destinatario: turno.cliente_email,
    cuerpoHtml: html,
    mensaje: 'Envío no configurado. Este contenido es un borrador; no se envió ningún correo.',
    simulado: true
  };
}
