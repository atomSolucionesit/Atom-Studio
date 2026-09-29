'use client';

import React, { useState } from 'react';
import { CrmLead, CrmStatus, TeamMember } from '@/lib/types';
import { api } from '@/lib/api';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Filter,
  CheckCircle,
  Tag,
  Edit2,
  Calendar,
  Sparkles,
  Search,
  Trash2,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';

interface MarketingLeadsViewProps {
  leads: CrmLead[];
  onReload: () => void;
  onEditLead: (lead: CrmLead) => void;
  onOpenNewLeadModal: () => void;
  currentMember: TeamMember | null;
  team: TeamMember[];
}

export const MarketingLeadsView: React.FC<MarketingLeadsViewProps> = ({
  leads,
  onReload,
  onEditLead,
  onOpenNewLeadModal,
  currentMember,
  team,
}) => {
  const [filterRubro, setFilterRubro] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<CrmLead | null>(null);

  const RUBRO_CONFIG: Record<string, { label: string; icon: string }> = {
    RETAIL: { label: 'Comercio / Tienda', icon: '🛍️' },
    GASTRONOMY: { label: 'Gastronomía / Bar / Café', icon: '☕' },
    WHOLESALE: { label: 'Distribuidora / Mayorista', icon: '📦' },
    SERVICES: { label: 'Servicios', icon: '💼' },
    INDUSTRIAL: { label: 'Ferretería / Industrial', icon: '🔧' },
  };

  const STATUS_CONFIG: Record<CrmStatus, { label: string; color: string; bg: string }> = {
    NUEVO: { label: 'Sin contactar', color: 'text-slate-400', bg: 'bg-slate-800' },
    CONTACTADO: { label: 'Contactado', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700/40' },
    RESPONDIO: { label: 'Respondió', color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700/40' },
    REUNION: { label: 'Demo Agendada', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700/40' },
    PROPUESTA: { label: 'Propuesta / Prueba', color: 'text-pink-400', bg: 'bg-pink-900/30 border-pink-700/40' },
    CLIENTE: { label: 'Cliente Activo', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-700/40' },
    DESCARTADO: { label: 'No interesa', color: 'text-rose-400', bg: 'bg-rose-950/30 border-rose-800/40' },
  };

  const filtered = leads.filter((lead) => {
    if (filterRubro !== 'ALL' && lead.businessType !== filterRubro) return false;
    if (filterStatus !== 'ALL' && lead.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = async (leadId: string, newStatus: CrmStatus) => {
    try {
      await api.updateCrmLeadStatus(
        leadId,
        { status: newStatus },
        currentMember?.name || 'Equipo Comercial'
      );
      onReload();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  const handleDeleteLead = async (lead: CrmLead) => {
    if (!confirm(`¿Estás seguro de eliminar el prospecto "${lead.companyName}"?\nEsta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await api.deleteCrmLead(lead.id);
      onReload();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar prospecto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Subheader & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            Rubro Comercial:
          </span>
          <button
            onClick={() => setFilterRubro('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterRubro === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({leads.length})
          </button>
          {Object.entries(RUBRO_CONFIG).map(([key, item]) => {
            const count = leads.filter((l) => l.businessType === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterRubro(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterRubro === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {item.icon} {item.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Todos los Estados</option>
            {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
              <option key={k} value={k}>
                {cfg.label}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewLeadModal}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Comercio Nexus
          </button>
        </div>
      </div>

      {/* Cards List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Store className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No hay comercios para Nexus con estos filtros</h4>
          <p className="text-xs text-slate-500 mt-1">Podés crear uno nuevo o importar desde la hoja Leads_Nexus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => {
            const rubro = RUBRO_CONFIG[lead.businessType || 'RETAIL'] || { label: 'Comercio', icon: '🏪' };
            const statusInfo = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NUEVO;

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {rubro.icon} {rubro.label}
                        </span>
                        {lead.priceList && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                            {lead.priceList}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white leading-snug">
                        {lead.companyName}
                      </h4>
                      {lead.contactName && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {lead.contactName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditLead(lead)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Editar datos"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Eliminar prospecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Location & Contact */}
                  <div className="space-y-1 text-xs text-slate-400 mt-2.5">
                    {lead.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lead.city}{lead.province ? `, ${lead.province}` : ''}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-slate-300 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <p className="text-xs text-slate-400 italic mt-2.5 border-l-2 border-indigo-500/50 pl-2 line-clamp-2">
                      "{lead.notes}"
                    </p>
                  )}
                </div>

                {/* Status & WhatsApp action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as CrmStatus)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-xl border focus:outline-none ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                      <option key={k} value={k} className="bg-slate-900 text-white">
                        {cfg.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setSelectedLeadForWhatsApp(lead)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Demo 15m
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Modal with Nexus Templates */}
      {selectedLeadForWhatsApp && (
        <WhatsAppModal
          lead={selectedLeadForWhatsApp}
          isOpen={Boolean(selectedLeadForWhatsApp)}
          onClose={() => setSelectedLeadForWhatsApp(null)}
          onMessageSent={() => {
            handleStatusChange(selectedLeadForWhatsApp.id, 'CONTACTADO');
          }}
        />
      )}
    </div>
  );
};
