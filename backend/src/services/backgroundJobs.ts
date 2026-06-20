import { query } from '../config/database';

export async function marcarExpedientesVencidos() {
  console.log('[Background] Revisando expedientes vencidos...');
  const result = await query(
    `UPDATE expedientes SET estado = 'VENCIDO'
     WHERE estado NOT IN ('CERRADO','VENCIDO','CONCILIADO','NO CONCILIADO')
     AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - fecha_creacion)) >= 10
     RETURNING id`
  );
  if (result.rows.length > 0) {
    console.log(`[Background] ${result.rows.length} expediente(s) marcado(s) como VENCIDO`);
  }
}

export function startBackgroundJobs() {
  marcarExpedientesVencidos();
  setInterval(marcarExpedientesVencidos, 6 * 60 * 60 * 1000);
  console.log('[Background] Jobs iniciados (cada 6 horas)');
}
