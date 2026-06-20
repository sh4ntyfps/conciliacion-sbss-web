import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { sessionAuth } from '../middleware/auth';
import { validate } from '../validators/middleware';
import { chatbotAskSchema } from '../validators/schemas';
import { askChatbot } from '../services/chatbotAI';

const router = Router();

router.get('/context', sessionAuth, async (req: Request, res: Response) => {
  const inc = await query(
    `SELECT
      SUM(CASE WHEN estado NOT IN ('CERRADO','VENCIDO','CONCILIADO','NO CONCILIADO') THEN 1 ELSE 0 END) AS activos,
      COUNT(*) AS total
    FROM expedientes WHERE activo = true AND sede_id = $1`,
    [req.usuario!.sedeId]
  );

  const alerts = await query(
    `SELECT COUNT(*) AS alertas FROM vw_expedientes_con_alerta
     WHERE alerta_vencimiento IN ('ADVERTENCIA','CRITICO') AND sede_id = $1`,
    [req.usuario!.sedeId]
  );

  res.json({
    usuario: `${req.usuario!.rol} en sede ${req.usuario!.sedeId}`,
    ...inc.rows[0],
    ...alerts.rows[0],
  });
});

router.post('/ask', sessionAuth, validate(chatbotAskSchema), async (req: Request, res: Response) => {
  const { question } = req.body;

  const q = question.toLowerCase();

  interface FaqEntry { keywords: string[]; a: string }
  const SYSTEM_KNOWLEDGE: FaqEntry[] = [
    { keywords: ['crear expediente', 'nuevo expediente', 'como se crea un expediente', 'registrar expediente'], a: 'Vaya a Expedientes > Nuevo Expediente. Seleccione materia, sede, tipo de materia, y complete los datos solicitados. Luego haga clic en "Crear Expediente".' },
    { keywords: ['asignar conciliador', 'designar conciliador'], a: 'En el detalle del expediente, use la sección "Asignar Conciliador", seleccione un conciliador disponible de la lista y haga clic en "Asignar".' },
    { keywords: ['estados del expediente', 'que estados', 'etapas'], a: 'Los estados son: REGISTRADO, EN PROCESO, AUDIENCIA PROGRAMADA, CONCILIADO, NO CONCILIADO, CERRADO y VENCIDO.' },
    { keywords: ['registrar audiencia', 'programar audiencia', 'crear audiencia', 'agendar audiencia'], a: 'Vaya a Audiencias, seleccione el expediente con audiencia pendiente, ingrese fecha, hora, modalidad (Presencial/Virtual) y guarde.' },
    { keywords: ['crear persona', 'nueva persona', 'registrar persona', 'crear natural', 'crear juridica'], a: 'Vaya a Personas > Nueva Persona. Seleccione Persona Natural o Jurídica, complete los datos y guarde.' },
    { keywords: ['generar reportes', 'exportar reporte', 'reporte excel', 'reporte pdf'], a: 'Vaya a Reportes, seleccione el rango de fechas y haga clic en "Buscar". Luego puede exportar a Excel o PDF.' },
    { keywords: ['roles', 'roles del sistema', 'permisos'], a: 'Existen 3 roles: Administrador (acceso total), Secretaria (gestión de expedientes y personas), Conciliador (gestión de audiencias y expedientes asignados).' },
    { keywords: ['alerta vencimiento', 'vencimiento', 'alerta'], a: 'ADVERTENCIA = falta 1 semana, CRÍTICO = faltan 3 días, VENCIDO = ya venció el plazo de 10 días.' },
    { keywords: ['cambiar contraseña', 'cambiar password', 'cambiar contrasena', 'nueva contraseña'], a: 'Vaya a Mi Perfil, use la sección "Cambiar Contraseña", ingrese su contraseña actual y la nueva contraseña.' },
    { keywords: ['documentos disponibles', 'generar documento', 'que documentos', 'tipo de documento', 'acta', 'esquela', 'invitacion', 'pre aviso', 'constancia'], a: 'Acta de Conciliación, Esquela de Designación, Invitación a Conciliar, Pre Aviso de Vencimiento y Constancia de Asistencia. Se generan desde la pestaña Documentos del detalle del expediente.' },
    { keywords: ['crear persona', 'crear una persona', 'nueva persona', 'registrar persona', 'crear natural', 'crear juridica'], a: 'Vaya a Personas > Nueva Persona. Seleccione Persona Natural o Jurídica, complete los datos y guarde.' },
    { keywords: ['crear', 'como se crea', 'como crear', 'como registro', 'como hago', 'creame'], a: '¿Sobre qué tema? Puedo ayudarte a crear expedientes, personas, programar audiencias o generar documentos. Pregúntame específicamente.' },
    { keywords: ['expediente', 'caso', 'exp'], a: 'Puedo ayudarte con los expedientes. ¿Qué necesitas? Puedo explicarte cómo crear un expediente, asignar conciliador, cambiar estados, o revisar el detalle de un caso.' },
    { keywords: ['audiencia', 'audiencias'], a: 'Para programar una audiencia vaya a Audiencias, seleccione el expediente, elija fecha y modalidad. Luego de realizada, registre el resultado (Acuerdo Total, Acuerdo Parcial, Falta de Acuerdo, Inasistencia o Suspensión).' },
    { keywords: ['persona', 'personas', 'solicitante', 'invitado'], a: 'Vaya a Personas. Puede registrar personas naturales (con DNI) o jurídicas (con RUC). También puede gestionar apoderados y representantes legales.' },
    { keywords: ['reporte', 'reportes', 'informe'], a: 'Vaya a Reportes, seleccione el rango de fechas y filtre por sede si lo desea. Puede exportar los resultados a Excel o PDF.' },
    { keywords: ['documento', 'documentos', 'descargar'], a: 'Los documentos disponibles son: Acta de Conciliación, Esquela de Designación, Invitación a Conciliar, Pre Aviso de Vencimiento y Constancia de Asistencia. Se generan desde la pestaña Documentos del detalle del expediente.' },
    { keywords: ['dashboard', 'indicadores', 'grafico'], a: 'El Dashboard muestra indicadores clave: total de expedientes, en proceso, pendientes, conciliados, no conciliados y cerrados. También incluye alertas de vencimiento.' },
    { keywords: ['conciliador', 'rol conciliador'], a: 'El Conciliador puede ver sus expedientes asignados, programar y registrar resultados de audiencias.' },
    { keywords: ['secretaria', 'rol secretaria'], a: 'La Secretaria puede crear y gestionar expedientes y personas.' },
    { keywords: ['administrador', 'rol administrador'], a: 'El Administrador tiene acceso total al sistema: expedientes, personas, trabajadores, sedes, materias y reportes.' },
  ];

  function findFaqMatch(query: string): string | null {
    let bestMatch: FaqEntry | null = null;
    let bestLen = 0;
    for (const entry of SYSTEM_KNOWLEDGE) {
      for (const kw of entry.keywords) {
        if (query.includes(kw) && kw.length > bestLen) {
          bestLen = kw.length;
          bestMatch = entry;
        }
      }
    }
    if (!bestMatch) return null;
    return bestMatch.a;
  }

  if (!process.env.GEMINI_API_KEY) {
    const match = findFaqMatch(q);
    if (match) return res.json({ answer: match });
    return res.json({ answer: 'No tengo información específica sobre esa consulta. Consulte el manual de usuario.' });
  }

  const answer = await askChatbot(question);
  if (answer.includes('sin crédito') || answer.includes('error') || answer.includes('Error')) {
    const match = findFaqMatch(q);
    if (match) return res.json({ answer: match });
    return res.json({ answer: 'No tengo información específica sobre esa consulta. Consulte el manual de usuario.' });
  }
  res.json({ answer });
});

export default router;
