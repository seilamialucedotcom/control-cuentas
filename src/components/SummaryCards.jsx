import React from 'react';
import { formatCurrency, formatDateOnly } from '../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, Scale } from 'lucide-react';

export const SummaryCards = ({
  activeTab,
  setActiveTab,
  records,
}) => {
  const deudas = records.filter((r) => r.tipo === 'deuda');
  const cobros = records.filter((r) => r.tipo === 'cobro');

  const totalDeudasPendientes = deudas
    .filter((r) => r.estado === 'pendiente')
    .reduce((sum, r) => sum + (r.montoTotal - r.montoPagado), 0);

  const totalDeudasSaldadas = deudas
    .filter((r) => r.estado === 'pagado')
    .reduce((sum, r) => sum + r.montoTotal, 0);

  const totalCobrosPendientes = cobros
    .filter((r) => r.estado === 'pendiente')
    .reduce((sum, r) => sum + (r.montoTotal - r.montoPagado), 0);

  const totalCobrosSaldados = cobros
    .filter((r) => r.estado === 'pagado')
    .reduce((sum, r) => sum + r.montoTotal, 0);

  const balanceNeto = totalCobrosPendientes - totalDeudasPendientes;

  // Next upcoming item
  const getNextUpcoming = (items) => {
    const pendings = items
      .filter((r) => r.estado === 'pendiente' && r.fechaLimite)
      .sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());
    return pendings[0];
  };

  const proximaDeuda = getNextUpcoming(deudas);
  const proximoCobro = getNextUpcoming(cobros);
  const proximoGeneral = getNextUpcoming(records);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 items-stretch gap-1.5 bg-[#EFE9DF] p-1.5 rounded-2xl border border-[#E2DAD0]">
        <button
          onClick={() => setActiveTab('deudas')}
          className={`w-full min-w-0 py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-4 ${
            activeTab === 'deudas'
              ? 'bg-[#E07A5F] text-white shadow-xs'
              : 'text-[#6E6A63] hover:text-[#2D2A26] hover:bg-[#FAF7F2]'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 shrink-0" />
          <span>Lo que debo ({deudas.filter(r => r.estado === 'pendiente').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cobros')}
          className={`w-full min-w-0 py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-4 ${
            activeTab === 'cobros'
              ? 'bg-[#5B8266] text-white shadow-xs'
              : 'text-[#6E6A63] hover:text-[#2D2A26] hover:bg-[#FAF7F2]'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 shrink-0" />
          <span>Lo que me deben ({cobros.filter(r => r.estado === 'pendiente').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resumen')}
          className={`w-full min-w-0 py-2.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 sm:gap-4 ${
            activeTab === 'resumen'
              ? 'bg-[#3D3A36] text-white shadow-xs'
              : 'text-[#6E6A63] hover:text-[#2D2A26] hover:bg-[#FAF7F2]'
          }`}
        >
          <Scale className="w-4 h-4 shrink-0" />
          <span>Balance General</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Total Pending */}
        <div className="min-w-0 bg-[#FFFDF9] rounded-2xl p-3 sm:p-5 border border-[#EFE8DC] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="min-w-0 text-xs font-semibold uppercase tracking-wider text-[#8C8479] break-words">
              {activeTab === 'deudas'
                ? 'Total por Pagar'
                : activeTab === 'cobros'
                ? 'Total por Cobrar'
                : 'Balance Netos'}
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                activeTab === 'deudas'
                  ? 'bg-[#FDF0EC] text-[#E07A5F]'
                  : activeTab === 'cobros'
                  ? 'bg-[#EAF2EB] text-[#5B8266]'
                  : balanceNeto >= 0
                  ? 'bg-[#EAF2EB] text-[#5B8266]'
                  : 'bg-[#FDF0EC] text-[#E07A5F]'
              }`}
            >
              {activeTab === 'deudas' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : activeTab === 'cobros' ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
            </div>
          </div>

          <div>
            <div className="text-xl sm:text-3xl font-bold font-display text-[#2D2A26] break-words">
              {activeTab === 'deudas'
                ? formatCurrency(totalDeudasPendientes)
                : activeTab === 'cobros'
                ? formatCurrency(totalCobrosPendientes)
                : formatCurrency(balanceNeto)}
            </div>
            <p className="text-xs text-[#7A746B] mt-1">
              {activeTab === 'deudas'
                ? `${deudas.filter((r) => r.estado === 'pendiente').length} registros pendientes`
                : activeTab === 'cobros'
                ? `${cobros.filter((r) => r.estado === 'pendiente').length} registros pendientes`
                : balanceNeto >= 0
                ? 'Saldo neto a favor'
                : 'Saldo neto deudor'}
            </p>
          </div>
        </div>

        {/* Card 2: Upcoming Due Date */}
        <div className="min-w-0 bg-[#FFFDF9] rounded-2xl p-3 sm:p-5 border border-[#EFE8DC] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="min-w-0 text-xs font-semibold uppercase tracking-wider text-[#8C8479] break-words">
              Próximo Vencimiento
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div>
            {(() => {
              const currentUpcoming =
                activeTab === 'deudas'
                  ? proximaDeuda
                  : activeTab === 'cobros'
                  ? proximoCobro
                  : proximoGeneral;

              if (currentUpcoming) {
                const pendiente = currentUpcoming.montoTotal - currentUpcoming.montoPagado;
                return (
                  <>
                    <div className="text-base sm:text-lg font-bold font-display text-[#2D2A26] break-words">
                      {currentUpcoming.persona}
                    </div>
                    <p className="text-xs font-medium text-[#D97706] mt-0.5">
                      {formatCurrency(pendiente)} • {formatDateOnly(currentUpcoming.fechaLimite)}
                    </p>
                  </>
                );
              }

              return (
                <>
                  <div className="text-base font-semibold text-[#5B8266]">Sin vencimientos</div>
                  <p className="text-xs text-[#7A746B] mt-1">No hay fechas pendientes próximas.</p>
                </>
              );
            })()}
          </div>
        </div>

        {/* Card 3: Resolved Total */}
        <div className="min-w-0 bg-[#FFFDF9] rounded-2xl p-3 sm:p-5 border border-[#EFE8DC] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="min-w-0 text-xs font-semibold uppercase tracking-wider text-[#8C8479] break-words">
              {activeTab === 'deudas'
                ? 'Total Ya Pagado'
                : activeTab === 'cobros'
                ? 'Total Ya Cobrado'
                : 'Registros Saldados'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#EAF2EB] text-[#5B8266] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-xl sm:text-3xl font-bold font-display text-[#2D2A26] break-words">
              {activeTab === 'deudas'
                ? formatCurrency(totalDeudasSaldadas)
                : activeTab === 'cobros'
                ? formatCurrency(totalCobrosSaldados)
                : `${records.filter((r) => r.estado === 'pagado').length} registros`}
            </div>
            <p className="text-xs text-[#7A746B] mt-1">
              {activeTab === 'deudas'
                ? 'Deudas totalmente saldadas'
                : activeTab === 'cobros'
                ? 'Cobros recibidos en su totalidad'
                : 'Cuentas finalizadas'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
