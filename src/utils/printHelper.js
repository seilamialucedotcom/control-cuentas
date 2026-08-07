import { formatCurrency, formatDateTime, formatDateOnly } from './formatters';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function printRecordPdf(item) {
  const isDeuda = item.tipo === 'deuda';
  const isPagado = item.estado === 'pagado';
  const pendiente = item.montoTotal - item.montoPagado;

  const printWindow = window.open('', '_blank');

  // Fallback if window.open was blocked
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Detalle_${item.persona.replace(/\s+/g, '_')}_${item.id}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #2D2A26;
          padding: 30px;
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #EFE8DC;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .brand {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #5B8266;
          background: #EAF2EB;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #2D2A26;
        }
        .subtitle {
          font-size: 13px;
          color: #5C5750;
          margin: 0;
        }
        .badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
        }
        .badge-pagado { background: #EAF2EB; color: #3B6645; border: 1px solid #C1DEC7; }
        .badge-deuda { background: #FDF0EC; color: #C24E31; border: 1px solid #F5C2B4; }
        .badge-cobro { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .card {
          background: #FAF7F2;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid #EBE3D5;
        }
        .card-label {
          font-size: 10px;
          color: #8C8479;
          text-transform: uppercase;
          font-weight: 700;
        }
        .card-val {
          font-size: 20px;
          font-weight: 800;
          color: #2D2A26;
          margin-top: 4px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: #FAF7F2;
          padding: 14px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 24px;
          border: 1px solid #E8E0D2;
        }
        .meta-label { color: #8C8479; font-size: 11px; display: block; }
        .meta-val { font-weight: 700; color: #2D2A26; margin-top: 2px; display: block; }
        .notes-box {
          background: #F7F3EB;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #EBE3D5;
          font-size: 12px;
          margin-bottom: 24px;
        }
        .table-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6E6A63;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 24px;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #E2DAD0;
        }
        th {
          background: #FAF7F2;
          color: #7A746B;
          font-weight: 700;
        }
        .footer {
          margin-top: 40px;
          padding-top: 14px;
          border-top: 1px solid #EFE8DC;
          font-size: 11px;
          color: #8C8479;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <span class="brand">Control de Cuentas</span>
          <h1 class="title">${escapeHtml(item.persona)}</h1>
          <p class="subtitle">Concepto: <strong>${escapeHtml(item.concepto)}</strong> (ID: #${item.id.replace('rec-', '')})</p>
        </div>
        <div style="text-align:right;">
          <span class="badge ${isPagado ? 'badge-pagado' : isDeuda ? 'badge-deuda' : 'badge-cobro'}">
            ${isPagado ? 'Cuenta Saldada' : isDeuda ? 'Deuda por Pagar' : 'Cobro Pendiente'}
          </span>
          <p style="font-size:11px; color:#8C8479; margin-top:6px;">Emisión: ${formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>

      <div class="cards">
        <div class="card">
          <div class="card-label">Monto Total</div>
          <div class="card-val">${formatCurrency(item.montoTotal)}</div>
        </div>
        <div class="card" style="background:#EAF2EB/60;">
          <div class="card-label" style="color:#3B6645">Total Abonado</div>
          <div class="card-val" style="color:#3B6645">${formatCurrency(item.montoPagado)}</div>
        </div>
        <div class="card" style="${pendiente > 0 ? 'background:#FDF0EC;' : ''}">
          <div class="card-label" style="${pendiente > 0 ? 'color:#C24E31' : ''}">Saldo Pendiente</div>
          <div class="card-val" style="color:${pendiente > 0 ? '#C24E31' : '#2D2A26'}">${formatCurrency(pendiente)}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div>
          <span class="meta-label">Fecha de registro</span>
          <span class="meta-val">${formatDateTime(item.fechaCreacion)}</span>
        </div>
        <div>
          <span class="meta-label">Días máximos</span>
          <span class="meta-val">${item.diasMaximos} días</span>
        </div>
        <div>
          <span class="meta-label">Fecha límite</span>
          <span class="meta-val">${formatDateOnly(item.fechaLimite)}</span>
        </div>
      </div>

      ${item.notas ? `
        <div class="notes-box">
          <strong style="color:#6E6A63;">Notas adicionales:</strong>
          <p style="margin:4px 0 0 0; color:#2D2A26;">${escapeHtml(item.notas)}</p>
        </div>
      ` : ''}

      <div class="table-title">Historial de Abonos / Pagos Parciales (${item.abonos.length})</div>
      ${item.abonos.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha y Hora</th>
              <th>Monto</th>
              <th>Nota / Detalle</th>
            </tr>
          </thead>
          <tbody>
            ${item.abonos.map((a, i) => `
              <tr>
                <td style="color:#8C8479;">${i + 1}</td>
                <td><strong>${escapeHtml(a.fechaHora)}</strong></td>
                <td style="color:#3B6645; font-weight:bold;">${formatCurrency(a.monto)}</td>
                <td style="color:#5C5750;">${escapeHtml(a.nota || 'Abono registrado')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div style="padding:16px; text-align:center; background:#FAF7F2; border-radius:8px; font-size:12px; color:#8C8479; margin-bottom:24px;">
          Aún no se han registrado abonos parciales.
        </div>
      `}

      <div class="footer">
        <span>Documento generado por Control de Cuentas</span>
        <span>Usuario: ${escapeHtml(item.persona)}</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function printPersonStatementPdf(personName, items) {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    window.print();
    return;
  }

  let totalDeuda = 0;
  let totalCobro = 0;
  let totalAbonado = 0;

  items.forEach((item) => {
    const pend = item.montoTotal - item.montoPagado;
    if (item.estado === 'pendiente') {
      if (item.tipo === 'deuda') totalDeuda += pend;
      if (item.tipo === 'cobro') totalCobro += pend;
    }
    totalAbonado += item.montoPagado;
  });

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Estado_de_Cuenta_${personName.replace(/\s+/g, '_')}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #2D2A26;
          padding: 30px;
          max-width: 850px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #EFE8DC;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .brand {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #5B8266;
          background: #EAF2EB;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .title {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #2D2A26;
        }
        .subtitle {
          font-size: 13px;
          color: #7A746B;
          margin: 0;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .card {
          background: #FAF7F2;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid #EBE3D5;
        }
        .card-label {
          font-size: 10px;
          color: #8C8479;
          text-transform: uppercase;
          font-weight: 700;
        }
        .card-val {
          font-size: 20px;
          font-weight: 800;
          margin-top: 4px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #2D2A26;
          margin: 24px 0 12px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 24px;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #E2DAD0;
        }
        th {
          background: #FAF7F2;
          color: #7A746B;
          font-weight: 700;
        }
        .badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          display: inline-block;
        }
        .badge-deuda { background: #FDF0EC; color: #C24E31; }
        .badge-cobro { background: #EAF2EB; color: #3B6645; }
        .badge-pagado { background: #EFE9DF; color: #6E6A63; }
        .footer {
          margin-top: 40px;
          padding-top: 14px;
          border-top: 1px solid #EFE8DC;
          font-size: 11px;
          color: #8C8479;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <span class="brand">Control de Cuentas</span>
          <h1 class="title">Resumen de Cuenta: ${escapeHtml(personName)}</h1>
          <p class="subtitle">Detalle consolidado de deudas, cobros y abonos parciales</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:12px; font-weight:bold; color:#2D2A26;">${items.length} Cuentas Registradas</span>
          <p style="font-size:11px; color:#8C8479; margin-top:4px;">Emisión: ${formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>

      <div class="cards">
        <div class="card" style="background:#FDF0EC/60;">
          <div class="card-label" style="color:#C24E31;">Deuda Pendiente (Por pagar)</div>
          <div class="card-val" style="color:#C24E31;">${formatCurrency(totalDeuda)}</div>
        </div>
        <div class="card" style="background:#EAF2EB/60;">
          <div class="card-label" style="color:#3B6645;">Cobro Pendiente (Te debe)</div>
          <div class="card-val" style="color:#3B6645;">${formatCurrency(totalCobro)}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Histórico Abonado</div>
          <div class="card-val" style="color:#2D2A26;">${formatCurrency(totalAbonado)}</div>
        </div>
      </div>

      <div class="section-title">Listado de Cuentas del Usuario</div>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Tipo</th>
            <th>Monto Total</th>
            <th>Abonado</th>
            <th>Pendiente</th>
            <th>Estado</th>
            <th>Fecha Límite</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => {
            const pend = item.montoTotal - item.montoPagado;
            const isPagado = item.estado === 'pagado';
            const isDeuda = item.tipo === 'deuda';
            return `
              <tr>
                <td><strong>${escapeHtml(item.concepto)}</strong></td>
                <td>
                  <span class="badge ${isDeuda ? 'badge-deuda' : 'badge-cobro'}">
                    ${isDeuda ? 'Deuda' : 'Cobro'}
                  </span>
                </td>
                <td>${formatCurrency(item.montoTotal)}</td>
                <td style="color:#3B6645; font-weight:600;">${formatCurrency(item.montoPagado)}</td>
                <td style="color:${pend > 0 ? (isDeuda ? '#C24E31' : '#3B6645') : '#8C8479'}; font-weight:700;">
                  ${formatCurrency(pend)}
                </td>
                <td>
                  <span class="badge ${isPagado ? 'badge-pagado' : 'badge-deuda'}">
                    ${isPagado ? 'Saldado' : 'Pendiente'}
                  </span>
                </td>
                <td style="color:#5C5750;">${formatDateOnly(item.fechaLimite)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <span>Generado por Control de Cuentas</span>
        <span>Usuario: ${escapeHtml(personName)}</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
