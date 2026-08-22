import imageCompression from 'browser-image-compression';
import React, { useState } from 'react';
import {
  formatCurrency,
  formatDateTime,
  formatDateOnly,
  getDaysRemainingStatus,
} from '../utils/formatters';
import {
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  Trash2,
  Edit3,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  FileText,
  History,
  Image,
  X,
} from 'lucide-react';

export const RecordCard = ({
  item,
  onOpenAbonoModal,
  onOpenWhatsAppModal,
  onOpenPdfModal,
  onEdit,
  onDelete,
  onAddImages,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const safeImages = Array.isArray(item?.imagenes) ? item.imagenes : [];
  const isDeuda = item.tipo === 'deuda';
  const isPagado = item.estado === 'pagado';
  const pendiente = item.montoTotal - item.montoPagado;
  const porcentajePagado = Math.min(100, Math.round((item.montoPagado / item.montoTotal) * 100));

  const statusInfo = getDaysRemainingStatus(item.fechaLimite, isPagado);

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle file input change: read files as data URLs and forward to parent
  const handleImageInputChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Configuración de compresión (máximo 1MB por foto)
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      // 1. Comprime todas las imágenes de la tablet/móvil
      const compressedFiles = await Promise.all(
        files.map((file) => imageCompression(file, options))
      );

      // 2. Convierte las imágenes comprimidas a Base64
      const readers = compressedFiles.map(
        (file) =>
          new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(file);
          })
      );

      const dataUrls = await Promise.all(readers);

      // 3. Envía los datos al padre
      if (onAddImages) onAddImages(item.id, dataUrls);

      // Reset input para permitir volver a subir el mismo archivo
      e.target.value = '';
    } catch (err) {
      console.error('Error al comprimir o leer las imágenes:', err);
    }
  };

  return (
    <div
      className={`rounded-2xl p-3 sm:p-5 transition-all duration-200 border ${
        isPagado
          ? 'bg-[#FFFDF9]/70 border-[#E5DDD0] opacity-85'
          : isDeuda
          ? 'bg-[#FFFDF9] border-[#F3E2DB] shadow-xs hover:border-[#E07A5F]/40'
          : 'bg-[#FFFDF9] border-[#DBE7DD] shadow-xs hover:border-[#5B8266]/40'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        
        {/* Person & Header info */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F2ECE1] text-[#5C5750] flex items-center justify-center font-bold text-sm shrink-0 border border-[#E2DAD0]">
            {getInitials(item.persona) || <User className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="font-bold text-base sm:text-lg text-[#2D2A26] font-display">
                {item.persona}
              </h3>

              {/* Type Badge */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md border ${
                  isDeuda
                    ? 'bg-[#FDF0EC] text-[#C24E31] border-[#F5C2B4]'
                    : 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]'
                }`}
              >
                {isDeuda ? (
                  <>
                    <ArrowUpRight className="w-3 h-3" /> Deuda por pagar
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-3 h-3" /> Cobro pendiente
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-[#5C5750] font-normal leading-relaxed">
              {item.concepto}
            </p>

            {/* Creation Date and Time */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8C8479] pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#A39E93]" />
                Registrado: {formatDateTime(item.fechaCreacion)}
              </span>
              <span>•</span>
              <span>Plazo: {item.diasMaximos} {item.diasMaximos === 1 ? 'día' : 'días'}</span>
            </div>

            {item.notas && (
              <p className="text-xs text-[#6E6A63] bg-[#F7F3EB] p-2 rounded-lg mt-1 border border-[#EBE3D5]">
                Nota: {item.notas}
              </p>
            )}
          </div>
        </div>

        {/* Amount & Due Date */}
        <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-[#F0E8DC] pt-3 sm:pt-0">
          <div className="text-right">
            <span className="text-xs text-[#8C8479] font-medium block">
              {isPagado ? 'Monto Total' : 'Pendiente:'}
            </span>
            <div
              className={`text-2xl font-bold font-display ${
                isPagado
                  ? 'text-[#6E6A63] line-through'
                  : isDeuda
                  ? 'text-[#C24E31]'
                  : 'text-[#3B6645]'
              }`}
            >
              {formatCurrency(isPagado ? item.montoTotal : pendiente)}
            </div>
            {item.montoPagado > 0 && !isPagado && (
              <span className="text-xs text-[#8C8479] block mt-0.5">
                Total: {formatCurrency(item.montoTotal)} (Abonado: {formatCurrency(item.montoPagado)})
              </span>
            )}
          </div>

          {/* Due date badge */}
          <div className="mt-2 text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md font-semibold border ${statusInfo.badgeClass}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{statusInfo.label}</span>
            </span>
            <span className="text-[11px] text-[#8C8479] block mt-0.5">
              Límite: {formatDateOnly(item.fechaLimite)}
            </span>
          </div>
        </div>

      </div>

      {/* Progress Bar for Partial Payments */}
      {item.montoPagado > 0 && !isPagado && (
        <div className="mt-3 pt-3 border-t border-[#F0E8DC] space-y-1">
          <div className="flex justify-between text-xs text-[#6E6A63] font-medium">
            <span>Abonado: {formatCurrency(item.montoPagado)}</span>
            <span>{porcentajePagado}% del total</span>
          </div>
          <div className="w-full h-2 bg-[#EFE8DC] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isDeuda ? 'bg-[#E07A5F]' : 'bg-[#5B8266]'
              }`}
              style={{ width: `${porcentajePagado}%` }}
            />
          </div>
        </div>
      )}

      {/* Mini Historial de Abonos / Acciones Parciales (Non-editable) */}
      {item.abonos.length > 0 && (
        <div className="mt-3 p-2 sm:p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E0D2] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#6E6A63]">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#8C8479]" />
              Historial de abonos
            </span>
            <span className="text-[11px] font-normal text-[#8C8479]">
              {item.abonos.length} {item.abonos.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="space-y-1">
            {item.abonos.map((a, idx) => (
              <div
                key={a.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs p-2 bg-white rounded-lg border border-[#EAE3D5] text-[#3D3A36]"
              >
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-[#5B8266] shrink-0" />
                  <span className="font-bold text-[#2D2A26]">
                    Abono de {formatCurrency(a.monto)}
                  </span>
                  {a.nota && (
                    <span className="text-[#6E6A63] text-[11px] truncate max-w-[200px]">
                      ({a.nota})
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#8C8479] mt-0.5 sm:mt-0 font-medium">
                  {a.fechaHora.includes('T') ? formatDateTime(a.fechaHora) : a.fechaHora}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ver imágenes */}
      {safeImages.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A63]">
              Ver imágenes
            </span>
            <span className="text-[11px] text-[#8C8479]">
              {safeImages.length} {safeImages.length === 1 ? 'imagen' : 'imágenes'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {safeImages.map((src, idx) => (
              <button
                key={`${src}-${idx}`}
                type="button"
                onClick={() => setSelectedImage({ src, index: idx, persona: item.persona, concepto: item.concepto, images: safeImages })}
                className="group relative block overflow-hidden rounded-xl border border-[#E2DAD0] bg-[#F7F3EB] shadow-xs transition hover:scale-[1.01] hover:border-[#C1DEC7]"
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={src}
                    alt={`Imagen ${idx + 1} de ${item.persona}`}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2A26]/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[#EFE8DC] bg-[#FFFDF9] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#2D2A26]/70 text-white transition hover:bg-[#2D2A26]"
              aria-label="Cerrar vista de imagen"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-[#F7F3EB] p-3">
              <div className="flex items-center justify-between gap-3 text-[11px] text-[#6E6A63]">
                <span className="font-bold uppercase tracking-wider">Ver imágenes</span>
                <span>
                  {selectedImage.persona} • {selectedImage.concepto}
                </span>
              </div>
            </div>

            <div className="relative bg-white">
              <button
                type="button"
                onClick={() => {
                  const prevIndex = selectedImage.index > 0 ? selectedImage.index - 1 : selectedImage.images.length - 1;
                  setSelectedImage({
                    src: selectedImage.images[prevIndex],
                    index: prevIndex,
                    persona: selectedImage.persona,
                    concepto: selectedImage.concepto,
                    images: selectedImage.images,
                  });
                }}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#2D2A26]/70 text-white transition hover:bg-[#2D2A26]"
                aria-label="Imagen anterior"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextIndex = selectedImage.index < selectedImage.images.length - 1 ? selectedImage.index + 1 : 0;
                  setSelectedImage({
                    src: selectedImage.images[nextIndex],
                    index: nextIndex,
                    persona: selectedImage.persona,
                    concepto: selectedImage.concepto,
                    images: selectedImage.images,
                  });
                }}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#2D2A26]/70 text-white transition hover:bg-[#2D2A26]"
                aria-label="Imagen siguiente"
              >
                ›
              </button>

              <div className="max-h-[75vh] overflow-auto bg-white">
                <img
                  src={selectedImage.src}
                  alt={`Vista ampliada ${selectedImage.index + 1}`}
                  className="h-auto max-h-[70vh] w-full object-contain bg-[#FFFDF9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#F0E8DC] bg-[#FAF7F2] px-4 py-3 text-xs text-[#5C5750]">
              <span>Imagen {selectedImage.index + 1} de {selectedImage.images.length}</span>
              <span>{selectedImage.persona}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-[#F0E8DC] flex flex-wrap items-center justify-between gap-4">
        
        {/* Informative Status Badge (Read-only, derived from payments) */}
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-xl font-bold border ${
            isPagado
              ? 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]'
              : item.montoPagado > 0
              ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
              : 'bg-[#FAF7F2] text-[#6E6A63] border-[#E2DAD0]'
          }`}
        >
          {isPagado ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#3B6645]" />
              <span>Completado / Saldado</span>
            </>
          ) : item.montoPagado > 0 ? (
            <>
              <Clock className="w-4 h-4 text-[#92400E]" />
              <span>Pendiente ({porcentajePagado}% pagado)</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-[#8C8479]" />
              <span>Pendiente sin abonos</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Abono Button */}
          {!isPagado && (
            <button
              onClick={() => onOpenAbonoModal(item)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-[#F5EFE6] hover:bg-[#EAE2D5] text-[#5C5750] font-medium rounded-xl transition border border-[#E2DAD0]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#5B8266]" />
              <span>Abonar</span>
            </button>
          )}

          {/* PDF Detail Button for Single User */}
          <button
            onClick={() => onOpenPdfModal(item)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-[#FDF0EC] hover:bg-[#FADBD2] text-[#C24E31] font-bold rounded-xl transition border border-[#F5C2B4]"
            title="Ver detalle y comprobante en PDF de este usuario"
          >
            <FileText className="w-3.5 h-3.5 text-[#C24E31]" />
            <span>PDF Detalle</span>
          </button>

          {/* WhatsApp Reminder Button */}
          {!isPagado && (
            <button
              onClick={() => onOpenWhatsAppModal(item)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-[#F5EFE6] hover:bg-[#EAE2D5] text-[#3D3A36] font-medium rounded-xl transition border border-[#E2DAD0]"
              title="Generar mensaje de recordatorio"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Image upload: hidden input + trigger button */}
          <input
            id={`img-input-${item.id}`}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleImageInputChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => {
              const el = document.getElementById(`img-input-${item.id}`);
              if (el) el.click();
            }}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-[#EAF2EB] hover:bg-[#E0F0E6] text-[#3B6645] font-medium rounded-xl transition border border-[#C1DEC7]"
            title="Agregar imagen(es) (tomar o subir)"
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imagen</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-[#7A746B] hover:text-[#2D2A26] hover:bg-[#F2ECE1] rounded-lg transition"
            title="Editar registro"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 text-[#A39E93] hover:text-[#C24E31] hover:bg-[#FDF0EC] rounded-lg transition"
            title="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};