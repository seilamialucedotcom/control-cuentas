export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    // Use no decimal places to match previous behavior; change to 2 if cents are needed
    maximumFractionDigits: 0,
    // ensure symbol (S/) is used
    currencyDisplay: 'symbol',
  }).format(amount);
}

// Calculate due date ISO string from creation date + diasMaximos
export function calculateDueDate(creationIso, diasMaximos) {
  const date = new Date(creationIso);
  if (isNaN(date.getTime())) {
    const now = new Date();
    now.setDate(now.getDate() + (diasMaximos || 0));
    return now.toISOString();
  }
  date.setDate(date.getDate() + (diasMaximos || 0));
  return date.toISOString();
}

// Format exact Date & Time of creation
export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const dateFormatted = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const timeFormatted = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateFormatted}, ${timeFormatted}`;
}

// Format Due Date cleanly
export function formatDateOnly(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Calculate days remaining or overdue status
export function getDaysRemainingStatus(dueIsoString, isPaid) {
  if (isPaid) {
    return {
      label: 'Saldado',
      badgeClass: 'bg-[#EAF2EB] text-[#3B6645] border-[#C1DEC7]',
      isUrgent: false,
    };
  }

  if (!dueIsoString) {
    return {
      label: 'Sin fecha límite',
      badgeClass: 'bg-[#F3EFEA] text-[#6E6A63] border-[#E2DAD0]',
      isUrgent: false,
    };
  }

  const dueDate = new Date(dueIsoString);
  if (isNaN(dueDate.getTime())) {
    return {
      label: 'Sin fecha',
      badgeClass: 'bg-[#F3EFEA] text-[#6E6A63] border-[#E2DAD0]',
      isUrgent: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dueDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Vencido hace ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'día' : 'días'}`,
      badgeClass: 'bg-[#FDF0EC] text-[#C24E31] border-[#F5C2B4]',
      isUrgent: true,
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Vence hoy',
      badgeClass: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
      isUrgent: true,
    };
  }
  if (diffDays === 1) {
    return {
      label: 'Vence mañana',
      badgeClass: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
      isUrgent: true,
    };
  }
  if (diffDays <= 3) {
    return {
      label: `Vence en ${diffDays} días`,
      badgeClass: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
      isUrgent: true,
    };
  }
  return {
    label: `Vence en ${diffDays} días`,
    badgeClass: 'bg-[#F3EFEA] text-[#5C5750] border-[#E2DAD0]',
    isUrgent: false,
  };
}
