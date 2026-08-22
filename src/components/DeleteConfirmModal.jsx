import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  item,
  onConfirmDelete,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full border border-[#EFE8DC] shadow-xl overflow-hidden p-6 space-y-4">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF0EC] text-[#C24E31] flex items-center justify-center shrink-0 border border-[#F5C2B4]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D2A26] font-display">
                Eliminar Registro
              </h2>
              <p className="text-xs text-[#8C8479]">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#2D2A26] hover:bg-[#F2ECE1] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E0D2] space-y-1 text-xs">
          <p className="text-[#2D2A26]">
            Persona: <strong>{item.persona}</strong>
          </p>
          <p className="text-[#5C5750]">
            Concepto: <strong>{item.concepto}</strong>
          </p>
          <p className="text-[#5C5750]">
            Monto Total: <strong>{formatCurrency(item.montoTotal)}</strong>
          </p>
        </div>

        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F2ECE1] hover:bg-[#E5DDD0] text-[#3D3A36] text-xs font-bold rounded-xl transition"
          >
            Cancelar
          </button>

          <button
            onClick={() => {
              onConfirmDelete(item.id);
              onClose();
            }}
            className="px-4 py-2 bg-[#C24E31] hover:bg-[#A84228] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sí, eliminar de forma permanente</span>
          </button>
        </div>

      </div>
    </div>
  );
};
