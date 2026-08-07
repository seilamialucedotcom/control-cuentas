export const RECORD_TYPES = ['deuda', 'cobro'];
export const RECORD_STATUSES = ['pendiente', 'pagado'];
export const CATEGORIES = ['General', 'Servicios', 'Préstamos', 'Ventas', 'Compras', 'Otros'];
export const VIEW_TABS = ['deudas', 'cobros', 'resumen'];
export const FILTER_STATUSES = ['todos', 'pendiente', 'pagado'];

export const EMPTY_ABONO = {
  id: '',
  monto: 0,
  fechaHora: '',
  nota: '',
};

export const EMPTY_RECORD_ITEM = {
  id: '',
  tipo: 'deuda',
  persona: '',
  concepto: '',
  montoTotal: 0,
  montoPagado: 0,
  diasMaximos: 0,
  fechaCreacion: '',
  fechaLimite: '',
  categoria: 'General',
  estado: 'pendiente',
  notas: '',
  telefono: '',
  abonos: [],
};

export const EMPTY_PERSON_GROUP = {
  nombre: '',
  records: [],
  totalDeudaPendiente: 0,
  totalCobroPendiente: 0,
};
