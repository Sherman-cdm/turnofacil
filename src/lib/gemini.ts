import { GoogleGenAI, Type } from '@google/genai';
import { env } from '@/env';
import { SERVICIOS_ESTETICA_PIES } from './servicios-estetica';
import { getTurnos, getClientes, getRecordatoriosPendientes } from './turnofa-store';
import { generateReminderEmailHtml } from './email-reminder';

const geminiApiKey = env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(
  geminiApiKey && !geminiApiKey.includes('your-gemini-api-key')
);

export async function executeTurnofaTool(name: string, args: Record<string, unknown>) {
  if (name === 'listar_servicios_estetica') {
    return {
      servicios: SERVICIOS_ESTETICA_PIES,
      mensaje: 'Servicios especializados en estética de pies y podología disponibles en TURNOFA.'
    };
  }

  if (name === 'consultar_turnos') {
    const fecha = typeof args.fecha === 'string' ? args.fecha : undefined;
    const turnos = await getTurnos({ fecha });
    return {
      total: turnos.length,
      turnos: turnos.map(t => ({
        id: t.id,
        cliente: t.cliente_nombre,
        servicio: t.servicio,
        fecha_hora: t.fecha_hora,
        estado: t.estado,
        telefono: t.cliente_telefono,
        email: t.cliente_email,
        recordatorio_1dia: t.recordatorio_1dia_enviado ? 'Enviado' : 'Pendiente',
        recordatorio_momento: t.recordatorio_momento_enviado ? 'Enviado' : 'Pendiente'
      })),
      mensaje: `Se encontraron ${turnos.length} turnos agendados.`
    };
  }

  if (name === 'consultar_clientes') {
    const busqueda = typeof args.busqueda === 'string' ? args.busqueda : undefined;
    const clientes = await getClientes(busqueda);
    return {
      total: clientes.length,
      clientes: clientes.slice(0, 10).map(c => ({
        nombre: c.nombre,
        dni: c.dni,
        telefono: c.telefono,
        email: c.email,
        notas: c.notas
      })),
      mensaje: `Se encontraron ${clientes.length} clientes registrados en TURNOFA.`
    };
  }

  if (name === 'consultar_recordatorios_pendientes') {
    const { pendientes1Dia, pendientesMomento } = await getRecordatoriosPendientes();
    return {
      pendientes_24h_antes: pendientes1Dia.map(t => ({
        id: t.id,
        cliente: t.cliente_nombre,
        email: t.cliente_email,
        fecha_hora: t.fecha_hora,
        servicio: t.servicio
      })),
      pendientes_momento_turno: pendientesMomento.map(t => ({
        id: t.id,
        cliente: t.cliente_nombre,
        email: t.cliente_email,
        fecha_hora: t.fecha_hora,
        servicio: t.servicio
      })),
      mensaje: `Hay ${pendientes1Dia.length} turnos de mañana pendientes de recordatorio y ${pendientesMomento.length} turnos de hoy pendientes.`
    };
  }

  if (name === 'redactar_recordatorio_gmail') {
    const turnoId = String(args.turno_id || '');
    const tipo = (args.tipo === 'momento_turno' ? 'momento_turno' : '1_dia_antes') as '1_dia_antes' | 'momento_turno';
    const turnos = await getTurnos();
    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) {
      return { exito: false, mensaje: 'No se encontró el turno especificado.' };
    }
    const { asunto } = generateReminderEmailHtml(turno, tipo);
    return {
      exito: true,
      destinatario: turno.cliente_email,
      asunto,
      vista_previa: `Correo listo para ${turno.cliente_nombre} (${turno.cliente_email}). Asunto: ${asunto}`
    };
  }

  return { error: `Herramienta desconocida: ${name}` };
}

export async function askTurnofaAI(messages: { role: string; content: string }[]) {
  if (!isGeminiConfigured) {
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    if (lastMsg.includes('servicio') || lastMsg.includes('precio') || lastMsg.includes('tratamiento')) {
      return 'En TURNOFA ofrecemos servicios especializados para el cuidado de los pies:\n' +
        '• Belleza y Spa de Pies Deluxe ($18.000 - 50 min)\n' +
        '• Pedicuría Clínica & Talones Agrietados ($16.000 - 45 min)\n' +
        '• Tratamiento de Uña Encarnada ($20.000 - 40 min)\n' +
        '• Esmaltado Semipermanente de Pies ($15.000 - 45 min)\n' +
        '• Reflexología Podal y Masaje Descongestivo ($14.000 - 35 min)\n' +
        '• Reconstrucción Ungueal ($12.000 - 30 min)\n' +
        '¿Deseás agendar un turno para algún cliente?';
    }
    if (lastMsg.includes('recordatorio') || lastMsg.includes('gmail') || lastMsg.includes('aviso')) {
      return 'El sistema de recordatorios de TURNOFA envía alertas por Gmail en dos momentos clave:\n' +
        '1. **1 día antes del turno**: Para que el cliente confirme y prepare su asistencia con calzado cómodo.\n' +
        '2. **En el momento del turno**: Para avisar que el gabinete de podología y la especialista están listos.\n' +
        'Podés consultar los recordatorios pendientes desde la pestaña "Recordatorios Gmail".';
    }
    return '¡Hola! Soy el Asistente IA de TURNOFA para la recepción de estética de pies y podología. Puedo ayudarte a consultar turnos, verificar datos de clientes (DNI, Gmail, teléfono), revisar los recordatorios automáticos por correo o asesorarte sobre los tratamientos. ¿En qué te ayudo hoy?';
  }

  const ai = new GoogleGenAI({ apiKey: geminiApiKey, httpOptions: { timeout: 20_000 } });

  const systemInstruction = `Sos el asistente inteligente de la recepción de "TURNOFA", un centro exclusivo de estética de pies, pedicuría clínica y podología.
Tu misión es asistir activamente a la recepción:
1. Conocer al detalle los servicios: Belleza y Spa Deluxe, Pedicuría Clínica, Uñas Encarnadas, Esmaltado Semipermanente, Reflexología Podal y Reconstrucción Ungueal.
2. Ayudar a la recepción a coordinar turnos, consultar clientes (por nombre, DNI, teléfono o Gmail) y redactar recordatorios cordiales.
3. El sistema cuenta con recordatorios automáticos vía Gmail que se envían:
   - 1 día antes del turno (24h de anticipación).
   - En el momento del turno (día de la cita).
4. Mantené un tono profesional, empático, cálido y elegante en español rioplatense/latinoamericano.
5. Usá las herramientas provistas cuando el usuario pregunte por turnos, clientes, servicios o recordatorios.`;

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 1000,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'listar_servicios_estetica',
                description: 'Obtiene la lista oficial de servicios de estética de pies, duración y precios.',
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: 'consultar_turnos',
                description: 'Consulta los turnos agendados en TURNOFA.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    fecha: { type: Type.STRING, description: 'Fecha opcional en formato YYYY-MM-DD' }
                  }
                }
              },
              {
                name: 'consultar_clientes',
                description: 'Busca clientes registrados por DNI, nombre, teléfono o Gmail.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    busqueda: { type: Type.STRING, description: 'Término de búsqueda: DNI, nombre o Gmail' }
                  }
                }
              },
              {
                name: 'consultar_recordatorios_pendientes',
                description: 'Consulta turnos que necesitan envío de recordatorio por Gmail (1 día antes o momento del turno).',
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: 'redactar_recordatorio_gmail',
                description: 'Genera el contenido del recordatorio por correo para un turno específico.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    turno_id: { type: Type.STRING, description: 'ID del turno' },
                    tipo: { type: Type.STRING, description: '1_dia_antes o momento_turno' }
                  },
                  required: ['turno_id', 'tipo']
                }
              }
            ]
          }
        ]
      }
    });

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const results: string[] = [];
      for (const call of functionCalls) {
        const toolResult = await executeTurnofaTool(call.name || '', call.args || {});
        results.push(JSON.stringify(toolResult));
      }
      // Generar respuesta explicativa a partir de la ejecución de herramientas
      const followUp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...contents,
          { role: 'model', parts: [{ text: 'Consulté el sistema de TURNOFA.' }] },
          { role: 'user', parts: [{ text: `Resultados del sistema: ${results.join('\n')}. Respondé de forma cordial y concisa a la recepcionista.` }] }
        ],
        config: { systemInstruction, temperature: 0.3, maxOutputTokens: 800 }
      });
      return followUp.text?.trim() || 'Consulta procesada con éxito en TURNOFA.';
    }

    return response.text?.trim() || 'TURNOFA IA a tu disposición para la agenda de estética de pies.';
  } catch {
    console.error('Gemini Turnofa request failed');
    return 'Hola, el asistente IA de TURNOFA está activo. Podés consultar tus turnos, clientes y recordatorios en los paneles principales.';
  }
}
