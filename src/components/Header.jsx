import React from 'react';
import { LogOut, Plus, Wallet } from 'lucide-react';

export const Header = ({
  onOpenAddModal,
  user,
  onLogout,
}) => {
  return (
    <header className="bg-[#FFFDF9] border-b border-[#EFE8DC] pt-5 pb-5 px-4 sm:px-8 shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-row flex-wrap sm:items-center sm:justify-between gap-4">
        
        {/* Title & Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5B8266] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-[#2D2A26] tracking-tight">
              Control de Cuentas
            </h1>
            <p className="text-xs text-[#7A746B]">
              Gestión de deudas por pagar y saldos por cobrar
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-[#2D2A26]">{user?.name}</p>
            <p className="text-[11px] text-[#8C8479]">{user?.email}</p>
          </div>
          <button onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión" className="p-2.5 text-[#6E6A63] hover:text-[#A63F29] hover:bg-[#FDF0EC] rounded-xl transition">
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 bg-[#5B8266] hover:bg-[#476C53] text-white font-semibold text-xs sm:text-sm rounded-2xl transition shadow-sm flex items-center gap-4"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>

      </div>
    </header>
  );
};
