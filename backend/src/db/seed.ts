import 'dotenv/config';
import { query } from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  await query(`INSERT INTO tipos_materia (nombre) VALUES
    ('Civil / Comercial'), ('Familia'), ('Contrataciones con el Estado')
    ON CONFLICT DO NOTHING`);

  const hash = await bcrypt.hash('admin123', 10);

  await query(`INSERT INTO sedes (nombre, direccion, telefono) VALUES
    ('Sede Principal - Trujillo', 'Av. Espa\u00f1a 1234', '044-123456'),
    ('Sede Secundaria - Lima', 'Av. Arequipa 567', '01-789012')
    ON CONFLICT DO NOTHING`);

  const admin = await query(`SELECT id FROM trabajadores WHERE dni = '00000001'`);
  if (admin.rows.length === 0) {
    const t = await query(
      `INSERT INTO trabajadores (nombres, apellidos, dni, email, rol, sede_id)
       VALUES ('Admin', 'Principal', '00000001', 'admin@sbss.pe', 'Administrador', 1)
       RETURNING id`
    );
    await query('INSERT INTO usuarios (trabajador_id, email, password_hash) VALUES ($1, $2, $3)',
      [t.rows[0].id, 'admin@sbss.pe', hash]);

    const c = await query(
      `INSERT INTO trabajadores (nombres, apellidos, dni, email, rol, sede_id, registro_civil_comercial)
       VALUES ('Carlos', 'Conciliador', '00000002', 'carlos@sbss.pe', 'Conciliador', 1, 'RC-001')
       RETURNING id`
    );
    await query('INSERT INTO usuarios (trabajador_id, email, password_hash) VALUES ($1, $2, $3)',
      [c.rows[0].id, 'carlos@sbss.pe', hash]);

    const s = await query(
      `INSERT INTO trabajadores (nombres, apellidos, dni, email, rol, sede_id)
       VALUES ('Sofia', 'Secretaria', '00000003', 'sofia@sbss.pe', 'Secretaria', 1)
       RETURNING id`
    );
    await query('INSERT INTO usuarios (trabajador_id, email, password_hash) VALUES ($1, $2, $3)',
      [s.rows[0].id, 'sofia@sbss.pe', hash]);
  }

  await query(`INSERT INTO materias (tipo_materia_id, nombre) VALUES
    (1, 'Incumplimiento Contractual'), (1, 'Cobro de Deudas'),
    (2, 'Tenencia'), (2, 'Alimentos'),
    (3, 'Contratacion Directa'), (3, 'Concurso Publico')
    ON CONFLICT DO NOTHING`);

  console.log('Seed completed successfully');
  console.log('Usuarios:');
  console.log('  admin@sbss.pe / admin123 (Administrador)');
  console.log('  carlos@sbss.pe / admin123 (Conciliador)');
  console.log('  sofia@sbss.pe / admin123 (Secretaria)');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
