import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_RECORDS } from './data/initialData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { RecordCard } from './components/RecordCard';
import { PersonGroupCard } from './components/PersonGroupCard';
import { PersonDetailView } from './components/PersonDetailView';
import { RecordModal } from './components/RecordModal';
import { AbonoModal } from './components/AbonoModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PdfDetailModal } from './components/PdfDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { formatCurrency } from './utils/formatters';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

const STORAGE_KEY = 'control_cuentas_records_v3';

export function App() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading records from localStorage', e);
    }
    return INITIAL_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage', e);
    }
  }, [records]);

  const [activeTab, setActiveTab] = useState('deudas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonName, setSelectedPersonName] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedPersonName(null);
  };

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('deuda');

  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [abonoTargetItem, setAbonoTargetItem] = useState(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTargetItem, setWhatsAppTargetItem] = useState(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetItem, setPdfTargetItem] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);

  const existingPeople = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.persona) set.add(r.persona);
    });
    return Array.from(set).sort();
  }, [records]);

  const handleSaveRecord = (data) => {
    if (data.id) {
      setRecords((prev) =>
        prev.map((r) => {
          if (r.id === data.id) {
            const isFullyPaid = r.montoPagado >= data.montoTotal;
            return {
              ...r,
              ...data,
              estado: isFullyPaid ? 'pagado' : 'pendiente',
            };
          }
          return r;
        })
      );
    } else {
      const newRecord = {
        ...data,
        id: 'rec-' + Date.now(),
        montoPagado: 0,
        estado: 'pendiente',
        abonos: [],
      };
      setRecords((prev) => [newRecord, ...prev]);
    }
  };

  // Add Partial Payment (Abono)
  const handleAddAbono = (itemId, monto, nota) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === itemId) {
          const newMontoPagado = Math.min(r.montoTotal, r.montoPagado + monto);
          const isPaidNow = newMontoPagado >= r.montoTotal;
          const newAbono = {
            id: 'ab-' + Date.now(),
            monto,
            fechaHora: new Date().toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            nota: nota || undefined,
          };
          return {
            ...r,
            montoPagado: newMontoPagado,
            estado: isPaidNow ? 'pagado' : 'pendiente',
            abonos: [newAbono, ...r.abonos],
          };
        }
        return r;
      })
    );
  };

  // Add images (from camera or file upload) to a record
  const handleAddImages = (itemId, dataUrls) => {
    if (!Array.isArray(dataUrls) || dataUrls.length === 0) return;
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === itemId) {
          return {
            ...r,
            imagenes: [...(r.imagenes || []), ...dataUrls],
          };
        }
        return r;
      })
    );
  };

  // Delete Record
  const handleOpenDeleteModal = (id) => {
    const item = records.find((r) => r.id === id);
    if (item) {
      setDeleteTargetItem(item);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = (id) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      if (selectedPersonName) {
        const remainingForPerson = updated.filter((r) => r.persona === selectedPersonName);
        if (remainingForPerson.length === 0) {
          setSelectedPersonName(null);
        }
      }
      return updated;
    });
  };

  // Grouped by Person
  const personGroups = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      const current = map.get(r.persona) || [];
      current.push(r);
      map.set(r.persona, current);
    });

    const groups = [];
    map.forEach((personRecords, nombre) => {
      let totalDeudaPendiente = 0;
      let totalCobroPendiente = 0;

      personRecords.forEach((r) => {
        if (r.estado === 'pendiente') {
          const pendiente = r.montoTotal - r.montoPagado;
          if (r.tipo === 'deuda') totalDeudaPendiente += pendiente;
          if (r.tipo === 'cobro') totalCobroPendiente += pendiente;
        }
      });

      // Filter by search query or tab context
      const matchesSearch =
        !searchQuery ||
        nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        personRecords.some(
          (pr) => pr.concepto.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filter by tab type if in deudas or cobros tab
      let matchesTab = true;
      if (activeTab === 'deudas') {
        matchesTab = personRecords.some((r) => r.tipo === 'deuda');
      } else if (activeTab === 'cobros') {
        matchesTab = personRecords.some((r) => r.tipo === 'cobro');
      }

      if (matchesSearch && matchesTab) {
        groups.push({
          nombre,
          records: personRecords,
          totalDeudaPendiente,
          totalCobroPendiente,
        });
      }
    });

    return groups.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [records, searchQuery, activeTab]);

  // Selected Person Group Object
  const selectedPersonGroup = useMemo(() => {
    if (!selectedPersonName) return null;
    const recordsForPerson = records.filter((r) => r.persona === selectedPersonName);
    let totalDeudaPendiente = 0;
    let totalCobroPendiente = 0;

    recordsForPerson.forEach((r) => {
      if (r.estado === 'pendiente') {
        const pendiente = r.montoTotal - r.montoPagado;
        if (r.tipo === 'deuda') totalDeudaPendiente += pendiente;
        if (r.tipo === 'cobro') totalCobroPendiente += pendiente;
      }
    });

    return {
      nombre: selectedPersonName,
      records: recordsForPerson,
      totalDeudaPendiente,
      totalCobroPendiente,
    };
  }, [selectedPersonName, records]);

  // Totals for Balance General view
  const totalDeudasGeneral = records
    .filter((r) => r.tipo === 'deuda' && r.estado === 'pendiente')
    .reduce((sum, r) => sum + (r.montoTotal - r.montoPagado), 0);

  const totalCobrosGeneral = records
    .filter((r) => r.tipo === 'cobro' && r.estado === 'pendiente')
    .reduce((sum, r) => sum + (r.montoTotal - r.montoPagado), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] font-sans pb-16">
      
      {/* Header */}
      <Header
        onOpenAddModal={() => {
          setEditingItem(null);
          setModalDefaultType(activeTab === 'cobros' ? 'cobro' : 'deuda');
          setIsRecordModalOpen(true);
        }}
        totalPendingDebts={totalDeudasGeneral}
        totalPendingReceivables={totalCobrosGeneral}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* Navigation & Summary Cards */}
        <SummaryCards
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          records={records}
          peopleCount={existingPeople.length}
        />

        {/* VIEW NAVIGATION LOGIC */}
        {selectedPersonGroup ? (
          /* Independent Person Detail Page View */
          <PersonDetailView
            personGroup={selectedPersonGroup}
            onBack={() => setSelectedPersonName(null)}
            onOpenAbonoModal={(item) => {
              setAbonoTargetItem(item);
              setIsAbonoModalOpen(true);
            }}
            onOpenWhatsAppModal={(item) => {
              setWhatsAppTargetItem(item);
              setIsWhatsAppModalOpen(true);
            }}
            onOpenPdfModal={(item) => {
              setPdfTargetItem(item);
              setIsPdfModalOpen(true);
            }}
            onEdit={(item) => {
              setEditingItem(item);
              setIsRecordModalOpen(true);
            }}
            onDelete={handleOpenDeleteModal}
            onAddNewForPerson={(personName) => {
              setEditingItem(null);
              setModalDefaultType(activeTab === 'cobros' ? 'cobro' : 'deuda');
              setIsRecordModalOpen(true);
            }}
            onAddImages={handleAddImages}
          />
        ) : activeTab === 'resumen' ? (
          /* Balance General Detailed View */
          <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#EFE8DC] shadow-xs space-y-6">
            <h2 className="text-xl font-bold font-display text-[#2D2A26]">
              Resumen General de Cuentas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box Deudas */}
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#F3E2DB]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[#C24E31] text-base flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5" /> Deudas por Pagar
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#FDF0EC] text-[#C24E31] rounded-lg border border-[#F5C2B4]">
                    {formatCurrency(totalDeudasGeneral)}
                  </span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {records
                    .filter((r) => r.tipo === 'deuda' && r.estado === 'pendiente')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPersonName(item.persona)}
                        className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#EAE3D5] flex justify-between items-center text-xs cursor-pointer transition"
                      >
                        <div>
                          <span className="font-bold text-[#2D2A26] block">{item.persona}</span>
                          <span className="text-[#8C8479]">{item.concepto}</span>
                        </div>
                        <span className="font-bold text-[#C24E31]">
                          {formatCurrency(item.montoTotal - item.montoPagado)}
                        </span>
                      </div>
                    ))}
                  {records.filter((r) => r.tipo === 'deuda' && r.estado === 'pendiente').length === 0 && (
                    <p className="text-xs text-[#8C8479] text-center py-4">No hay deudas pendientes.</p>
                  )}
                </div>
              </div>

              {/* Box Cobros */}
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#DBE7DD]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[#3B6645] text-base flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5" /> Saldos por Cobrar
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#EAF2EB] text-[#3B6645] rounded-lg border border-[#C1DEC7]">
                    {formatCurrency(totalCobrosGeneral)}
                  </span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {records
                    .filter((r) => r.tipo === 'cobro' && r.estado === 'pendiente')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPersonName(item.persona)}
                        className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#EAE3D5] flex justify-between items-center text-xs cursor-pointer transition"
                      >
                        <div>
                          <span className="font-bold text-[#2D2A26] block">{item.persona}</span>
                          <span className="text-[#8C8479]">{item.concepto}</span>
                        </div>
                        <span className="font-bold text-[#3B6645]">
                          {formatCurrency(item.montoTotal - item.montoPagado)}
                        </span>
                      </div>
                    ))}
                  {records.filter((r) => r.tipo === 'cobro' && r.estado === 'pendiente').length === 0 && (
                    <p className="text-xs text-[#8C8479] text-center py-4">No hay cobros pendientes.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Views: Person Mini-Summary List */
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFDF9] p-3 rounded-2xl border border-[#EFE8DC]">
              
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8C8479]" />
                <input
                  type="text"
                  placeholder="Buscar persona o concepto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2DAD0] rounded-xl text-xs sm:text-sm text-[#2D2A26] placeholder-[#A39E93] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
                />
              </div>

              <div className="text-xs text-[#8C8479] font-medium">
                Haz clic en la tarjeta de una persona para ver sus cuentas y abonos
              </div>

            </div>

            {/* List Body: Clean Person Mini Summaries */}
            <div className="space-y-3">
              {personGroups.length > 0 ? (
                personGroups.map((group) => (
                  <PersonGroupCard
                    key={group.nombre}
                    personGroup={group}
                    onSelectPerson={(personName) => setSelectedPersonName(personName)}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-[#FFFDF9] rounded-2xl border border-[#EFE8DC] p-6 space-y-3">
                  <p className="text-sm font-semibold text-[#6E6A63]">No se encontraron registros para esta sección.</p>
                  <p className="text-xs text-[#8C8479]">
                    {searchQuery
                      ? 'No se encontraron resultados para el término ingresado.'
                      : 'Puedes crear un nuevo registro presionando el botón "Nuevo Registro".'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setModalDefaultType(activeTab === 'cobros' ? 'cobro' : 'deuda');
                      setIsRecordModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#5B8266] text-white text-xs font-bold rounded-xl hover:bg-[#476C53] transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Registro</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => {
          setEditingItem(null);
          setModalDefaultType(activeTab === 'cobros' ? 'cobro' : 'deuda');
          setIsRecordModalOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#5B8266] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#476C53] active:scale-95 transition-all z-40 sm:hidden"
        title="Nuevo registro"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveRecord}
        editingItem={editingItem}
        defaultType={modalDefaultType}
        existingPeople={existingPeople}
      />

      <AbonoModal
        isOpen={isAbonoModalOpen}
        onClose={() => {
          setIsAbonoModalOpen(false);
          setAbonoTargetItem(null);
        }}
        item={abonoTargetItem}
        onAddAbono={handleAddAbono}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setWhatsAppTargetItem(null);
        }}
        item={whatsAppTargetItem}
      />

      <PdfDetailModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setPdfTargetItem(null);
        }}
        item={pdfTargetItem}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetItem(null);
        }}
        item={deleteTargetItem}
        onConfirmDelete={handleConfirmDelete}
      />

    </div>
  );
}

export default App;
