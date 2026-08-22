import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { RecordCard } from './components/RecordCard';
import { PersonGroupCard } from './components/PersonGroupCard';
import { PersonDetailView } from './components/PersonDetailView';
import { RecordModal } from './components/RecordModal';
import { AbonoModal } from './components/AbonoModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { formatCurrency } from './utils/formatters';
import { AuthScreen, clearSession, getStoredUser } from './components/AuthScreen';
import api from './services/api';
import { downloadRecordPdf } from './utils/printHelper';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

const STORAGE_KEY = 'control_cuentas_records_v3';
const LEGACY_DEMO_RECORD_IDS = new Set(['rec-1', 'rec-2', 'rec-3', 'rec-4']);

function AuthenticatedApp({ user, onLogout }) {
  const [records, setRecords] = useState([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.get('/api/records')
      .then(({ data }) => {
        if (isMounted) setRecords(Array.isArray(data) ? data.filter((record) => !LEGACY_DEMO_RECORD_IDS.has(record.id)) : []);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error.response?.status === 401) onLogout();
        else setRecordsError(error.message || 'No se pudieron cargar tus registros.');
      })
      .finally(() => { if (isMounted) setIsLoadingRecords(false); });
    return () => { isMounted = false; };
  }, []);

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);

  const existingPeople = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.persona) set.add(r.persona);
    });
    return Array.from(set).sort();
  }, [records]);

  const handleSaveRecord = async (data) => {
    try {
      const response = data.id
        ? await api.put(`/api/records/${data.id}`, data)
        : await api.post('/api/records', data);
      setRecords((prev) => data.id ? prev.map((record) => record.id === data.id ? response.data : record) : [response.data, ...prev]);
    } catch (error) {
      setRecordsError(error.message || 'No se pudo guardar el registro.');
    }
  };

  // Add Partial Payment (Abono)
  const handleAddAbono = async (itemId, monto, nota) => {
    try {
      const { data } = await api.post(`/api/records/${itemId}/abonos`, { monto, nota });
      setRecords((prev) => prev.map((record) => record.id === itemId ? data : record));
    } catch (error) {
      setRecordsError(error.message || 'No se pudo registrar el abono.');
    }
  };

  // Add images (from camera or file upload) to a record
  const handleAddImages = async (itemId, dataUrls) => {
    if (!Array.isArray(dataUrls) || dataUrls.length === 0) return;
    const item = records.find((record) => record.id === itemId);
    if (!item) return;
    try {
      const { data } = await api.put(`/api/records/${itemId}`, { imagenes: [...(item.imagenes || []), ...dataUrls] });
      setRecords((prev) => prev.map((record) => record.id === itemId ? data : record));
    } catch (error) {
      setRecordsError(error.message || 'No se pudieron guardar las imágenes.');
    }
  };

  // Delete Record
  const handleOpenDeleteModal = (id) => {
    const item = records.find((r) => r.id === id);
    if (item) {
      setDeleteTargetItem(item);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await api.delete(`/api/records/${id}`);
      setRecords((prev) => prev.filter((record) => record.id !== id));
      setSelectedPersonName(null);
    } catch (error) {
      setRecordsError(error.message || 'No se pudo eliminar el registro.');
    }
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
        user={user}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {recordsError && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-[#F5C2B4] bg-[#FDF0EC] px-4 py-3 text-xs font-semibold text-[#A63F29]">
            <span>{recordsError}</span>
            <button type="button" onClick={() => setRecordsError('')} className="underline">Cerrar</button>
          </div>
        )}

        {isLoadingRecords && (
          <div className="rounded-2xl border border-[#EFE8DC] bg-[#FFFDF9] px-6 py-10 text-center text-sm text-[#8C8479]">
            Cargando tus registros...
          </div>
        )}
        
        {/* Navigation & Summary Cards */}
        {!isLoadingRecords && <SummaryCards
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          records={records}
          peopleCount={existingPeople.length}
        />}

        {/* VIEW NAVIGATION LOGIC */}
        {!isLoadingRecords && selectedPersonGroup ? (
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
              downloadRecordPdf(item);
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
        ) : !isLoadingRecords && activeTab === 'resumen' ? (
          /* Balance General Detailed View */
          <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#EFE8DC] shadow-xs space-y-6">
            <h2 className="text-xl font-bold font-display text-[#2D2A26]">
              Resumen General de Cuentas
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Box Deudas */}
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#F3E2DB]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[#C24E31] text-base flex items-center gap-4">
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
                  <h3 className="font-bold text-[#3B6645] text-base flex items-center gap-4">
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
        ) : !isLoadingRecords ? (
          /* Main Views: Person Mini-Summary List */
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-row flex-wrap items-center justify-between gap-4 bg-[#FFFDF9] p-4 rounded-2xl border border-[#EFE8DC]">
              
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
        ) : null}

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

export function App() {
  const [user, setUser] = useState(getStoredUser);

  if (!user) return <AuthScreen onAuthenticated={setUser} />;
  return <AuthenticatedApp user={user} onLogout={() => { clearSession(); setUser(null); }} />;
}

export default App;
