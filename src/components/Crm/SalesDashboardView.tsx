'use client';

import React from 'react';
import { CrmDashboardStats, CrmLead } from '@/lib/types';
import {
  TrendingUp,
  Users,
  Target,
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Store,
  Code2,
  CheckCircle2,
  PhoneCall,
  Flame,
} from 'lucide-react';

interface SalesDashboardViewProps {
  stats: CrmDashboardStats | null;
  isLoading: boolean;
  onOpenLead: (lead: CrmLead) => void;
}

export const SalesDashboardView: React.FC<SalesDashboardViewProps> = ({
  stats,
  isLoading,
  onOpenLead,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Calculando métricas comerciales del equipo...</p>
      </div>
    );
  }

  const { totals, statusCounts, advisorRanking, staleLeads, recentHistory } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Prospectos</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totals.totalLeads}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1 text-indigo-300">
              <Store className="w-3 h-3" /> {totals.nexusCount} Nexus
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Code2 className="w-3 h-3" /> {totals.devCount} Devs
            </span>
          </div>
        </div>

        {/* In Negotiation / Demos */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>En Conversación / Demos</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{totals.inNegotiation}</div>
          <p className="text-xs text-slate-400 mt-2">
            {statusCounts.REUNION} reuniones/demos + {statusCounts.PROPUESTA} propuestas activas
          </p>
        </div>

        {/* Clients Won */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Clientes Cerrados</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{totals.clientsWon}</div>
          <p className="text-xs text-slate-400 mt-2">
            Tasa de conversión global: <b className="text-emerald-300">{totals.globalConversionRate}</b>
          </p>
        </div>

        {/* Channel Comparison */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Efectividad por Canal</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1.5 mt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300 flex items-center gap-1 font-medium">
                <Store className="w-3 h-3" /> Nexus:
              </span>
              <span className="font-bold text-white">{totals.nexusConversionRate} conv.</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 flex items-center gap-1 font-medium">
                <Code2 className="w-3 h-3" /> Software Dev:
              </span>
              <span className="font-bold text-white">{totals.devConversionRate} conv.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Funnel of the Entire Commercial Team */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Embudo Comercial Consolidado
            </h3>
            <p className="text-xs text-slate-400">
              Distribución de todos los prospectos a lo largo del proceso de venta
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {totals.totalLeads} prospectos registrados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {[
            { key: 'NUEVO', label: 'Sin Contactar', count: statusCounts.NUEVO, color: 'bg-slate-700', text: 'text-slate-300' },
            { key: 'CONTACTADO', label: 'Contactados', count: statusCounts.CONTACTADO, color: 'bg-blue-600', text: 'text-blue-300' },
            { key: 'RESPONDIO', label: 'Respondieron', count: statusCounts.RESPONDIO, color: 'bg-purple-600', text: 'text-purple-300' },
            { key: 'REUNION', label: 'Demos / Calls', count: statusCounts.REUNION, color: 'bg-amber-600', text: 'text-amber-300' },
            { key: 'PROPUESTA', label: 'Propuestas', count: statusCounts.PROPUESTA, color: 'bg-pink-600', text: 'text-pink-300' },
            { key: 'CLIENTE', label: 'Clientes Cerrados', count: statusCounts.CLIENTE, color: 'bg-emerald-600', text: 'text-emerald-300' },
          ].map((step, idx) => {
            const percent = totals.totalLeads > 0 ? ((step.count / totals.totalLeads) * 100).toFixed(0) : '0';
            return (
              <div
                key={step.key}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="text-[11px] font-semibold text-slate-400 mb-2 truncate">
                  {idx + 1}. {step.label}
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-2xl font-black ${step.text}`}>{step.count}</span>
                  <span className="text-[10px] text-slate-500">{percent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${step.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(Number(percent), 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Ranking & Urgency Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advisor Performance Ranking */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Desempeño por Asesor Comercial
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cuentas asignadas, reuniones coordinadas y cierres logrados
            </p>

            <div className="mt-4 space-y-3">
              {advisorRanking.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No hay datos de asignación aún.</p>
              ) : (
                advisorRanking.map((adv, idx) => (
                  <div
                    key={adv.name}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/80 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-800/40">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{adv.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {adv.totalAssigned} prospectos a cargo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right text-xs">
                      <div>
                        <div className="font-bold text-amber-400">{adv.meetings}</div>
                        <div className="text-[10px] text-slate-500">Demos</div>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-400">{adv.won}</div>
                        <div className="text-[10px] text-slate-500">Cierres</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Stale Leads (Urgent Follow-up) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Seguimiento Comercial Urgente
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/40">
                {staleLeads.length} desatendidos (&gt;5 días)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prospectos sin contacto reciente que requieren retomar la conversación
            </p>

            <div className="mt-4 space-y-2.5">
              {staleLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>¡Excelente! Todos los prospectos tienen seguimiento al día.</span>
                </div>
              ) : (
                staleLeads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onOpenLead(lead)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                        {lead.companyName}
                        <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {lead.category === 'PRODUCT_NEXUS' ? 'Nexus' : 'Dev'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Estado: {lead.status}</span>
                        {lead.phone && <span>· {lead.phone}</span>}
                      </div>
                    </div>

                    <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Bitácora de Actividad Reciente del Equipo
        </h3>
        <p className="text-xs text-slate-400">
          Últimas gestiones, llamados y avances registrados en el sistema
        </p>

        <div className="divide-y divide-slate-800/60 mt-3">
          {recentHistory.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">Sin actividad registrada aún.</p>
          ) : (
            recentHistory.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs text-white">
                    <b className="text-indigo-300">{item.authorName || 'Usuario'}</b>:{' '}
                    <span>{item.details || item.action}</span>
                  </div>
                  {item.lead && (
                    <div className="text-[11px] text-slate-400">
                      Empresa: <b>{item.lead.companyName}</b> · Línea:{' '}
                      {item.lead.category === 'PRODUCT_NEXUS' ? 'Nexus' : 'Nuevos Desarrollos'}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
