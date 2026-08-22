import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { X, PlusCircle, Check, DollarSign, FileText } from 'lucide-react';

export const AbonoModal = ({
  item,
  isOpen,
  onClose,
  onAddAbono,
}) => {
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');

  if (!isOpen || !item) return null;

  const pendiente = item.montoTotal - item.montoPagado;

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = Number(monto);
    if (!valor || valor <= 0) return;

    onAddAbono(item.id, valor, nota.trim());
    setMonto('');
    setNota('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2A26]/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full border border-[#EFE8DC] shadow-xl overflow-hidden">
        
        <div className="px-6 py-4 border-b border-[#F0E8DC] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h2 className="text-lg font-bold text-[#2D2A26] font-display flex items-center gap-4">
              <PlusCircle className="w-5 h-5 text-[#5B8266]" />
              <span>Registrar Abono</span>
            </h2>
            <p className="text-xs text-[#7A746B]">
              {item.persona} — {item.concepto}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#2D2A26] hover:bg-[#EFE9DF] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Summary Box */}
          <div className="bg-[#F7F3EB] p-3.5 rounded-xl border border-[#EBE3D5] flex justify-between items-center text-xs">
            <div>
              <span className="text-[#8C8479] block">Total:</span>
              <span className="font-bold text-[#2D2A26]">{formatCurrency(item.montoTotal)}</span>
            </div>
            <div>
              <span className="text-[#8C8479] block">Abonado:</span>
              <span className="font-bold text-[#5B8266]">{formatCurrency(item.montoPagado)}</span>
            </div>
            <div className="text-right">
              <span className="text-[#8C8479] block">Pendiente:</span>
              <span className="font-bold text-[#C24E31]">{formatCurrency(pendiente)}</span>
            </div>
          </div>

          {/* Monto de este abono */}
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
              Monto a abonar (S/) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
              <input
                type="number"
                required
                min="1"
                max={pendiente}
                step="any"
                placeholder={pendiente.toString()}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-base font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
              />
            </div>
            <p className="text-[11px] text-[#8C8479] mt-1">
              Monto máximo permitido: {formatCurrency(pendiente)}
            </p>
          </div>

          {/* Nota del abono */}
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
              Nota o comprobante (Opcional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
              <input
                type="text"
                placeholder="Ej: Pago parcial en efectivo, transferencia bancaria"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
              />
            </div>
          </div>

          {/* History of Previous Abonos */}
          {item.abonos.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
                Historial de abonos
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {item.abonos.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 bg-[#FAF7F2] text-xs rounded-lg border border-[#EAE3D5]"
                  >
                    <div>
                      <span className="font-bold text-[#2D2A26]">{formatCurrency(a.monto)}</span>
                      {a.nota && <span className="text-[#8C8479] ml-1.5">({a.nota})</span>}
                    </div>
                    <span className="text-[11px] text-[#A39E93]">{a.fechaHora}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#F0E8DC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#6E6A63] hover:bg-[#F2ECE1] rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5B8266] hover:bg-[#476C53] text-white transition-all shadow-xs flex items-center gap-4"
            >
              <Check className="w-4 h-4" />
              <span>Registrar Abono</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
