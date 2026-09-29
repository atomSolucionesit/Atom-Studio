'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NexusLead, NexusSyncResponse, TeamMember } from '@/lib/types';
import { api } from '@/lib/api';
import {
  Store,
  Search,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Building2,
  FileText,
  User,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface NexusSyncViewProps {
  currentMember: TeamMember | null;
}

const NEXUS_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  nuevo: {
    label: 'Nuevo Prospecto',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  contactado: {
    label: 'Contactado',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
  demo: {
    label: 'Demo 15m Agendada',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  negociacion: {
    label: 'En Negociación',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  cliente: {
    label: 'Cliente Cerrado',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  descartado: {
    label: 'Descartado',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
};

export const NexusSyncView: React.FC<NexusSyncViewProps> = ({ currentMember }) => {
  const [data, setData] = useState<NexusSyncResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeNotesLead, setActiveNotesLead] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadNexusData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getNexusLeads({
        search: searchQuery,
        status: statusFilter,
      });
      setData(res);
    } catch (err: any) {
      console.error('Error cargando datos sincronizados de Nexus:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadNexusData();
  }, [loadNexusData]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadNexusData();
    setIsSyncing(false);
    showToast('Datos de Nexus sincronizados con éxito.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStatusChange = async (lead: NexusLead, newStatus: string) => {
    try {
      await api.updateNexusLeadState(
        {
          id: lead.id,
          estado: newStatus,
          notas: lead.notes,
        },
        currentMember?.name || 'Equipo Comercial'
      );

      // Actualizar localmente de inmediato
      if (data) {
        setData({
          ...data,
          leads: data.leads.map((l) =>
            l.id === lead.id
              ? {
                  ...l,
                  status: newStatus as any,
                  updatedBy: currentMember?.name || 'Equipo Comercial',
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        });
      }
      showToast(`Estado de ${lead.companyName} actualizado a ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado en Nexus');
    }
  };

  const handleSaveNotes = async (lead: NexusLead) => {
    try {
      await api.updateNexusLeadState(
        {
          id: lead.id,
          estado: lead.status,
          notas: notesDraft,
        },
        currentMember?.name || 'Equipo Comercial'
      );

      if (data) {
        setData({
          ...data,
          leads: data.leads.map((l) =>
            l.id === lead.id
              ? {
                  ...l,
                  notes: notesDraft,
                  updatedBy: currentMember?.name || 'Equipo Comercial',
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        });
      }
      setActiveNotesLead(null);
      showToast(`Notas guardadas en Gestión de Google Sheets para ${lead.companyName}`);
    } catch (err: any) {
      alert(err.message || 'Error al guardar notas');
    }
  };

  const handleOpenWhatsApp = (lead: NexusLead, phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const pitch = encodeURIComponent(
      `¡Hola ${lead.contactName || lead.companyName}! Te escribo del equipo de Nexus Software. ` +
        `Estuvimos viendo su comercio ${lead.companyName} y queríamos consultarles cómo manejan actualmente sus ventas y control de stock. ` +
        `¿Tendrían 15 minutos esta semana para una demo rápida sin compromiso y mostrarles cómo automatizarlo?`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${pitch}`, '_blank');

    // Si estaba nuevo, sugerir pasar a contactado
    if (lead.status === 'nuevo') {
      handleStatusChange(lead, 'contactado');
    }
  };

  const leads = data?.leads || [];
  const statusCounts = data?.statusCounts || {
    nuevo: 0,
    contactado: 0,
    demo: 0,
    negociacion: 0,
    cliente: 0,
    descartado: 0,
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Synchronized Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              CRM Nexus (Software de Comercio & POS)
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sincronizado ({data?.source || 'crm-nexus'})
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Base Comercial & Gestión de Demos de Nexus
          </h2>
          <p className="text-xs text-slate-400">
            Comercios, minimarkets y retail sincronizados con la pestaña{' '}
            <code className="text-indigo-300 font-mono">Gestion</code> y{' '}
            <code className="text-indigo-300 font-mono">Hoja 1</code> de CRM Nexus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Sincronizar ahora con Google Sheets / crm-nexus"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Refrescar Nexus'}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({data?.totalCount || 0})
          </button>
          {Object.entries(NEXUS_STATUS_CONFIG).map(([key, cfg]) => {
            const count = statusCounts[key as keyof typeof statusCounts] || 0;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar comercio, contacto, CUIT..."
            className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-60"
          />
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Cargando prospectos sincronizados de Nexus...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">No se encontraron comercios de Nexus</h4>
          <p className="text-xs text-slate-500 mt-1">Ajusta los filtros de búsqueda o estado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => {
            const statusInfo = NEXUS_STATUS_CONFIG[lead.status] || NEXUS_STATUS_CONFIG.nuevo;
            const primaryPhone = lead.phones[0];

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {lead.id}
                        </span>
                        {lead.priceList && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                            {lead.priceList}
                          </span>
                        )}
                        {lead.group && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-800/30">
                            {lead.group}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white leading-snug">
                        {lead.companyName}
                      </h4>
                      {lead.contactName && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {lead.contactName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location & Tax Info */}
                  <div className="space-y-1 text-xs text-slate-400 mt-2">
                    {lead.taxId && (
                      <div className="text-[11px] font-mono text-slate-500">
                        CUIT: {lead.taxId}
                      </div>
                    )}
                    {lead.city && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>
                          {lead.city}
                          {lead.province ? `, ${lead.province}` : ''}
                        </span>
                      </div>
                    )}
                    {lead.address && (
                      <p className="text-[11px] text-slate-500 truncate" title={lead.address}>
                        {lead.address}
                      </p>
                    )}
                    {lead.emails && lead.emails.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{lead.emails.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Phones List with verification badges */}
                  {lead.phones && lead.phones.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                      {lead.phones.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-300"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{p.formatted}</span>
                          {p.verified ? (
                            <span title="Teléfono verificado">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            </span>
                          ) : (
                            <span title="Número a verificar (?)">
                              <HelpCircle className="w-3 h-3 text-amber-400" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes / Sheet Gestion Box */}
                  <div className="mt-3">
                    {activeNotesLead === lead.id ? (
                      <div className="space-y-2 p-2.5 rounded-xl bg-slate-950 border border-indigo-500/40">
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Escribe notas de la llamada o demo..."
                          rows={2}
                          className="w-full bg-transparent text-xs text-slate-200 focus:outline-none resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveNotesLead(null)}
                            className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveNotes(lead)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold"
                          >
                            Guardar en Sheets
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setActiveNotesLead(lead.id);
                          setNotesDraft(lead.notes || '');
                        }}
                        className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-800/60 hover:border-slate-700 cursor-pointer text-xs text-slate-400 transition-colors"
                        title="Clic para editar notas de gestión"
                      >
                        {lead.notes ? (
                          <p className="italic line-clamp-2">"{lead.notes}"</p>
                        ) : (
                          <span className="text-slate-600 flex items-center gap-1 text-[11px]">
                            <FileText className="w-3 h-3" /> + Agregar nota de gestión
                          </span>
                        )}
                        {lead.updatedBy && (
                          <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{lead.updatedBy}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Selector & WhatsApp Demo Button */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                  >
                    {Object.entries(NEXUS_STATUS_CONFIG).map(([k, cfg]) => (
                      <option key={k} value={k} className="bg-slate-900 text-white">
                        {cfg.label}
                      </option>
                    ))}
                  </select>

                  {primaryPhone && (
                    <button
                      onClick={() => handleOpenWhatsApp(lead, primaryPhone.raw || primaryPhone.formatted)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                      title="Abrir WhatsApp con el pitch de 15 minutos de Nexus"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Demo 15'
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
