import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, TabStopPosition, TabStopType
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads/documentos');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

interface ParteInfo {
  tipo: string;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  razonSocial?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  apoderado?: { nombres: string; apellidos: string; dni: string };
  representante?: { nombres: string; apellidos: string; dni: string; cargo: string };
}

interface DocData {
  numeroExpediente: string;
  fecha: string;
  sede: string;
  sedeDireccion: string;
  sedeTelefono: string;
  materia: string;
  motivo: string;
  pretensiones: string;
  solicitante: ParteInfo;
  invitado: ParteInfo;
  conciliador: string;
  conciliadorDni: string;
  conciliadorRegistro: string;
  conciliadorSede: string;
  secretaria: string;
  fechaVencimiento: string;
  fechaAudiencia?: string;
  lugar?: string;
  resultado?: string;
}

function t(text: string, opts: any = {}): TextRun {
  return new TextRun({ text, size: 20, ...opts });
}

function tb(text: string, opts: any = {}): TextRun {
  return new TextRun({ text, size: 20, bold: true, ...opts });
}

function p(children: (TextRun | string)[]): Paragraph {
  const runs = children.map(c => typeof c === 'string' ? t(c) : c);
  return new Paragraph({ children: runs, spacing: { after: 80 } });
}

function pCenter(children: (TextRun | string)[]): Paragraph {
  const runs = children.map(c => typeof c === 'string' ? t(c) : c);
  return new Paragraph({ children: runs, alignment: AlignmentType.CENTER, spacing: { after: 80 } });
}

function pRight(children: (TextRun | string)[]): Paragraph {
  const runs = children.map(c => typeof c === 'string' ? t(c) : c);
  return new Paragraph({ children: runs, alignment: AlignmentType.RIGHT, spacing: { after: 80 } });
}

function spacer(h: number = 120): Paragraph {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

function makeBorder() {
  return { style: BorderStyle.SINGLE as any, size: 1, color: '333333' };
}

function cell(text: string, opts: { bold?: boolean; width?: number; align?: any } = {}): TableCell {
  const run = opts.bold ? tb(text) : t(text);
  return new TableCell({
    children: [new Paragraph({
      children: [run],
      alignment: opts.align ?? AlignmentType.LEFT,
      spacing: { before: 40, after: 40 },
    })],
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    borders: {
      top: makeBorder(), bottom: makeBorder(),
      left: makeBorder(), right: makeBorder(),
    },
  });
}

function headerRow(cells: string[], widths?: number[]): TableRow {
  return new TableRow({
    children: cells.map((c, i) => cell(c, { bold: true, width: widths?.[i] })),
    tableHeader: true,
  });
}

function dataRow(cells: string[], widths?: number[]): TableRow {
  return new TableRow({
    children: cells.map((c, i) => cell(c, { width: widths?.[i] })),
  });
}

function infoTable(rows: { label: string; value: string }[]): Table {
  return new Table({
    rows: rows.map(r => new TableRow({
      children: [
        cell(r.label, { bold: true, width: 30 }),
        cell(r.value || '____________________', { width: 70 }),
      ],
    })),
  });
}

function partTable(title: string, parte: ParteInfo): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  elements.push(new Paragraph({
    children: [tb(title)],
    spacing: { before: 200, after: 80 },
  }));

  const rows: { label: string; value: string }[] = [];

  if (parte.tipo === 'Juridica') {
    rows.push({ label: 'Razón Social', value: parte.razonSocial || '' });
    rows.push({ label: 'RUC', value: parte.ruc || '' });
    if (parte.representante) {
      rows.push({ label: 'Representante', value: `${parte.representante.nombres} ${parte.representante.apellidos}` });
      rows.push({ label: 'DNI Representante', value: parte.representante.dni });
      rows.push({ label: 'Cargo', value: parte.representante.cargo });
    }
  } else {
    rows.push({ label: 'Nombre', value: `${parte.nombres || ''} ${parte.apellidos || ''}` });
    rows.push({ label: 'DNI', value: parte.dni || '' });
    if (parte.apoderado) {
      rows.push({ label: 'Apoderado', value: `${parte.apoderado.nombres} ${parte.apoderado.apellidos}` });
      rows.push({ label: 'DNI Apoderado', value: parte.apoderado.dni });
    }
  }

  rows.push({ label: 'Dirección', value: parte.direccion || '' });
  if (parte.distrito) {
    rows.push({ label: 'Ubicación', value: `${parte.distrito}, ${parte.provincia || ''}, ${parte.departamento || ''}` });
  }
  rows.push({ label: 'Teléfono', value: parte.telefono || '' });
  rows.push({ label: 'Email', value: parte.email || '' });

  elements.push(infoTable(rows));
  return elements;
}

function signatureBlock(title: string): Paragraph {
  return new Paragraph({
    children: [
      t('__________________________________', { size: 20 }),
      new Paragraph({ spacing: { before: 4 }, children: [] }),
    ].flatMap(r => [r]) as TextRun[],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 0 },
  });
}

// =========== DOCUMENTOS ===========

export async function generarActaConciliacion(data: DocData): Promise<string> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        pCenter([tb('ACTA DE CONCILIACIÓN', { size: 28 })]),
        pCenter([tb('(Ley N° 26872 - Ley de Conciliación)', { size: 18, italics: true })]),
        spacer(200),

        pCenter([tb('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL SBSS')]),
        pCenter([t('Registro N° ____________________', { size: 18 })]),
        spacer(200),

        infoTable([
          { label: 'N° de Expediente', value: data.numeroExpediente },
          { label: 'Fecha', value: data.fecha },
          { label: 'Sede', value: `${data.sede} - ${data.sedeDireccion}` },
          { label: 'Materia', value: data.materia },
        ]),
        spacer(200),

        ...partTable('SOLICITANTE', data.solicitante),
        spacer(120),

        ...partTable('INVITADO', data.invitado),
        spacer(120),

        new Paragraph({
          children: [tb('CONCILIADOR')],
          spacing: { before: 200, after: 80 },
        }),
        infoTable([
          { label: 'Conciliador', value: data.conciliador },
          { label: 'DNI', value: data.conciliadorDni || '' },
          { label: 'Registro', value: data.conciliadorRegistro || '' },
          { label: 'Sede', value: data.conciliadorSede || data.sede },
        ]),
        spacer(200),

        new Paragraph({
          children: [tb('ANTECEDENTES', { size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 120 },
        }),

        p([tb('Motivo: '), t(data.motivo || '____________________')]),
        p([tb('Pretensiones: '), t(data.pretensiones || '____________________')]),
        spacer(200),

        new Paragraph({
          children: [tb('ACUERDO DE LAS PARTES', { size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 120 },
        }),

        p([t('Las partes intervinientes, en virtud de la presente Acta de Conciliación, han llegado voluntariamente al siguiente acuerdo:')]),
        spacer(100),
        p([t('_____________________________________________________________________________')]),
        p([t('_____________________________________________________________________________')]),
        p([t('_____________________________________________________________________________')]),
        p([t('_____________________________________________________________________________')]),
        spacer(200),

        p([tb('Plazo de cumplimiento: '), t('____________________')]),
        p([tb('Lugar de cumplimiento: '), t('____________________')]),
        spacer(200),

        p([t('Las partes se comprometen a cumplir con lo acordado, bajo los alcances del artículo 14° de la Ley N° 26872 y su Reglamento.', { italics: true, size: 18 })]),
        spacer(300),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Solicitante', { size: 18, color: '666666' })]),
        spacer(100),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Invitado', { size: 18, color: '666666' })]),
        spacer(100),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Conciliador', { size: 18, color: '666666' })]),
        pCenter([t(`${data.conciliador} - Reg. ${data.conciliadorRegistro || ''}`, { size: 16, color: '666666' })]),
      ],
    }],
  });

  const fileName = `Acta_Conciliacion_${data.numeroExpediente.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function generarEsquelaDesignacion(data: DocData): Promise<string> {
  const doc = new Document({
    sections: [{
      children: [
        pCenter([tb('ESQUELA DE DESIGNACIÓN DE CONCILIADOR', { size: 26 })]),
        pCenter([tb('(Ley N° 26872 - Ley de Conciliación)', { size: 18, italics: true })]),
        spacer(200),

        pCenter([tb('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL SBSS')]),
        spacer(200),

        infoTable([
          { label: 'N° de Expediente', value: data.numeroExpediente },
          { label: 'Fecha', value: data.fecha },
          { label: 'Sede', value: `${data.sede} - ${data.sedeDireccion}` },
          { label: 'Materia', value: data.materia },
        ]),
        spacer(200),

        ...partTable('SOLICITANTE', data.solicitante),
        spacer(120),

        ...partTable('INVITADO', data.invitado),
        spacer(200),

        new Paragraph({
          children: [tb('CONCILIADOR DESIGNADO')],
          spacing: { before: 200, after: 80 },
        }),
        infoTable([
          { label: 'Conciliador', value: data.conciliador },
          { label: 'DNI', value: data.conciliadorDni || '' },
          { label: 'Registro Civil/Comercial', value: data.conciliadorRegistro || '' },
        ]),
        spacer(200),

        p([t('Por medio de la presente, se comunica que el conciliador antes señalado ha sido designado para conocer y tramitar el expediente de la referencia, de conformidad con lo dispuesto en la Ley N° 26872 y su Reglamento.', { size: 20 })]),
        spacer(300),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Conciliador', { size: 18, color: '666666' })]),
        pCenter([t(`${data.conciliador} - Reg. ${data.conciliadorRegistro || ''}`, { size: 16, color: '666666' })]),
      ],
    }],
  });

  const fileName = `Esquela_Designacion_${data.numeroExpediente.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function generarInvitacionConciliacion(data: DocData): Promise<string> {
  const doc = new Document({
    sections: [{
      children: [
        pCenter([tb('INVITACIÓN A CONCILIACIÓN EXTRAJUDICIAL', { size: 26 })]),
        pCenter([tb('(Ley N° 26872 - Ley de Conciliación)', { size: 18, italics: true })]),
        spacer(200),

        pCenter([tb('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL SBSS')]),
        spacer(200),

        infoTable([
          { label: 'N° de Expediente', value: data.numeroExpediente },
          { label: 'Materia', value: data.materia },
          { label: 'Sede', value: `${data.sede} - ${data.sedeDireccion}` },
          { label: 'Teléfono Sede', value: data.sedeTelefono || '' },
        ]),
        spacer(150),

        p([tb('Sr(a): '), t(data.invitado.nombres ? `${data.invitado.nombres} ${data.invitado.apellidos}` : (data.invitado.razonSocial || ''))]),
        p([tb('DNI/RUC: '), t(data.invitado.dni || data.invitado.ruc || '')]),
        p([tb('Dirección: '), t(data.invitado.direccion || '')]),
        spacer(200),

        p([t('Por medio de la presente, se le comunica que ha sido invitado(a) a la audiencia de conciliación programada en el marco del expediente antes indicado, de conformidad con la Ley N° 26872 - Ley de Conciliación.')]),
        spacer(150),

        new Paragraph({
          children: [tb('DATOS DE LA AUDIENCIA', { size: 22 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 120 },
        }),

        infoTable([
          { label: 'Fecha', value: data.fechaAudiencia || data.fecha },
          { label: 'Hora', value: '____________________' },
          { label: 'Lugar', value: data.lugar || `Sede: ${data.sede} - ${data.sedeDireccion}` },
          { label: 'Modalidad', value: data.lugar === 'Virtual' ? 'Virtual' : 'Presencial' },
        ]),
        spacer(200),

        p([tb('Recomendaciones:')]),
        p([t('- Asistir con 15 minutos de anticipación.', { size: 18 })]),
        p([t('- Portar su documento de identidad.', { size: 18 })]),
        p([t('- En caso de contar con representante legal, traer los documentos que acrediten su representación.', { size: 18 })]),
        spacer(100),

        p([tb('Consecuencias de la inasistencia:')]),
        p([t('La inasistencia injustificada a la presente citación será registrada como Inasistencia, y el expediente podrá ser derivado a la vía judicial conforme al artículo 22° de la Ley N° 26872.', { size: 18, italics: true })]),
        spacer(300),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Conciliador', { size: 18, color: '666666' })]),
        pCenter([t(`${data.conciliador} - Reg. ${data.conciliadorRegistro || ''}`, { size: 16, color: '666666' })]),
      ],
    }],
  });

  const fileName = `Invitacion_${data.numeroExpediente.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function generarPreAviso(data: DocData): Promise<string> {
  const doc = new Document({
    sections: [{
      children: [
        pCenter([tb('PRE AVISO DE VENCIMIENTO DE PLAZO', { size: 26 })]),
        pCenter([tb('(Ley N° 26872 - Ley de Conciliación)', { size: 18, italics: true })]),
        spacer(200),

        pCenter([tb('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL SBSS')]),
        spacer(200),

        infoTable([
          { label: 'N° de Expediente', value: data.numeroExpediente },
          { label: 'Fecha de Emisión', value: data.fecha },
          { label: 'Fecha de Vencimiento', value: data.fechaVencimiento },
          { label: 'Materia', value: data.materia },
          { label: 'Sede', value: data.sede },
        ]),
        spacer(150),

        ...partTable('SOLICITANTE', data.solicitante),
        spacer(100),

        ...partTable('INVITADO', data.invitado),
        spacer(150),

        new Paragraph({
          children: [tb('CONCILIADOR A CARGO')],
          spacing: { before: 200, after: 80 },
        }),
        infoTable([
          { label: 'Conciliador', value: data.conciliador },
          { label: 'DNI', value: data.conciliadorDni || '' },
          { label: 'Registro', value: data.conciliadorRegistro || '' },
        ]),
        spacer(200),

        p([t('Por medio de la presente, se INFORMA que el expediente de la referencia se encuentra próximo a vencer, de conformidad con lo dispuesto en el artículo 18° de la Ley N° 26872 - Ley de Conciliación y su Reglamento.')]),
        spacer(100),

        p([tb('Plazo máximo de conciliación: '), t('10 días hábiles desde la fecha de registro.')]),
        p([tb('Fecha de vencimiento: '), t(data.fechaVencimiento)]),
        spacer(100),

        p([t('Se recomienda realizar las acciones necesarias para evitar el vencimiento del expediente y su consecuente archivo.', { italics: true })]),
        spacer(300),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Conciliador', { size: 18, color: '666666' })]),
        pCenter([t(`${data.conciliador} - Reg. ${data.conciliadorRegistro || ''}`, { size: 16, color: '666666' })]),
      ],
    }],
  });

  const fileName = `PreAviso_${data.numeroExpediente.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export async function generarConstanciaAsistencia(data: DocData): Promise<string> {
  const doc = new Document({
    sections: [{
      children: [
        pCenter([tb('CONSTANCIA DE ASISTENCIA', { size: 26 })]),
        pCenter([tb('(Ley N° 26872 - Ley de Conciliación)', { size: 18, italics: true })]),
        spacer(200),

        pCenter([tb('CENTRO DE CONCILIACIÓN EXTRAJUDICIAL SBSS')]),
        spacer(200),

        infoTable([
          { label: 'N° de Expediente', value: data.numeroExpediente },
          { label: 'Fecha de Audiencia', value: data.fechaAudiencia || data.fecha },
          { label: 'Materia', value: data.materia },
          { label: 'Sede', value: data.sede },
          { label: 'Resultado', value: data.resultado || 'Asistieron' },
        ]),
        spacer(150),

        ...partTable('SOLICITANTE', data.solicitante),
        spacer(100),

        ...partTable('INVITADO', data.invitado),
        spacer(150),

        new Paragraph({
          children: [tb('CONCILIADOR')],
          spacing: { before: 200, after: 80 },
        }),
        infoTable([
          { label: 'Conciliador', value: data.conciliador },
          { label: 'DNI', value: data.conciliadorDni || '' },
          { label: 'Registro', value: data.conciliadorRegistro || '' },
        ]),
        spacer(200),

        p([t('Se deja constancia de la asistencia de las partes a la audiencia de conciliación programada en el marco del expediente de la referencia.')]),
        spacer(100),

        p([tb('Partes asistentes:')]),
        p([t(`- Solicitante: ${data.solicitante.nombres ? `${data.solicitante.nombres} ${data.solicitante.apellidos}` : (data.solicitante.razonSocial || '')}`)]),
        p([t(`- Invitado: ${data.invitado.nombres ? `${data.invitado.nombres} ${data.invitado.apellidos}` : (data.invitado.razonSocial || '')}`)]),
        spacer(100),

        p([tb('Resultado de la audiencia: '), t(data.resultado || '____________________')]),
        spacer(200),

        p([t('Se expide la presente constancia para los fines que las partes consideren convenientes.', { italics: true, size: 18 })]),
        spacer(300),

        pCenter([t('____________________________')]),
        pCenter([t('Firma del Conciliador', { size: 18, color: '666666' })]),
        pCenter([t(`${data.conciliador} - Reg. ${data.conciliadorRegistro || ''}`, { size: 16, color: '666666' })]),
      ],
    }],
  });

  const fileName = `Constancia_${data.numeroExpediente.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}
