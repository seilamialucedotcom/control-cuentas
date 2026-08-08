import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { downloadPersonStatementPdf } from '../utils/printHelper';
import { RecordCard } from './RecordCard';
import {
  ArrowLeft,
  User,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from 'lucide-react';

export const PersonDetailView = ({
  personGroup,
  onBack,
  onOpenAbonoModal,
  onOpenWhatsAppModal,
  onOpenPdfModal,
  onEdit,
  onDelete,
  onAddNewForPerson,
  onAddImages,
}) => {
  const [filterType, setFilterType] = useState('todos');

  const pendingCount = personGroup.records.filter((r) => r.estado === 'pendiente').length;
  const isAllSettled = pendingCount === 0;

  const filteredRecords = personGroup.records.filter((r) => {
    if (filterType === 'deuda') return r.tipo === 'deuda';
    if (filterType === 'cobro') return r.tipo === 'cobro';
    return true;
  });

  const handleDownloadFullStatement = () => {
    downloadPersonStatementPdf(personGroup.nombre, personGroup.records);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FFFDF9] hover:bg-[#EFE9DF] text-[#3D3A36] text-xs font-bold rounded-xl border border-[#E2DAD0] transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#8C8479]" />
          <span>Volver al listado general</span>
        </button>

        <button
          onClick={handleDownloadFullStatement}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C24E31] hover:bg-[#A84228] text-white text-xs font-bold rounded-xl transition shadow-xs"
          title="Descargar el PDF completo de las cuentas de este usuario"
        >
          <Download className="w-4 h-4" />
          <span>Descargar PDF</span>
        </button>
      </div>

      {/* Person Summary Header Card */}
      <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#EFE8DC] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5B8266] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#2D2A26] font-display">
                  {personGroup.nombre}
                </h1>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isAllSettled
                      ? 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]'
                      : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                  }`}
                >
                  {isAllSettled ? 'Cuentas Saldadas' : `${pendingCount} pendiente(s)`}
                </span>
              </div>
              <p className="text-xs text-[#7A746B] mt-0.5">
                Total de cuentas registradas: <strong className="text-[#2D2A26]">{personGroup.records.length}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onAddNewForPerson(personGroup.nombre)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5B8266] hover:bg-[#476C53] text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Cuenta a este usuario</span>
          </button>
        </div>

        {/* Financial Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F0E8DC]">
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#F3E2DB] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8C8479] font-medium flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-[#C24E31]" />
                Deuda pendiente (Tú le debes):
              </span>
              <span className="text-xl font-bold font-display text-[#C24E31] block mt-1">
                {formatCurrency(personGroup.totalDeudaPendiente)}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#DBE7DD] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#8C8479] font-medium flex items-center gap-1">
                <ArrowDownLeft className="w-4 h-4 text-[#3B6645]" />
                Cobro pendiente (Te debe a ti):
              </span>
              <span className="text-xl font-bold font-display text-[#3B6645] block mt-1">
                {formatCurrency(personGroup.totalCobroPendiente)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter Tabs for this person's accounts */}
      <div className="flex items-center justify-between bg-[#FFFDF9] p-3 rounded-2xl border border-[#EFE8DC]">
        <span className="text-xs font-bold text-[#6E6A63] uppercase tracking-wider pl-2">
          Cuentas e Historial de Abonos
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'todos'
                ? 'bg-[#3D3A36] text-white'
                : 'bg-[#FAF7F2] text-[#6E6A63] hover:bg-[#EFE9DF] border border-[#E2DAD0]'
            }`}
          >
            Todas ({personGroup.records.length})
          </button>
          <button
            onClick={() => setFilterType('deuda')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'deuda'
                ? 'bg-[#C24E31] text-white'
                : 'bg-[#FAF7F2] text-[#6E6A63] hover:bg-[#EFE9DF] border border-[#E2DAD0]'
            }`}
          >
            Deudas
          </button>
          <button
            onClick={() => setFilterType('cobro')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'cobro'
                ? 'bg-[#3B6645] text-white'
                : 'bg-[#FAF7F2] text-[#6E6A63] hover:bg-[#EFE9DF] border border-[#E2DAD0]'
            }`}
          >
            Cobros
          </button>
        </div>
      </div>

      {/* Individual Account Cards */}
      <div className="space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((item) => (
            <RecordCard
              key={item.id}
              item={item}
              onOpenAbonoModal={onOpenAbonoModal}
              onOpenWhatsAppModal={onOpenWhatsAppModal}
              onOpenPdfModal={onOpenPdfModal}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddImages={onAddImages}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-[#FFFDF9] rounded-2xl border border-[#EFE8DC] text-xs text-[#8C8479]">
            No hay cuentas en este filtro para {personGroup.nombre}.
          </div>
        )}
      </div>

    </div>
  );
};
