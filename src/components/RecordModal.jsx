import React, { useState, useEffect } from 'react';
import { calculateDueDate } from '../utils/formatters';
import { X, ArrowUpRight, ArrowDownLeft, DollarSign, User, Phone, FileText, Check, Clock } from 'lucide-react';

export const RecordModal = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  defaultType = 'cobro',
  existingPeople,
}) => {
  const safeExistingPeople = Array.isArray(existingPeople) ? existingPeople : [];
  const [tipo, setTipo] = useState(defaultType);
  const [personaSelectMode, setPersonaSelectMode] = useState('new');
  const [persona, setPersona] = useState('');
  const [concepto, setConcepto] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [diasMaximos, setDiasMaximos] = useState('7');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTipo(editingItem.tipo);
      setPersona(editingItem.persona);
      setPersonaSelectMode('new');
      setConcepto(editingItem.concepto);
      setMontoTotal(editingItem.montoTotal.toString());
      setDiasMaximos(editingItem.diasMaximos ? editingItem.diasMaximos.toString() : '7');
      setTelefono(editingItem.telefono || '');
      setNotas(editingItem.notas || '');
    } else {
      setTipo(defaultType);
      setPersona('');
      if (safeExistingPeople.length > 0) {
        setPersonaSelectMode('existing');
        setPersona(safeExistingPeople[0]);
      } else {
        setPersonaSelectMode('new');
      }
      setConcepto('');
      setMontoTotal('');
      setDiasMaximos('7');
      setTelefono('');
      setNotas('');
    }
  }, [editingItem, defaultType, isOpen, safeExistingPeople]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!persona.trim() || !montoTotal || Number(montoTotal) <= 0) return;

    const creationIso = editingItem ? editingItem.fechaCreacion : new Date().toISOString();
    const parsedDias = Math.max(0, parseInt(diasMaximos, 10) || 0);
    const calculatedDue = calculateDueDate(creationIso, parsedDias);

    onSave({
      id: editingItem?.id,
      tipo,
      persona: persona.trim(),
      concepto: concepto.trim() || 'Sin concepto',
      montoTotal: Number(montoTotal),
      diasMaximos: parsedDias,
      fechaCreacion: creationIso,
      fechaLimite: calculatedDue,
      categoria: 'General',
      telefono: telefono.trim(),
      notas: notas.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2A26]/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full border border-[#EFE8DC] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0E8DC] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h2 className="text-lg font-bold text-[#2D2A26] font-display">
              {editingItem ? 'Editar Registro' : 'Nuevo Registro'}
            </h2>
            <p className="text-xs text-[#7A746B]">
              Ingresa los datos correspondientes de la cuenta
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#2D2A26] hover:bg-[#EFE9DF] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Type Selector Toggle */}
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] uppercase tracking-wider block mb-1.5">
              Tipo de Registro
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#EFE9DF] rounded-xl border border-[#E2DAD0]">
              <button
                type="button"
                onClick={() => setTipo('deuda')}
                className={`py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  tipo === 'deuda'
                    ? 'bg-[#E07A5F] text-white shadow-xs'
                    : 'text-[#6E6A63] hover:text-[#2D2A26]'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 shrink-0" />
                <span>Deuda por pagar</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo('cobro')}
                className={`py-2.5 px-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  tipo === 'cobro'
                    ? 'bg-[#5B8266] text-white shadow-xs'
                    : 'text-[#6E6A63] hover:text-[#2D2A26]'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 shrink-0" />
                <span>Cobro pendiente</span>
              </button>
            </div>
          </div>

          {/* Persona Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#6E6A63] block">
                Persona *
              </label>
              {safeExistingPeople.length > 0 && !editingItem && (
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setPersonaSelectMode('existing');
                      setPersona(safeExistingPeople[0] || '');
                    }}
                    className={`font-medium ${
                      personaSelectMode === 'existing'
                        ? 'text-[#5B8266] underline font-bold'
                        : 'text-[#8C8479]'
                    }`}
                  >
                    Seleccionar existente
                  </button>
                  <span className="text-[#A39E93]">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonaSelectMode('new');
                      setPersona('');
                    }}
                    className={`font-medium ${
                      personaSelectMode === 'new'
                        ? 'text-[#5B8266] underline font-bold'
                        : 'text-[#8C8479]'
                    }`}
                  >
                    Nueva persona
                  </button>
                </div>
              )}
            </div>

            {personaSelectMode === 'existing' && safeExistingPeople.length > 0 && !editingItem ? (
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] font-medium focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
                >
                  {safeExistingPeople.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
                <input
                  type="text"
                  required
                  placeholder="Nombre de la persona o entidad"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] font-medium placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
                />
              </div>
            )}
          </div>

          {/* Monto Total & Días Máximos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
                Monto Total (S/) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-[#6E6A63] pointer-events-none select-none">S/</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={montoTotal}
                  onChange={(e) => setMontoTotal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
                Días máximos para pagar/cobrar *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
                <input
                  type="number"
                  required
                  min="0"
                  max="365"
                  placeholder="Ej: 7, 15, 30"
                  value={diasMaximos}
                  onChange={(e) => setDiasMaximos(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm font-semibold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
                />
              </div>
              <p className="text-[11px] text-[#8C8479] mt-1">
                Calcula la fecha límite automáticamente.
              </p>
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
              Concepto
            </label>
            <input
              type="text"
              placeholder="Descripción o motivo del pago/cobro"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
              Teléfono de contacto (Opcional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
              <input
                type="tel"
                placeholder="Número para recordatorio de WhatsApp"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-semibold text-[#6E6A63] block mb-1.5">
              Notas adicionales
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8C8479]" />
              <textarea
                rows={2}
                placeholder="Observaciones o acuerdos"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#D8CEBE] rounded-xl text-sm text-[#2D2A26] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
              />
            </div>
          </div>

          {/* Action Footer */}
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
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center gap-2 ${
                tipo === 'deuda'
                  ? 'bg-[#E07A5F] hover:bg-[#D1684E]'
                  : 'bg-[#5B8266] hover:bg-[#476C53]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingItem ? 'Guardar Cambios' : 'Guardar Registro'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
