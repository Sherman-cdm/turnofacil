# TurnoFácil AI — agenda con IA

Repositorio oficial: https://github.com/Sherman-cdm/turnofacil (rama main). Vercel está conectado a este repositorio para los próximos despliegues.

Aplicación de agenda privada y reservas. La página principal abre el acceso a la agenda; ya no ofrece servicios de agencia, planes comerciales ni una demo de ventas.

## Funcionalidad

- Cuentas reales Supabase con confirmación de correo y aislamiento por propietario.
- Agenda con filtros de fecha y estado; configuración de negocio, servicios y horarios.
- Asistente IA privado que consulta el catálogo, franjas y próximos turnos del negocio autorizado. No envía datos de clientes al modelo.
- Publicación opcional del enlace de reservas; horarios reales y confirmación persistida con protección contra conflictos.
- Asistente público limitado al catálogo y disponibilidad del negocio publicado.
- La IA orienta y consulta; guardar o cancelar turnos requiere acciones explícitas.

## Ejecutar

Copiar .env.example a .env.local y configurar los secretos desde el entorno seguro.

    npm install
    npm run dev
    npm run lint
    npx tsc --noEmit
    npm run build
    npm start

## Activación

Entrar desde / o /agenda, confirmar el correo, configurar el negocio y sus servicios/horarios reales. Para recibir reservas, activar su publicación y compartir /reservar/{id}. Sin alta del negocio no se muestran citas ficticias.

## Backend y seguridad

Supabase jqryklutugartxaqtkuo. Esquema versionado original: negocios, servicios, horarios_atencion y turnos; RLS por owner_id. Un turno activo simultáneo por negocio. Secretos sólo en servidor, validación Zod, límites de solicitudes/cuerpo y WAF Vercel.

La recepción experimental con cookie fija, semillas en memoria y correos sin enviar fue retirada de las APIs públicas: sus endpoints responden 410. Su código de componentes queda conservado para adaptación, pero no se usa en la aplicación. La propuesta SQL insegura no aplicada se conserva fuera de migrations en archived-proposals; no ejecutarla. No hay proveedor de recordatorios ni envío automático habilitado.

No se garantiza protección absoluta contra ataques. La CSP admite inline por el prerender de Next.js. Zoho y alta del propietario real son pasos de cuenta externos: no declararlos operativos sin prueba.
