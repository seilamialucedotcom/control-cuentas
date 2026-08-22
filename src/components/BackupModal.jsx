import React, { useRef, useState } from 'react';
import { X, Download, Upload, Printer, Check, AlertCircle } from 'lucide-react';

export const BackupModal = ({
  isOpen,
  onClose,
  records,
  onImportRecords,
}) => {
  const fileInputRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `control_de_cuentas_respaldo_${new Date().toISOString().split('T')[0]}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMessage({ type: 'success', text: 'Respaldo exportado correctamente.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Error al exportar el archivo de respaldo.' });
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
          setStatusMessage({ type: 'success', text: 'Datos importados con éxito.' });
        } else {
          setStatusMessage({ type: 'error', text: 'El archivo no contiene un formato de respaldo válido.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Formato de archivo inválido.' });
      }
    };
    reader.readAsText(file);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2A26]/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full border border-[#EFE8DC] shadow-xl overflow-hidden">
        
        <div className="px-6 py-4 border-b border-[#F0E8DC] flex items-center justify-between bg-[#FAF7F2]">
          <div>
            <h2 className="text-lg font-bold text-[#2D2A26] font-display">
              Respaldos e Impresión
            </h2>
            <p className="text-xs text-[#7A746B]">
              Resguarda o restaura la información de tus cuentas
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
          
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-4 border ${
                statusMessage.type === 'success'
                  ? 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]'
                  : 'bg-[#FDF0EC] text-[#C24E31] border-[#F5C2B4]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E0D2] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">Exportar Respaldo</h3>
              <p className="text-xs text-[#7A746B]">
                Descarga una copia completa de tus {records.length} registros en formato JSON.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-[#5B8266] hover:bg-[#476C53] text-white text-xs font-semibold rounded-xl transition shrink-0 flex items-center gap-4"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E0D2] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">Importar Respaldo</h3>
              <p className="text-xs text-[#7A746B]">
                Restaura información previamente descargada.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#3D3A36] text-xs font-semibold rounded-xl border border-[#D8CEBE] transition shrink-0 flex items-center gap-4"
            >
              <Upload className="w-4 h-4 text-[#8C8479]" />
              <span>Importar</span>
            </button>
          </div>

          {/* Print */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E0D2] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">Imprimir Resumen</h3>
              <p className="text-xs text-[#7A746B]">
                Genera una vista imprimible de la lista actual de cuentas.
              </p>
            </div>
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#3D3A36] text-xs font-semibold rounded-xl border border-[#D8CEBE] transition shrink-0 flex items-center gap-4"
            >
              <Printer className="w-4 h-4 text-[#8C8479]" />
              <span>Imprimir</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
