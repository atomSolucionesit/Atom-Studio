'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CrmLead, CrmDashboardStats, TeamMember } from '@/lib/types';
import { api } from '@/lib/api';
import { DevLeadsView } from './DevLeadsView';
import { NexusSyncView } from './NexusSyncView';
import { SalesDashboardView } from './SalesDashboardView';
import { LeadModal } from './LeadModal';
import {
  Code2,
  Store,
  TrendingUp,
  Search,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CrmHubViewProps {
  currentMember: TeamMember | null;
  team: TeamMember[];
}

export const CrmHubView: React.FC<CrmHubViewProps> = ({ currentMember, team }) => {
  const getInitialTab = (): 'dev' | 'nexus' | 'dashboard' => {
    if (currentMember?.role === 'DEVELOPER') return 'dev';
    if (currentMember?.role === 'MARKETING') return 'nexus';
    return 'dashboard';
  };

  const [activeSubTab, setActiveSubTab] = useState<'dev' | 'nexus' | 'dashboard'>(getInitialTab());
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [stats, setStats] = useState<CrmDashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modales
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [devData, statsData] = await Promise.all([
        api.getDevelopments({ search: searchQuery }),
        api.getCrmDashboardStats().catch(() => null),
      ]);
      setLeads(devData);
      setStats(statsData);
    } catch (err) {
      console.error('Error cargando prospectos de desarrollo:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sincronización multi-hoja con Google Sheets
  const handleSyncSheets = async () => {
    try {
      setIsSyncingSheets(true);
      setSyncFeedback(null);
      const res = await api.syncCrmWithSheets();
      if (res.error) {
        setSyncFeedback({ message: res.message, type: 'error' });
      } else {
        setSyncFeedback({
          message: res.message || 'Sincronización multi-hoja con Google Sheets completada.',
          type: 'success',
        });
      }
      await loadData();
    } catch (err: any) {
      setSyncFeedback({ message: err.message || 'Error al conectar con Sheets', type: 'error' });
    } finally {
      setIsSyncingSheets(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  const handleSaveLead = async (payload: any) => {
    if (editingLead) {
      await api.updateDevelopment(
        editingLead.id,
        payload,
        currentMember?.name || 'Usuario Atom'
      );
    } else {
      await api.createDevelopment(payload, currentMember?.name || 'Usuario Atom');
    }
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              ATOM Soluciones IT
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Sincronizado con CRM Nexus & Google Sheets
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Gestión Comercial, Desarrollos & CRM Nexus
          </h1>
          <p className="text-sm text-slate-400">
            Pipeline integral para Desarrollos a medida, productos propios de Atom y sincronización en vivo con CRM Nexus
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por empresa, ciudad..."
              className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-52 md:w-60"
            />
          </div>

          <button
            onClick={handleSyncSheets}
            disabled={isSyncingSheets}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Sincronizar con hojas de cálculo de Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            {isSyncingSheets ? 'Sincronizando...' : 'Sync Sheets'}
          </button>

          <button
            onClick={() => {
              setEditingLead(null);
              setIsLeadModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto / Cliente
          </button>
        </div>
      </div>

      {/* Sync Toast Feedback */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs animate-in fade-in duration-150 ${
            syncFeedback.type === 'error'
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          }`}
        >
          {syncFeedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{syncFeedback.message}</span>
        </div>
      )}

      {/* 3 Main Role-Oriented Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('dev')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'dev'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Desarrollos & Productos Atom</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 font-extrabold">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('nexus')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'nexus'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>CRM Nexus (Sincronizado)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En Vivo
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeSubTab === 'dashboard'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Pipeline & Rendimiento Global</span>
        </button>
      </div>

      {/* Tab Content */}
      {isLoading && activeSubTab !== 'nexus' ? (
        <div className="p-16 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Cargando datos comerciales...</p>
        </div>
      ) : (
        <>
          {activeSubTab === 'dev' && (
            <DevLeadsView
              leads={leads}
              onReload={loadData}
              onEditLead={(lead) => {
                setEditingLead(lead);
                setIsLeadModalOpen(true);
              }}
              onOpenNewLeadModal={() => {
                setEditingLead(null);
                setIsLeadModalOpen(true);
              }}
              currentMember={currentMember}
              team={team}
            />
          )}

          {activeSubTab === 'nexus' && (
            <NexusSyncView currentMember={currentMember} />
          )}

          {activeSubTab === 'dashboard' && (
            <SalesDashboardView
              stats={stats}
              isLoading={isLoading}
              onOpenLead={(lead) => {
                setEditingLead(lead);
                setIsLeadModalOpen(true);
              }}
            />
          )}
        </>
      )}

      {/* Lead Create / Edit Modal */}
      {isLeadModalOpen && (
        <LeadModal
          isOpen={isLeadModalOpen}
          onClose={() => {
            setIsLeadModalOpen(false);
            setEditingLead(null);
          }}
          onSave={handleSaveLead}
          initialCategory="CUSTOM_DEV"
          initialLead={editingLead}
          team={team}
        />
      )}
    </div>
  );
};
