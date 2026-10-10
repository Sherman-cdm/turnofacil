const retired = () => Response.json({
  error: 'Esta recepción de demostración fue reemplazada por la agenda privada. Iniciá sesión desde la página principal.',
  agenda: '/agenda',
}, { status: 410, headers: { 'Cache-Control': 'no-store' } });
export const GET = retired;
export const POST = retired;
export const PATCH = retired;
export const DELETE = retired;
