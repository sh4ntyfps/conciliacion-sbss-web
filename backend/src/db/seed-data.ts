import 'dotenv/config';
import { query } from '../config/database';

async function seedData() {
  console.log('Insertando datos de prueba...');

  // Verificar que existan registros base
  const sedes = await query('SELECT id FROM sedes');
  if (sedes.rows.length === 0) { console.log('Ejecuta primero seed.ts'); process.exit(1); }

  // ===== PERSONAS =====
  const personasData = [
    { tipo: 'Natural', nombres: 'Juan', apellidos: 'Pérez García', dni: '12345678', telefono: '987654321', email: 'juan@email.com', direccion: 'Av. Los Olivos 456' },
    { tipo: 'Natural', nombres: 'María', apellidos: 'López Martínez', dni: '87654321', telefono: '976543210', email: 'maria@email.com', direccion: 'Jr. Las Flores 789' },
    { tipo: 'Natural', nombres: 'Pedro', apellidos: 'Ramírez Torres', dni: '45678912', telefono: '965432101', email: 'pedro@email.com', direccion: 'Calle Real 321' },
    { tipo: 'Natural', nombres: 'Ana', apellidos: 'Gutiérrez Silva', dni: '78912345', telefono: '954321012', email: 'ana@email.com', direccion: 'Av. Primavera 654' },
    { tipo: 'Natural', nombres: 'Luis', apellidos: 'Fernández Ríos', dni: '32165498', telefono: '943210123', email: 'luis@email.com', direccion: 'Pasaje Sol 987' },
    { tipo: 'Juridica', razon_social: 'Comercial del Norte SAC', ruc: '20123456789', telefono: '044-123789', email: 'contacto@comercialnorte.pe', direccion: 'Av. Industrial 1500' },
    { tipo: 'Juridica', razon_social: 'Servicios Generales EIRL', ruc: '20987654321', telefono: '044-456123', email: 'info@serviciosgenerales.pe', direccion: 'Jr. Comercio 250' },
    { tipo: 'Natural', nombres: 'Carmen', apellidos: 'Torres Mendoza', dni: '65498732', telefono: '932109876', email: 'carmen@email.com', direccion: 'Av. Central 111' },
    { tipo: 'Natural', nombres: 'José', apellidos: 'Vega Alarcón', dni: '15975346', telefono: '921098765', email: 'jose@email.com', direccion: 'Calle Las Palmeras 222' },
    { tipo: 'Juridica', razon_social: 'Inversiones Peruanas SA', ruc: '20456789012', telefono: '01-789456', email: 'inversiones@inversiones.pe', direccion: 'Av. Pardo 890' },
  ];

  const personaIds: number[] = [];
  for (const p of personasData) {
    if (p.tipo === 'Natural') {
      const r = await query(
        `INSERT INTO personas (tipo_persona, nombres, apellidos, dni, telefono, email, direccion)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [p.tipo, p.nombres, p.apellidos, p.dni, p.telefono, p.email, p.direccion]
      );
      personaIds.push(r.rows[0].id);
    } else {
      const r = await query(
        `INSERT INTO personas (tipo_persona, razon_social, ruc, telefono, email, direccion)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [p.tipo, p.razon_social, p.ruc, p.telefono, p.email, p.direccion]
      );
      personaIds.push(r.rows[0].id);
    }
  }
  console.log(`${personaIds.length} personas insertadas`);

  // ===== EXPEDIENTES =====
  const hoy = new Date();
  const expedientesData = [
    { num: 'EXP-2026-0001', materiaId: 1, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'REGISTRADO', motivo: 'Incumplimiento de contrato de arrendamiento', pretensiones: 'Pago de rentas impagas por S/ 15,000', fecha: new Date(hoy.getTime() - 2 * 86400000), solicitanteIdx: 0, invitadoIdx: 1 },
    { num: 'EXP-2026-0002', materiaId: 2, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'EN PROCESO', motivo: 'Deuda por préstamo personal', pretensiones: 'Cobro de S/ 8,000 más intereses', fecha: new Date(hoy.getTime() - 5 * 86400000), solicitanteIdx: 2, invitadoIdx: 3 },
    { num: 'EXP-2026-0003', materiaId: 3, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'AUDIENCIA PROGRAMADA', motivo: 'Tenencia de menor', pretensiones: 'Custodia del menor Juanito', fecha: new Date(hoy.getTime() - 3 * 86400000), solicitanteIdx: 4, invitadoIdx: 0 },
    { num: 'EXP-2026-0004', materiaId: 4, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'CONCILIADO', motivo: 'Pensión alimenticia', pretensiones: 'Fijación de pensión alimenticia mensual', fecha: new Date(hoy.getTime() - 15 * 86400000), solicitanteIdx: 7, invitadoIdx: 1 },
    { num: 'EXP-2026-0005', materiaId: 2, sedeId: 2, conciliadorId: 2, secretariaId: 3, estado: 'NO CONCILIADO', motivo: 'Cobro de facturas impagas', pretensiones: 'Pago de S/ 25,000 por servicios prestados', fecha: new Date(hoy.getTime() - 20 * 86400000), solicitanteIdx: 5, invitadoIdx: 6 },
    { num: 'EXP-2026-0006', materiaId: 1, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'CERRADO', motivo: 'Incumplimiento de acuerdo de pago', pretensiones: 'Cumplimiento de cronograma de pagos', fecha: new Date(hoy.getTime() - 30 * 86400000), solicitanteIdx: 1, invitadoIdx: 2 },
    { num: 'EXP-2026-0007', materiaId: 5, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'EN PROCESO', motivo: 'Contratación directa irregular', pretensiones: 'Reconocimiento de sobrecostos', fecha: new Date(hoy.getTime() - 7 * 86400000), solicitanteIdx: 8, invitadoIdx: 9 },
    { num: 'EXP-2026-0008', materiaId: 4, sedeId: 2, conciliadorId: 2, secretariaId: 3, estado: 'REGISTRADO', motivo: 'Aumento de pensión alimenticia', pretensiones: 'Incremento de S/ 500 a S/ 800 mensuales', fecha: new Date(hoy.getTime() - 1 * 86400000), solicitanteIdx: 3, invitadoIdx: 4 },
    { num: 'EXP-2026-0009', materiaId: 6, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'VENCIDO', motivo: 'Concurso público desierto', pretensiones: 'Declaratoria de nulidad', fecha: new Date(hoy.getTime() - 12 * 86400000), solicitanteIdx: 6, invitadoIdx: 5 },
    { num: 'EXP-2026-0010', materiaId: 1, sedeId: 1, conciliadorId: 2, secretariaId: 3, estado: 'REGISTRADO', motivo: 'Incumplimiento de contrato de obra', pretensiones: 'Ejecución de garantía por S/ 50,000', fecha: new Date(hoy.getTime() - 4 * 86400000), solicitanteIdx: 9, invitadoIdx: 0 },
  ];

  const expedienteIds: number[] = [];
  for (const e of expedientesData) {
    const r = await query(
      `INSERT INTO expedientes (numero_expediente, materia_id, sede_id, conciliador_id, secretaria_id, estado, motivo, pretensiones, fecha_creacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [e.num, e.materiaId, e.sedeId, e.conciliadorId, e.secretariaId, e.estado, e.motivo, e.pretensiones, e.fecha]
    );
    expedienteIds.push(r.rows[0].id);
  }
  console.log(`${expedienteIds.length} expedientes insertados`);

  // ===== PARTES EXPEDIENTE =====
  for (let i = 0; i < expedientesData.length; i++) {
    const e = expedientesData[i];
    await query(
      'INSERT INTO partes_expediente (expediente_id, persona_id, tipo_parte) VALUES ($1,$2,$3)',
      [expedienteIds[i], personaIds[e.solicitanteIdx], 'Solicitante']
    );
    await query(
      'INSERT INTO partes_expediente (expediente_id, persona_id, tipo_parte) VALUES ($1,$2,$3)',
      [expedienteIds[i], personaIds[e.invitadoIdx], 'Invitado']
    );
  }
  console.log('Partes de expediente insertadas');

  // ===== AUDIENCIAS =====
  const audienciasData = [
    { expedienteIdx: 2, fecha: new Date(hoy.getTime() + 3 * 86400000), modalidad: 'Presencial', estado: 'PROGRAMADA', observaciones: 'Audiencia de tenencia - Sala 1' },
    { expedienteIdx: 1, fecha: new Date(hoy.getTime() - 3 * 86400000), modalidad: 'Virtual', resultado: 'Falta de Acuerdo', estado: 'REALIZADA', observaciones: 'Las partes no llegaron a acuerdo' },
    { expedienteIdx: 3, fecha: new Date(hoy.getTime() - 10 * 86400000), modalidad: 'Presencial', resultado: 'Acuerdo Total', estado: 'REALIZADA', observaciones: 'Acuerdo por S/ 500 mensuales' },
    { expedienteIdx: 4, fecha: new Date(hoy.getTime() - 18 * 86400000), modalidad: 'Presencial', resultado: 'Falta de Acuerdo', estado: 'REALIZADA', observaciones: 'Invitado no aceptó propuesta' },
    { expedienteIdx: 5, fecha: new Date(hoy.getTime() - 25 * 86400000), modalidad: 'Presencial', resultado: 'Acuerdo Parcial', estado: 'REALIZADA', observaciones: 'Acuerdo en primera cuota' },
    { expedienteIdx: 6, fecha: new Date(hoy.getTime() + 5 * 86400000), modalidad: 'Virtual', estado: 'PROGRAMADA', observaciones: 'Audiencia virtual por Teams' },
    { expedienteIdx: 0, fecha: new Date(hoy.getTime() + 7 * 86400000), modalidad: 'Presencial', estado: 'PROGRAMADA', observaciones: 'Audiencia inicial - Sala 2' },
  ];

  for (const a of audienciasData) {
    const expId = expedienteIds[a.expedienteIdx];
    if (a.estado === 'REALIZADA') {
      await query(
        `INSERT INTO audiencias (expediente_id, fecha, modalidad, resultado, observaciones, estado)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [expId, a.fecha, a.modalidad, a.resultado, a.observaciones, a.estado]
      );
    } else {
      await query(
        `INSERT INTO audiencias (expediente_id, fecha, modalidad, observaciones, estado)
         VALUES ($1,$2,$3,$4,$5)`,
        [expId, a.fecha, a.modalidad, a.observaciones, a.estado]
      );
    }
  }
  console.log(`${audienciasData.length} audiencias insertadas`);

  console.log('\nDatos de prueba insertados correctamente!');
  console.log('Resumen:');
  console.log(`  - ${personaIds.length} personas`);
  console.log(`  - ${expedienteIds.length} expedientes`);
  console.log(`  - ${audienciasData.length} audiencias`);
}

seedData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error insertando datos de prueba:', err);
    process.exit(1);
  });
