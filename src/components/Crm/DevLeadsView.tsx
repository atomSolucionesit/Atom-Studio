'use client';

import React, { useState } from 'react';
import { CrmLead, CrmStatus, TeamMember } from '@/lib/types';
import { api } from '@/lib/api';
import {
  Code2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  Kanban,
  Plus,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowRight,
  Send,
  Edit2,
  Clock,
  User,
  Trash2,
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';

interface DevLeadsViewProps {
  leads: CrmLead[];
  onReload: () => void;
  onEditLead: (lead: CrmLead) => void;
  onOpenNewLeadModal: () => void;
  currentMember: TeamMember | null;
  team: TeamMember[];
}

export const DevLeadsView: React.FC<DevLeadsViewProps> = ({
  leads,
  onReload,
  onEditLead,
  onOpenNewLeadModal,
  currentMember,
  team,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<CrmLead | null>(null);
  const [isTrelloLoading, setIsTrelloLoading] = useState<string | null>(null);

  const PROJECT_LABELS: Record<string, { label: string; color: string }> = {
    CUSTOM_SOFTWARE: { label: 'Software a Medida', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    MOBILE_APP: { label: 'App Móvil (iOS/Android)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    WEB_APP: { label: 'Plataforma Web / SaaS', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    AI_AGENT: { label: 'Agente IA & Automatización', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    CLOUD_BACKEND: { label: 'Cloud, DevOps & APIs', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    ATOM_PRODUCT: { label: 'Producto Propio Atom', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    CORPORATE_CLIENT: { label: 'Cliente Corporativo', color: 'bg-teal-500/10 text-teal-300 border-teal-500/20' },
    INTEGRATION: { label: 'Integración API / ERP', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  };

  const STATUS_CONFIG: Record<CrmStatus, { label: string; bg: string; text: string }> = {
    NUEVO: { label: 'Nuevo Lead', bg: 'bg-slate-800', text: 'text-slate-300' },
    CONTACTADO: { label: 'Contactado', bg: 'bg-blue-900/40 border-blue-700/50', text: 'text-blue-300' },
    RESPONDIO: { label: 'Respondió', bg: 'bg-purple-900/40 border-purple-700/50', text: 'text-purple-300' },
    REUNION: { label: 'Reunión / Discovery', bg: 'bg-amber-900/40 border-amber-700/50', text: 'text-amber-300' },
    PROPUESTA: { label: 'Propuesta Enviada', bg: 'bg-pink-900/40 border-pink-700/50', text: 'text-pink-300' },
    CLIENTE: { label: 'Ganado / En Desarrollo', bg: 'bg-emerald-900/40 border-emerald-700/50', text: 'text-emerald-300' },
    DESCARTADO: { label: 'Descartado', bg: 'bg-rose-950/40 border-rose-800/50', text: 'text-rose-400' },
  };

  // Filtrado
  const filtered = leads.filter((lead) => {
    if (filterType !== 'ALL' && lead.projectType !== filterType) return false;
    if (filterStatus !== 'ALL' && lead.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = async (leadId: string, newStatus: CrmStatus) => {
    try {
      await api.updateCrmLeadStatus(
        leadId,
        { status: newStatus },
        currentMember?.name || 'Equipo Dev'
      );
      onReload();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  const handleCreateTrelloCard = async (lead: CrmLead) => {
    try {
      setIsTrelloLoading(lead.id);
      const res = await api.createCrmTrelloCard(
        lead.id,
        { customNotes: `Requerimientos técnicos: ${lead.techNotes || 'A relevar'}` },
        currentMember?.name || 'Equipo Dev'
      );
      alert(`¡Tarjeta creada en Trello con éxito!`);
      if (res.cardUrl) {
        window.open(res.cardUrl, '_blank');
      }
      onReload();
    } catch (err: any) {
      alert(err.message || 'Error al crear tarjeta en Trello');
    } finally {
      setIsTrelloLoading(null);
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
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Tipo de Proyecto:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({leads.length})
          </button>
          {Object.entries(PROJECT_LABELS).map(([key, item]) => {
            const count = leads.filter((l) => l.projectType === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
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
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Proyecto Dev
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <Code2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No hay prospectos de desarrollo con estos filtros</h4>
          <p className="text-xs text-slate-500 mt-1">Crea uno nuevo o ajusta los filtros de tipo de proyecto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((lead) => {
            const projectInfo = PROJECT_LABELS[lead.projectType || ''] || {
              label: 'Desarrollo General',
              color: 'bg-slate-800 text-slate-300 border-slate-700',
            };
            const statusInfo = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NUEVO;

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-4"
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${projectInfo.color}`}
                        >
                          {projectInfo.label}
                        </span>
                        {lead.budgetRange && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            {lead.budgetRange}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        {lead.companyName}
                      </h4>
                      {lead.contactName && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {lead.contactName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
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
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                    {lead.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {lead.city}, {lead.province || ''}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        {lead.email}
                      </span>
                    )}
                  </div>

                  {/* Tech Notes Box */}
                  {lead.techNotes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-mono">
                      <span className="text-emerald-400 font-bold block mb-0.5 font-sans">
                        🛠️ Requerimientos Técnicos:
                      </span>
                      {lead.techNotes}
                    </div>
                  )}

                  {/* General Notes */}
                  {lead.notes && (
                    <p className="text-xs text-slate-400 italic mt-2.5 border-l-2 border-indigo-500/50 pl-2.5">
                      "{lead.notes}"
                    </p>
                  )}
                </div>

                {/* Status Selector & Quick Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Estado:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as CrmStatus)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                        <option key={k} value={k} className="bg-slate-900 text-white">
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Trello Card Button */}
                    {lead.trelloCardUrl ? (
                      <a
                        href={lead.trelloCardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-800/40 text-xs font-medium flex items-center gap-1 hover:bg-blue-900/40 transition-colors"
                      >
                        <Kanban className="w-3.5 h-3.5" />
                        Ver Trello
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCreateTrelloCard(lead)}
                        disabled={isTrelloLoading === lead.id}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-blue-600/30 text-xs font-medium flex items-center gap-1 border border-slate-700 transition-colors"
                        title="Crear tarjeta de estimación técnica en Trello"
                      >
                        <Kanban className="w-3.5 h-3.5 text-blue-400" />
                        {isTrelloLoading === lead.id ? 'Creando...' : 'Estimar en Trello'}
                      </button>
                    )}

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => setSelectedLeadForWhatsApp(lead)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp Dev
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Modal with Dev Templates */}
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
