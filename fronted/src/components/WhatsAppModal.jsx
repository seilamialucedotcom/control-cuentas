import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDateOnly } from '../utils/formatters';
import { X, Copy, ExternalLink, Check, MessageSquare } from 'lucide-react';

export const WhatsAppModal = ({
  item,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (item) {
      const pendiente = item.montoTotal - item.montoPagado;
      const isDeuda = item.tipo === 'deuda';
      const msg = isDeuda
        ? `Hola ${item.persona}, te escribo para confirmar el registro de mi pago pendiente por $${pendiente} correspondiente a "${item.concepto}". Fecha límite acordada: ${formatDateOnly(item.fechaLimite)}. Quedo atento/a para coordinar.`
        : `Hola ${item.persona}, te comparto este recordatorio sobre el saldo pendiente de $${pendiente} correspondiente a "${item.concepto}". La fecha límite registrada es ${formatDateOnly(item.fechaLimite)}. Agradezco confirmarme al realizar el pago.`;
      setCustomMessage(msg);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = item.telefono ? item.telefono.replace(/[^0-9]/g, '') : '';
    const encodedText = encodeURIComponent(customMessage);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2A26]/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full border border-[#EFE8DC] shadow-xl overflow-hidden">
        
        <div className="px-6 py-4 border-b border-[#F0E8DC] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h2 className="text-lg font-bold text-[#2D2A26] font-display flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#5B8266]" />
              <span>Recordatorio de WhatsApp</span>
            </h2>
            <p className="text-xs text-[#7A746B]">
              Genera y envía un mensaje claro con los detalles de la cuenta
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#2D2A26] hover:bg-[#EFE9DF] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
              Mensaje generado:
            </label>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-[#F2ECE1] hover:bg-[#EAE2D5] text-[#3D3A36] text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-[#E2DAD0]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#5B8266]" />
                  <span>Copiado al portapapeles</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="px-5 py-2.5 bg-[#5B8266] hover:bg-[#476C53] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir WhatsApp</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
