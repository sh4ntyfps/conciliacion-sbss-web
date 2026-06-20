import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads/documentos');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function dateStr(d: any): string {
  return d ? new Date(d).toLocaleDateString('es-PE') : '-';
}

function fmt(s: any): string {
  return s ?? '-';
}

export async function exportarExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();

  // ===== SHEET 1: RESUMEN =====
  const resumen = workbook.addWorksheet('Resumen');

  const total = data.length;
  const porEstado: Record<string, number> = {};
  for (const r of data) {
    porEstado[r.estado] = (porEstado[r.estado] || 0) + 1;
  }
  const conciliados = data.filter(r => r.estado === 'CONCILIADO').length;
  const vencidos = data.filter(r => r.estado === 'VENCIDO').length;

  resumen.mergeCells('A1:D1');
  const titleCell = resumen.getCell('A1');
  titleCell.value = 'SBSS - SISTEMA DE CONCILIACIÓN';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF0F6ECD' } };
  titleCell.alignment = { horizontal: 'center' };
  resumen.getRow(1).height = 32;

  resumen.mergeCells('A2:D2');
  resumen.getCell('A2').value = 'REPORTE DE EXPEDIENTES - RESUMEN';
  resumen.getCell('A2').font = { bold: true, size: 13, color: { argb: 'FF333333' } };
  resumen.getCell('A2').alignment = { horizontal: 'center' };
  resumen.getRow(2).height = 24;

  resumen.mergeCells('A3:D3');
  resumen.getCell('A3').value = `Generado: ${new Date().toLocaleString('es-PE')}  |  Período: ${data.length > 0 ? dateStr(data[0].fecha_creacion) + ' - ' + dateStr(data[data.length - 1].fecha_creacion) : '-'}`;
  resumen.getCell('A3').font = { size: 10, color: { argb: 'FF666666' } };
  resumen.getCell('A3').alignment = { horizontal: 'center' };

  // Resumen table
  const resStartRow = 5;
  resumen.getCell(`A${resStartRow}`).value = 'Indicador';
  resumen.getCell(`B${resStartRow}`).value = 'Cantidad';
  resumen.getCell(`C${resStartRow}`).value = 'Porcentaje';
  const resHeaderStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F6ECD' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
  };
  resumen.getCell(`A${resStartRow}`).style = resHeaderStyle;
  resumen.getCell(`B${resStartRow}`).style = resHeaderStyle;
  resumen.getCell(`C${resStartRow}`).style = resHeaderStyle;
  resumen.getRow(resStartRow).height = 26;

  let rRow = resStartRow + 1;
  const estadoColors: Record<string, string> = {
    'REGISTRADO': 'FFE8F0FE', 'EN PROCESO': 'FFFEF3C7', 'AUDIENCIA PROGRAMADA': 'FFF3E8FF',
    'CONCILIADO': 'FFD1FAE5', 'NO CONCILIADO': 'FFF3F4F6', 'CERRADO': 'FFE5E7EB', 'VENCIDO': 'FFFEE2E2',
  };
  for (const [estado, count] of Object.entries(porEstado)) {
    resumen.getCell(`A${rRow}`).value = estado;
    resumen.getCell(`B${rRow}`).value = count;
    resumen.getCell(`C${rRow}`).value = `${((count / total) * 100).toFixed(1)}%`;
    const bg = estadoColors[estado] || 'FFFFFFFF';
    resumen.getCell(`A${rRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    resumen.getCell(`B${rRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    resumen.getCell(`C${rRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    resumen.getCell(`B${rRow}`).alignment = { horizontal: 'center' };
    resumen.getCell(`C${rRow}`).alignment = { horizontal: 'center' };
    rRow++;
  }

  // Total row
  resumen.getCell(`A${rRow}`).value = 'TOTAL';
  resumen.getCell(`B${rRow}`).value = total;
  resumen.getCell(`C${rRow}`).value = '100%';
  for (const col of ['A', 'B', 'C']) {
    const cell = resumen.getCell(`${col}${rRow}`);
    cell.font = { bold: true, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.border = { top: { style: 'medium', color: { argb: 'FF0F6ECD' } } };
  }
  resumen.getCell(`B${rRow}`).alignment = { horizontal: 'center' };
  resumen.getCell(`C${rRow}`).alignment = { horizontal: 'center' };

  // Additional stats
  rRow += 2;
  resumen.getCell(`A${rRow}`).value = 'Días promedio de gestión:';
  resumen.getCell(`A${rRow}`).font = { bold: true };
  const avgDays = data.length > 0
    ? (data.reduce((sum, r) => sum + (r.dias_transcurridos || 0), 0) / data.length).toFixed(1)
    : '0';
  resumen.getCell(`B${rRow}`).value = `${avgDays} días`;

  rRow++;
  resumen.getCell(`A${rRow}`).value = 'Expedientes conciliados:';
  resumen.getCell(`A${rRow}`).font = { bold: true };
  resumen.getCell(`B${rRow}`).value = `${conciliados} (${total > 0 ? ((conciliados / total) * 100).toFixed(1) : 0}%)`;

  rRow++;
  resumen.getCell(`A${rRow}`).value = 'Expedientes vencidos:';
  resumen.getCell(`A${rRow}`).font = { bold: true };
  resumen.getCell(`B${rRow}`).value = `${vencidos} (${total > 0 ? ((vencidos / total) * 100).toFixed(1) : 0}%)`;

  resumen.getColumn('A').width = 30;
  resumen.getColumn('B').width = 16;
  resumen.getColumn('C').width = 16;

  // ===== SHEET 2: DETALLE =====
  const detalle = workbook.addWorksheet('Detalle');

  const detailColumns = [
    { header: 'N° Expediente', key: 'numero_expediente', width: 18 },
    { header: 'Materia', key: 'materia', width: 26 },
    { header: 'Tipo Materia', key: 'tipo_materia', width: 22 },
    { header: 'Sede', key: 'sede', width: 20 },
    { header: 'Dirección Sede', key: 'sede_direccion', width: 28 },
    { header: 'Solicitante', key: 'solicitante', width: 30 },
    { header: 'Invitado', key: 'invitado', width: 30 },
    { header: 'Conciliador', key: 'conciliador', width: 26 },
    { header: 'Secretaria', key: 'secretaria', width: 26 },
    { header: 'Estado', key: 'estado', width: 20 },
    { header: 'Motivo', key: 'motivo', width: 40 },
    { header: 'Pretensiones', key: 'pretensiones', width: 40 },
    { header: 'Fecha Creación', key: 'fecha_creacion', width: 16 },
    { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 16 },
    { header: 'Fecha Cierre', key: 'fecha_cierre', width: 16 },
    { header: 'Días Transcurridos', key: 'dias_transcurridos', width: 18 },
    { header: 'Días Restantes', key: 'dias_restantes', width: 16 },
    { header: 'Alerta', key: 'alerta_vencimiento', width: 16 },
    { header: 'Resultados Audiencias', key: 'resultados_audiencias', width: 30 },
    { header: 'Total Audiencias', key: 'total_audiencias', width: 16 },
  ];

  detalle.columns = detailColumns;

  data.forEach(row => {
    detalle.addRow({
      numero_expediente: row.numero_expediente,
      materia: row.materia,
      tipo_materia: row.tipo_materia,
      sede: row.sede,
      sede_direccion: row.sede_direccion,
      solicitante: row.solicitante,
      invitado: row.invitado,
      conciliador: fmt(row.conciliador),
      secretaria: fmt(row.secretaria),
      estado: row.estado,
      motivo: fmt(row.motivo),
      pretensiones: fmt(row.pretensiones),
      fecha_creacion: dateStr(row.fecha_creacion),
      fecha_vencimiento: dateStr(row.fecha_vencimiento),
      fecha_cierre: dateStr(row.fecha_cierre),
      dias_transcurridos: row.dias_transcurridos ?? '-',
      dias_restantes: row.dias_restantes ?? '-',
      alerta_vencimiento: row.alerta_vencimiento,
      resultados_audiencias: fmt(row.resultados_audiencias),
      total_audiencias: row.total_audiencias ?? 0,
    });
  });

  // Style detail header
  const detHeaderRow = detalle.getRow(1);
  detHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
  detHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F6ECD' } };
  detHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  detHeaderRow.height = 32;

  // Style detail rows
  const alertaColors: Record<string, string> = {
    'NORMAL': 'FFD1FAE5',
    'ADVERTENCIA': 'FFFEF3C7',
    'CRITICO': 'FFFEE2E2',
    'VENCIDO': 'FFFECACA',
  };
  detalle.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle', wrapText: true };
      row.height = 22;
      const alerta = row.getCell('alerta_vencimiento').value as string;
      const bg = alertaColors[alerta];
      if (bg) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        });
      }
      // Estado column color
      const estadoCell = row.getCell('estado');
      const estado = estadoCell.value as string;
      if (estado === 'CONCILIADO') { estadoCell.font = { color: { argb: 'FF059669' }, bold: true }; }
      else if (estado === 'VENCIDO') { estadoCell.font = { color: { argb: 'FFDC2626' }, bold: true }; }
      else if (estado === 'AUDIENCIA PROGRAMADA') { estadoCell.font = { color: { argb: 'FF7C3AED' }, bold: true }; }
    }
  });

  // Auto-filter
  detalle.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: data.length + 1, column: detailColumns.length },
  };

  const fileName = `Reporte_Expedientes_${Date.now()}.xlsx`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

export async function exportarPdf(data: any[]): Promise<string> {
  const PdfPrinter = require('pdfmake');

  // For pdfmake we need proper fonts - use built-in Roboto or Helvetica
  const fonts = {
    Roboto: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
  };
  const printer = new PdfPrinter(fonts);

  const today = new Date().toLocaleString('es-PE');
  const totalCount = data.length;

  // Statistics
  const porEstado: Record<string, number> = {};
  for (const r of data) porEstado[r.estado] = (porEstado[r.estado] || 0) + 1;
  const conciliadosCount = data.filter(r => r.estado === 'CONCILIADO').length;
  const vencidosCount = data.filter(r => r.estado === 'VENCIDO').length;
  const promediovg = totalCount > 0
    ? (data.reduce((s, r) => s + (r.dias_transcurridos || 0), 0) / totalCount).toFixed(1)
    : '0';

  function estadoColor(estado: string): string {
    const colors: Record<string, string> = {
      'REGISTRADO': '#3B82F6', 'EN PROCESO': '#F59E0B', 'AUDIENCIA PROGRAMADA': '#8B5CF6',
      'CONCILIADO': '#10B981', 'NO CONCILIADO': '#6B7280', 'CERRADO': '#1F2937', 'VENCIDO': '#EF4444',
    };
    return colors[estado] || '#333333';
  }

  // Stats table
  const statRows: any[][] = Object.entries(porEstado).map(([estado, count]) => [
    { text: estado, fontSize: 9, color: estadoColor(estado), bold: true, margin: [4, 3] },
    { text: String(count), fontSize: 9, alignment: 'center' as const, margin: [4, 3] },
    { text: `${((count / totalCount) * 100).toFixed(1)}%`, fontSize: 9, alignment: 'center' as const, margin: [4, 3] },
  ]);

  statRows.push([
    { text: 'TOTAL', fontSize: 9, bold: true, margin: [4, 3], alignment: 'center' as const },
    { text: String(totalCount), fontSize: 9, bold: true, alignment: 'center' as const, margin: [4, 3] },
    { text: '100%', fontSize: 9, bold: true, alignment: 'center' as const, margin: [4, 3] },
  ]);

  // Detail table
  const detailBody = [
    [
      { text: 'N° Exp.', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Materia', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Solicitante', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Invitado', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Estado', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Conciliador', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Días', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
      { text: 'Alerta', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 7, alignment: 'center', margin: [2, 4] },
    ],
    ...data.map((r, i) => {
      const bg = i % 2 === 0 ? '#F0F4F8' : 'white';
      return [
        { text: r.numero_expediente, fontSize: 7, margin: [2, 3], fillColor: bg },
        { text: r.materia || '', fontSize: 7, margin: [2, 3], fillColor: bg },
        { text: r.solicitante || '-', fontSize: 7, margin: [2, 3], fillColor: bg },
        { text: r.invitado || '-', fontSize: 7, margin: [2, 3], fillColor: bg },
        { text: r.estado, fontSize: 7, margin: [2, 3], fillColor: bg, color: estadoColor(r.estado), bold: true },
        { text: r.conciliador || '-', fontSize: 7, margin: [2, 3], fillColor: bg },
        { text: String(r.dias_transcurridos ?? '-'), fontSize: 7, margin: [2, 3], fillColor: bg, alignment: 'center' },
        { text: r.alerta_vencimiento || '-', fontSize: 7, margin: [2, 3], fillColor: bg, color: r.alerta_vencimiento === 'VENCIDO' ? '#EF4444' : r.alerta_vencimiento === 'CRITICO' ? '#F59E0B' : '#10B981', bold: true, alignment: 'center' },
      ];
    }),
  ];

  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [30, 55, 30, 45],
    header: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: 'SBSS - Sistema de Conciliación', fontSize: 8, color: '#0F6ECD', bold: true, margin: [30, 12, 0, 0] },
        { text: `Pág. ${currentPage} / ${pageCount}`, fontSize: 7, color: '#999999', alignment: 'right', margin: [0, 12, 30, 0] },
      ],
    }),
    footer: {
      columns: [
        { text: `Reporte generado el ${today}`, fontSize: 7, color: '#AAAAAA', margin: [30, 5, 0, 0] },
        { text: 'SBSS - Todos los derechos reservados', fontSize: 7, color: '#AAAAAA', alignment: 'right', margin: [0, 5, 30, 0] },
      ],
    },
    content: [
      // Title
      { text: 'REPORTE DE EXPEDIENTES', fontSize: 16, bold: true, color: '#0F6ECD', alignment: 'center', margin: [0, 0, 0, 2] },
      { text: `Período: ${data.length > 0 ? dateStr(data[0].fecha_creacion) + ' al ' + dateStr(data[data.length - 1].fecha_creacion) : '-'}`, fontSize: 10, color: '#666666', alignment: 'center', margin: [0, 0, 0, 2] },
      { text: `Generado: ${today}`, fontSize: 9, color: '#999999', alignment: 'center', margin: [0, 0, 0, 12] },

      // Summary section
      { text: 'RESUMEN ESTADÍSTICO', fontSize: 11, bold: true, color: '#333333', margin: [0, 0, 0, 6] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Estado', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 9, alignment: 'center', margin: [4, 4] },
              { text: 'Cantidad', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 9, alignment: 'center', margin: [4, 4] },
              { text: '%', fillColor: '#0F6ECD', color: 'white', bold: true, fontSize: 9, alignment: 'center', margin: [4, 4] },
            ],
            ...statRows,
          ],
        },
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === statRows.length) ? 1 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CCCCCC',
          vLineColor: () => '#CCCCCC',
        },
      },
      {
        columns: [
          { text: `\nTotal expedientes: ${totalCount}`, fontSize: 9, margin: [0, 6, 0, 0] },
          { text: `\nConciliados: ${conciliadosCount} (${totalCount > 0 ? ((conciliadosCount / totalCount) * 100).toFixed(1) : 0}%)`, fontSize: 9, margin: [0, 6, 0, 0] },
          { text: `\nVencidos: ${vencidosCount} (${totalCount > 0 ? ((vencidosCount / totalCount) * 100).toFixed(1) : 0}%)`, fontSize: 9, margin: [0, 6, 0, 0] },
          { text: `\nProm. días gestión: ${promediovg}`, fontSize: 9, margin: [0, 6, 0, 0] },
        ],
        columnGap: 10,
      },

      // Detail section
      { text: '\nDETALLE DE EXPEDIENTES', fontSize: 11, bold: true, color: '#333333', margin: [0, 12, 0, 6] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*', 'auto', '*', 'auto', 'auto'],
          body: detailBody,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CCCCCC',
          vLineColor: () => '#CCCCCC',
        },
      },
      { text: `\nNota: Los días transcurridos se calculan desde la fecha de creación hasta la fecha actual.`, fontSize: 7, color: '#999999', italics: true, margin: [0, 8, 0, 0] },
    ],
  };

  const fileName = `Reporte_Expedientes_${Date.now()}.pdf`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const writeStream = fs.createWriteStream(filePath);
  pdfDoc.pipe(writeStream);

  return new Promise((resolve, reject) => {
    pdfDoc.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
  });
}
