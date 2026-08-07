import { calculateDueDate } from '../utils/formatters';

const now = new Date();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_RECORDS = [
  {
    id: 'rec-1',
    tipo: 'cobro',
    persona: 'Martha Gómez',
    concepto: 'Venta de mercancía',
    montoTotal: 450,
    montoPagado: 200,
    diasMaximos: 7,
    fechaCreacion: threeDaysAgo,
    fechaLimite: calculateDueDate(threeDaysAgo, 7),
    categoria: 'Ventas',
    estado: 'pendiente',
    notas: 'Abono inicial recibido. Pendiente liquidación.',
    telefono: '+525551234567',
    abonos: [
      {
        id: 'ab-1',
        monto: 200,
        fechaHora: threeDaysAgo,
        nota: 'Primer abono en efectivo'
      }
    ]
  },
  {
    id: 'rec-2',
    tipo: 'deuda',
    persona: 'CFE - Electricidad',
    concepto: 'Recibo de luz mensual',
    montoTotal: 680,
    montoPagado: 0,
    diasMaximos: 5,
    fechaCreacion: twoDaysAgo,
    fechaLimite: calculateDueDate(twoDaysAgo, 5),
    categoria: 'Servicios',
    estado: 'pendiente',
    notas: 'Pago programado antes de la fecha límite.',
    abonos: []
  },
  {
    id: 'rec-3',
    tipo: 'cobro',
    persona: 'Carlos Mendoza',
    concepto: 'Préstamo personal',
    montoTotal: 1200,
    montoPagado: 0,
    diasMaximos: 15,
    fechaCreacion: fiveDaysAgo,
    fechaLimite: calculateDueDate(fiveDaysAgo, 15),
    categoria: 'Préstamos',
    estado: 'pendiente',
    notas: 'Compromiso de pago en quincena.',
    telefono: '+525559876543',
    abonos: []
  },
  {
    id: 'rec-4',
    tipo: 'deuda',
    persona: 'Farmacia San José',
    concepto: 'Medicamentos',
    montoTotal: 280,
    montoPagado: 280,
    diasMaximos: 3,
    fechaCreacion: tenDaysAgo,
    fechaLimite: calculateDueDate(tenDaysAgo, 3),
    categoria: 'Compras',
    estado: 'pagado',
    notas: 'Liquidado en su totalidad.',
    abonos: [
      {
        id: 'ab-2',
        monto: 280,
        fechaHora: tenDaysAgo,
        nota: 'Pago total efectuado'
      }
    ]
  }
];

export const CATEGORIES = [
  'General',
  'Servicios',
  'Préstamos',
  'Ventas',
  'Compras',
  'Otros'
];
