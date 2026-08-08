import React from 'react';
import { formatCurrency, formatDateTime, formatDateOnly } from '../utils/formatters';
import { printRecordPdf } from '../utils/printHelper';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Printer,
} from 'lucide-react';

export const PdfDetailModal = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !item || typeof item !== 'object') return null;

  const safeItem = {
    ...item,
    persona: item.persona ?? 'Usuario sin nombre',
    concepto: item.concepto ?? 'Sin concepto',
    tipo: item.tipo ?? 'cobro',
    estado: item.estado ?? 'pendiente',
    id: item.id ?? 'sin-id',
    montoTotal: Number(item.montoTotal ?? 0),
    montoPagado: Number(item.montoPagado ?? 0),
    fechaCreacion: item.fechaCreacion ?? new Date().toISOString(),
    diasMaximos: Number(item.diasMaximos ?? 0),
    fechaLimite: item.fechaLimite ?? null,
    notas: item.notas ?? '',
    abonos: Array.isArray(item.abonos) ? item.abonos : [],
  };

  const isDeuda = safeItem.tipo === 'deuda';
  const isPagado = safeItem.estado === 'pagado';
  const pendiente = safeItem.montoTotal - safeItem.montoPagado;

  const handlePrint = () => {
    if (!safeItem || typeof safeItem !== 'object') return;
    printRecordPdf(safeItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2A26]/60 backdrop-blur-xs transition-opacity animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-2xl w-full border border-[#EFE8DC] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:w-full">

        <div className="px-6 py-4 border-b border-[#F0E8DC] flex items-center justify-between bg-[#FAF7F2] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C24E31]/10 text-[#C24E31] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2A26] font-display">
                Detalle de Estado de Cuenta
              </h2>
              <p className="text-xs text-[#7A746B]">
                Resumen de pagos y saldos del usuario: <span className="font-semibold text-[#2D2A26]">{safeItem.persona}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#2D2A26] hover:bg-[#EFE9DF] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:space-y-4 font-sans">
          <div className="flex items-start justify-between border-b border-[#EFE8DC] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5B8266] bg-[#EAF2EB] px-2.5 py-0.5 rounded-md border border-[#C1DEC7]">
                  Control de Cuentas
                </span>
                <span className="text-xs text-[#8C8479]">ID: #{String(safeItem.id).replace('rec-', '')}</span>
              </div>
              <h1 className="text-2xl font-black font-display text-[#2D2A26] mt-1.5">
                {safeItem.persona}
              </h1>
              <p className="text-xs text-[#5C5750]">
                Concepto: <strong className="text-[#2D2A26]">{safeItem.concepto}</strong>
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${
                  isPagado
                    ? 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]'
                    : isDeuda
                    ? 'bg-[#FDF0EC] text-[#C24E31] border-[#F5C2B4]'
                    : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                }`}
              >
                {isPagado ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cuenta Cancelada / Saldada
                  </>
                ) : isDeuda ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" /> Deuda por Pagar
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Cobro Pendiente
                  </>
                )}
              </span>
              <p className="text-[11px] text-[#8C8479] mt-1">
                Emisión: {formatDateTime(new Date().toISOString())}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EBE3D5]">
              <span className="text-[11px] font-semibold text-[#8C8479] uppercase block">
                Monto Acordado
              </span>
              <span className="text-lg font-bold font-display text-[#2D2A26]">
                {formatCurrency(safeItem.montoTotal)}
              </span>
            </div>

            <div className="bg-[#EAF2EB]/60 p-3.5 rounded-xl border border-[#C1DEC7]/60">
              <span className="text-[11px] font-semibold text-[#3B6645] uppercase block">
                Total Abonado
              </span>
              <span className="text-lg font-bold font-display text-[#3B6645]">
                {formatCurrency(safeItem.montoPagado)}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                pendiente > 0
                  ? 'bg-[#FDF0EC]/60 border-[#F5C2B4]/60'
                  : 'bg-[#FAF7F2] border-[#EBE3D5]'
              }`}
            >
              <span
                className={`text-[11px] font-semibold uppercase block ${
                  pendiente > 0 ? 'text-[#C24E31]' : 'text-[#8C8479]'
                }`}
              >
                Saldo Pendiente
              </span>
              <span
                className={`text-lg font-bold font-display ${
                  pendiente > 0 ? 'text-[#C24E31]' : 'text-[#2D2A26]'
                }`}
              >
                {formatCurrency(pendiente)}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E0D2] text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[#8C8479] block font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#A39E93]" /> Fecha y hora de registro:
              </span>
              <span className="font-bold text-[#2D2A26] block mt-0.5">
                {formatDateTime(safeItem.fechaCreacion)}
              </span>
            </div>

            <div>
              <span className="text-[#8C8479] block font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A39E93]" /> Días máximos:
              </span>
              <span className="font-bold text-[#2D2A26] block mt-0.5">
                {safeItem.diasMaximos} días
              </span>
            </div>

            <div>
              <span className="text-[#8C8479] block font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A39E93]" /> Fecha límite de pago:
              </span>
              <span className="font-bold text-[#2D2A26] block mt-0.5">
                {safeItem.fechaLimite ? formatDateOnly(safeItem.fechaLimite) : 'Sin fecha límite'}
              </span>
            </div>
          </div>

          {safeItem.notas ? (
            <div className="p-3 bg-[#F7F3EB] rounded-xl border border-[#EBE3D5] text-xs">
              <span className="font-semibold text-[#6E6A63] block">Notas del registro:</span>
              <p className="text-[#2D2A26] mt-0.5">{safeItem.notas}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#6E6A63] uppercase tracking-wider">
              Historial de Abonos ({safeItem.abonos.length})
            </h3>

            {safeItem.abonos.length > 0 ? (
              <div className="border border-[#E2DAD0] rounded-xl overflow-hidden bg-white text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E2DAD0] text-[#7A746B] font-semibold">
                      <th className="p-3">#</th>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Nota / Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DAD0]">
                    {safeItem.abonos.map((abono, index) => {
                      const fechaHora = abono?.fechaHora ?? '';
                      const nota = abono?.nota ?? 'Abono registrado';

                      return (
                        <tr key={abono?.id ?? `abono-${index}`} className="hover:bg-[#FAF7F2]/50">
                          <td className="p-3 text-[#8C8479] font-medium">{index + 1}</td>
                          <td className="p-3 font-semibold text-[#2D2A26]">
                            {fechaHora.includes('T') ? formatDateTime(fechaHora) : fechaHora || 'Sin fecha'}
                          </td>
                          <td className="p-3 font-bold text-[#3B6645]">
                            {formatCurrency(Number(abono?.monto ?? 0))}
                          </td>
                          <td className="p-3 text-[#5C5750]">{nota}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center bg-[#FAF7F2] rounded-xl border border-[#E8E0D2] text-xs text-[#8C8479]">
                Aún no se han registrado abonos parciales para esta cuenta.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EFE8DC] flex justify-between items-center text-[11px] text-[#8C8479]">
            <span>Documento generado por Control de Cuentas</span>
            <span>Usuario: {safeItem.persona}</span>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-[#F0E8DC] bg-[#FAF7F2] flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-[#6E6A63] hover:bg-[#EFE9DF] rounded-xl transition"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#C24E31] hover:bg-[#A84228] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar a PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
