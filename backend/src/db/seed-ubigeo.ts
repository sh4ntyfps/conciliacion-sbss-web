import 'dotenv/config';
import { query } from '../config/database';

async function seedUbigeo() {
  console.log('Importando ubigeo Perú...');

  // Departamentos
  await query(`INSERT INTO departamentos (nombre) VALUES
    ('AMAZONAS'),('ANCASH'),('APURIMAC'),('AREQUIPA'),('AYACUCHO'),
    ('CAJAMARCA'),('CALLAO'),('CUSCO'),('HUANCAVELICA'),('HUANUCO'),
    ('ICA'),('JUNIN'),('LA LIBERTAD'),('LAMBAYEQUE'),('LIMA'),
    ('LORETO'),('MADRE DE DIOS'),('MOQUEGUA'),('PASCO'),('PIURA'),
    ('PUNO'),('SAN MARTIN'),('TACNA'),('TUMBES'),('UCAYALI')
    ON CONFLICT DO NOTHING`);

  // Provincias (simplificadas - principales)
  const provincias: [string, string][] = [
    ['Chachapoyas','AMAZONAS'],['Bagua','AMAZONAS'],['Luya','AMAZONAS'],
    ['Huaraz','ANCASH'],['Santa','ANCASH'],['Huarmey','ANCASH'],
    ['Abancay','APURIMAC'],['Andahuaylas','APURIMAC'],
    ['Arequipa','AREQUIPA'],['Caylloma','AREQUIPA'],['Islay','AREQUIPA'],
    ['Huamanga','AYACUCHO'],['Huanta','AYACUCHO'],
    ['Cajamarca','CAJAMARCA'],['Jaen','CAJAMARCA'],['Chota','CAJAMARCA'],
    ['Callao','CALLAO'],
    ['Cusco','CUSCO'],['Urubamba','CUSCO'],['La Convencion','CUSCO'],
    ['Huancavelica','HUANCAVELICA'],['Angaraes','HUANCAVELICA'],
    ['Huanuco','HUANUCO'],['Leoncio Prado','HUANUCO'],
    ['Ica','ICA'],['Chincha','ICA'],['Pisco','ICA'],
    ['Huancayo','JUNIN'],['Tarma','JUNIN'],['Chanchamayo','JUNIN'],
    ['Trujillo','LA LIBERTAD'],['Chepen','LA LIBERTAD'],['Pacasmayo','LA LIBERTAD'],
    ['Chiclayo','LAMBAYEQUE'],['Lambayeque','LAMBAYEQUE'],
    ['Lima','LIMA'],['Barranca','LIMA'],['Canete','LIMA'],['Canta','LIMA'],['Huarochiri','LIMA'],['Huaura','LIMA'],
    ['Maynas','LORETO'],['Alto Amazonas','LORETO'],
    ['Tambopata','MADRE DE DIOS'],['Manu','MADRE DE DIOS'],
    ['Mariscal Nieto','MOQUEGUA'],['Ilo','MOQUEGUA'],
    ['Pasco','PASCO'],['Oxapampa','PASCO'],
    ['Piura','PIURA'],['Sullana','PIURA'],['Talara','PIURA'],
    ['Puno','PUNO'],['Azangaro','PUNO'],['San Roman','PUNO'],
    ['Moyobamba','SAN MARTIN'],['San Martin','SAN MARTIN'],['Rioja','SAN MARTIN'],
    ['Tacna','TACNA'],['Jorge Basadre','TACNA'],
    ['Tumbes','TUMBES'],['Zarumilla','TUMBES'],
    ['Coronel Portillo','UCAYALI'],['Atalaya','UCAYALI'],
  ];

  for (const [prov, dep] of provincias) {
    const depResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [dep]);
    if (depResult.rows.length > 0) {
      await query('INSERT INTO provincias (nombre, departamento_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [prov, depResult.rows[0].id]);
    }
  }

  // Distritos principales (capitales + ciudades grandes)
  const distritos: [string, string][] = [
    ['Trujillo','Trujillo'],['El Porvenir','Trujillo'],['Florencia de Mora','Trujillo'],
    ['Huanchaco','Trujillo'],['La Esperanza','Trujillo'],['Laredo','Trujillo'],
    ['Moche','Trujillo'],['Salaverry','Trujillo'],['Victor Larco Herrera','Trujillo'],
    ['Lima','Lima'],['Miraflores','Lima'],['San Isidro','Lima'],
    ['Barranco','Lima'],['Surco','Lima'],['La Molina','Lima'],
    ['San Borja','Lima'],['Jesus Maria','Lima'],['Pueblo Libre','Lima'],
    ['Magdalena del Mar','Lima'],['San Miguel','Lima'],
    ['Arequipa','Arequipa'],['Cayma','Arequipa'],['Cerro Colorado','Arequipa'],
    ['Yanahuara','Arequipa'],['Miraflores','Arequipa'],
    ['Cusco','Cusco'],['San Sebastian','Cusco'],['Wanchaq','Cusco'],
    ['Piura','Piura'],['Castilla','Piura'],['Catacaos','Piura'],
    ['Chiclayo','Chiclayo'],['La Victoria','Chiclayo'],['Jose Leonardo Ortiz','Chiclayo'],
    ['Huancayo','Huancayo'],['Chilca','Huancayo'],['El Tambo','Huancayo'],
    ['Iquitos','Maynas'],['Punchana','Maynas'],
    ['Chimbote','Santa'],['Nuevo Chimbote','Santa'],
    ['Callao','Callao'],['Bellavista','Callao'],['Ventanilla','Callao'],
    ['Tacna','Tacna'],['Pocollay','Tacna'],
    ['Ica','Ica'],['Parcona','Ica'],
    ['Puno','Puno'],['Juliaca','San Roman'],
    ['Tarapoto','San Martin'],['Moyobamba','Moyobamba'],
    ['Chachapoyas','Chachapoyas'],['Jaen','Jaen'],
    ['Huancavelica','Huancavelica'],['Cerro de Pasco','Pasco'],
    ['Puerto Maldonado','Tambopata'],['Moquegua','Mariscal Nieto'],
    ['Tumbes','Tumbes'],['Pucallpa','Coronel Portillo'],
    ['Cajamarca','Cajamarca'],['Huaraz','Huaraz'],
    ['Huanuco','Huanuco'],['Abancay','Abancay'],
    ['Ayacucho','Huamanga'],['Tingo Maria','Leoncio Prado'],
  ];

  for (const [dist, prov] of distritos) {
    const provResult = await query('SELECT id FROM provincias WHERE nombre = $1', [prov]);
    if (provResult.rows.length > 0) {
      await query('INSERT INTO distritos (nombre, provincia_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [dist, provResult.rows[0].id]);
    }
  }

  console.log('Ubigeo importado correctamente');
}

seedUbigeo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
