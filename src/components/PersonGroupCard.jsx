import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { User, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const PersonGroupCard = ({
  personGroup,
  onSelectPerson,
}) => {
  const pendingCount = personGroup.records.filter((r) => r.estado === 'pendiente').length;
  const isAllSettled = pendingCount === 0;

  return (
    <div
      onClick={() => onSelectPerson(personGroup.nombre)}
      className="bg-[#FFFDF9] hover:bg-[#FAF7F2] rounded-2xl border border-[#EFE8DC] p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
    >
      {/* Left: User Avatar & Name */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#5B8266] text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform shadow-xs">
          <User className="w-6 h-6" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#2D2A26] font-display group-hover:text-[#5B8266] transition-colors">
              {personGroup.nombre}
            </h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isAllSettled
                  ? 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]'
                  : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
              }`}
            >
              {isAllSettled
                ? 'Saldado'
                : `${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`}
            </span>
          </div>

          <p className="text-xs text-[#7A746B]">
            {personGroup.records.length} {personGroup.records.length === 1 ? 'cuenta registrada' : 'cuentas registradas'}
          </p>
        </div>
      </div>

      {/* Right: Consolidated Financial Totals & Navigation CTA */}
      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-[#F0E8DC] pt-3 sm:pt-0">
        <div className="flex items-center gap-4">
          {personGroup.totalDeudaPendiente > 0 && (
            <div className="text-right">
              <span className="text-[11px] text-[#8C8479] font-medium flex items-center justify-end gap-0.5">
                <ArrowUpRight className="w-3 h-3 text-[#C24E31]" />
                Debes pagar:
              </span>
              <span className="font-bold text-base text-[#C24E31]">
                {formatCurrency(personGroup.totalDeudaPendiente)}
              </span>
            </div>
          )}

          {personGroup.totalCobroPendiente > 0 && (
            <div className="text-right">
              <span className="text-[11px] text-[#8C8479] font-medium flex items-center justify-end gap-0.5">
                <ArrowDownLeft className="w-3 h-3 text-[#3B6645]" />
                Te debe:
              </span>
              <span className="font-bold text-base text-[#3B6645]">
                {formatCurrency(personGroup.totalCobroPendiente)}
              </span>
            </div>
          )}

          {personGroup.totalDeudaPendiente === 0 && personGroup.totalCobroPendiente === 0 && (
            <span className="text-xs text-[#8C8479] italic">Sin saldos pendientes</span>
          )}
        </div>

        <button className="px-3.5 py-2 bg-[#F2ECE1] group-hover:bg-[#5B8266] group-hover:text-white text-[#5C5750] text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0">
          <span>Ver Detalle</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
