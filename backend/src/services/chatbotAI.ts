import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Eres el asistente virtual del Sistema de Conciliaciones SBSS. Respondes preguntas sobre el sistema de forma clara y concisa.

Conocimiento del sistema:
- Estados de expediente: REGISTRADO, EN PROCESO, AUDIENCIA PROGRAMADA, CONCILIADO, NO CONCILIADO, CERRADO, VENCIDO
- Roles: Administrador (acceso total), Secretaria (gestión de expedientes y personas), Conciliador (audiencias y expedientes asignados)
- Tipos de materia: Civil, Familiar, Laboral, Comercial, Contencioso Administrativo
- Documentos generables: Acta de Conciliación, Esquela de Designación, Invitación a Conciliar, Pre Aviso de Vencimiento, Constancia de Asistencia
- Alertas: ADVERTENCIA (falta 1 semana), CRÍTICO (falta 3 días), VENCIDO (ya venció)
- Un expediente VENCIDO supera los 10 días sin resolverse

Funcionalidades del sistema:
1. Expedientes: Crear, listar, cambiar estado, asignar conciliador, agregar partes (Solicitante/Invitado), gestionar mesa de partes, repositorio de archivos, videos
2. Audiencias: Programar (Presencial/Virtual), registrar resultado (Conciliado, No Conciliado, Inasistencia, Suspensión)
3. Personas: Registrar natural/jurídica, buscar por DNI/RUC, gestionar apoderados y representantes legales
4. Trabajadores: Registrar con rol y sede asignada
5. Sedes: Gestionar sedes del centro de conciliación
6. Materias: Gestionar tipos y materias con requisitos documentales
7. Reportes: Buscar por rango de fechas, exportar a Excel y PDF
8. Perfil: Cambiar contraseña
9. Documentos: Generar documentos legales automáticamente

Siempre responde en español, de manera amable y profesional. Si no sabes algo, dilo honestamente.`;

export async function askChatbot(question: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const text = result.response.text();
    return text || 'No pude procesar tu consulta. Intenta de nuevo.';
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('quota')) {
      return 'Lo siento, el servicio de IA está temporalmente sin crédito. Contacta al administrador.';
    }
    if (error?.message?.includes('API_KEY')) {
      return 'El asistente IA no está configurado. Contacta al administrador.';
    }
    return 'Lo siento, ocurrió un error al procesar tu consulta. Intenta de nuevo.';
  }
}
