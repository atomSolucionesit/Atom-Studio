'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { TeamPerformanceSummary, DeveloperWeeklyStats } from '@/lib/types';
import {
  TrendingUp,
  TrendingDown,
  GitCommit,
  Award,
  Users,
  ExternalLink,
  RefreshCw,
  Search,
  Code2,
  Calendar,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  GitFork,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';

export const DeveloperPerformanceView: React.FC = () => {
  const [data, setData] = useState<TeamPerformanceSummary | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'thisWeek' | 'total'>('thisWeek');

  const loadData = useCallback(async (isManual = false, branchOverride?: string) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setIsLoading(true);

      const branch = branchOverride !== undefined ? branchOverride : selectedBranch;
      const performance = await api.getDeveloperPerformance(branch);
      setData(performance);
    } catch (err) {
      console.error('Error cargando rendimiento de desarrolladores:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-zinc-400">
          Analizando commits y calculando métricas de rendimiento del equipo...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800">
        <p className="text-zinc-400 text-sm">
          No se pudieron cargar las métricas de rendimiento. Verifica la conexión con GitHub.
        </p>
        <button
          onClick={() => loadData(true)}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Filtrar y ordenar desarrolladores
  const filteredDevelopers = (data.developers || [])
    .filter((dev) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        dev.name.toLowerCase().includes(q) ||
        (dev.login && dev.login.toLowerCase().includes(q)) ||
        dev.repos.some((r) => r.repo.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'thisWeek') {
        return b.thisWeekCommits - a.thisWeekCommits || b.totalCommits - a.totalCommits;
      }
      return b.totalCommits - a.totalCommits;
    });

  // Cronología invertida para gráficos (del más antiguo al más reciente: Hace 3 sem -> Esta semana)
  const chronologicalTrend = [...(data.weeklyTeamTrend || [])].reverse();
  const maxWeeklyCount = Math.max(...chronologicalTrend.map((w) => w.count), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera Principal */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-zinc-100">
                Rendimiento & Avance Dev Semanal
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                atomSolucionesit
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Velocidad de entrega, evolución de commits semana a semana y desglose de aportes en repositorios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar Métricas'}
          </button>
        </div>
      </div>

      {/* Filtro por Rama: main vs testing vs dev vs todas */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-400 mr-1">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rama a evaluar:</span>
          </div>

          <button
            onClick={() => {
              setSelectedBranch('ALL');
              loadData(true, 'ALL');
            }}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              selectedBranch === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            Todas las ramas
          </button>

          <button
            onClick={() => {
              setSelectedBranch('main');
              loadData(true, 'main');
            }}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              selectedBranch === 'main'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedBranch === 'main' ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>main (Producción)</span>
          </button>

          <button
            onClick={() => {
              setSelectedBranch('testing');
              loadData(true, 'testing');
            }}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              selectedBranch === 'testing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedBranch === 'testing' ? 'bg-amber-300 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>testing (Pruebas / QA)</span>
          </button>

          <button
            onClick={() => {
              setSelectedBranch('dev');
              loadData(true, 'dev');
            }}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              selectedBranch === 'dev'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            dev
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
          <span>Métricas calculadas sobre:</span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-950 font-mono text-[11px] font-bold text-indigo-300 border border-zinc-800">
            {selectedBranch === 'ALL' ? 'Todas las ramas' : `Rama ${selectedBranch}`}
          </span>
        </div>
      </div>

      {/* KPI Cards Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Commits Esta Semana */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Commits Esta Semana</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <GitCommit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-zinc-100">
              {data.totalCommitsThisWeek}
            </span>
            {data.teamVelocityTrend !== null && (
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  data.teamVelocityTrend > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : data.teamVelocityTrend < 0
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {data.teamVelocityTrend > 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : data.teamVelocityTrend < 0 ? (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <Minus className="w-3 h-3 mr-0.5" />
                )}
                {data.teamVelocityTrend > 0 ? `+${data.teamVelocityTrend}%` : `${data.teamVelocityTrend}%`}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            vs {data.totalCommitsLastWeek} commits en la semana anterior
          </p>
        </div>

        {/* KPI 2: Desarrolladores Activos */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Desarrolladores Activos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-100">
              {data.activeDevelopersCount}
            </span>
            <span className="text-xs text-zinc-500 font-medium">miembros activos</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {data.totalCommitsPeriod} commits en las últimas 4 semanas
          </p>
        </div>

        {/* KPI 3: Top Contributor Semanal */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Top Contributor Semana</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          {data.topContributor ? (
            <div className="mt-2.5 flex items-center gap-3">
              {data.topContributor.avatar_url ? (
                <img
                  src={data.topContributor.avatar_url}
                  alt={data.topContributor.name}
                  className="w-9 h-9 rounded-xl border border-amber-500/30 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {data.topContributor.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-100 truncate">
                  {data.topContributor.name}
                </p>
                <p className="text-[11px] text-amber-400 font-semibold">
                  {data.topContributor.commitsThisWeek} commits esta semana
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 mt-3">Sin actividad registrada esta semana</p>
          )}
        </div>

        {/* KPI 4: Desglose Feat vs Fix */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Distribución de Trabajo</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-zinc-200">{data.typeDistribution.feat}</span>
              <span className="text-[10px] text-zinc-500">Feats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="font-bold text-zinc-200">{data.typeDistribution.fix}</span>
              <span className="text-[10px] text-zinc-500">Fixes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="font-bold text-zinc-200">
                {data.typeDistribution.refactor + data.typeDistribution.devops}
              </span>
              <span className="text-[10px] text-zinc-500">Refact</span>
            </div>
          </div>

          {/* Barra de proporción visual */}
          <div className="mt-3 w-full h-2 rounded-full bg-zinc-800 flex overflow-hidden">
            <div
              style={{
                width: `${(data.typeDistribution.feat / (data.totalCommitsPeriod || 1)) * 100}%`,
              }}
              className="bg-emerald-500"
              title={`Features: ${data.typeDistribution.feat}`}
            />
            <div
              style={{
                width: `${(data.typeDistribution.fix / (data.totalCommitsPeriod || 1)) * 100}%`,
              }}
              className="bg-rose-500"
              title={`Fixes: ${data.typeDistribution.fix}`}
            />
            <div
              style={{
                width: `${(data.typeDistribution.refactor / (data.totalCommitsPeriod || 1)) * 100}%`,
              }}
              className="bg-amber-500"
              title={`Refactor: ${data.typeDistribution.refactor}`}
            />
            <div
              style={{
                width: `${(data.typeDistribution.other / (data.totalCommitsPeriod || 1)) * 100}%`,
              }}
              className="bg-zinc-600"
              title={`Otros: ${data.typeDistribution.other}`}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Evolución Semanal del Equipo */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Evolución de Commits por Semana (Equipo Completo)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparativa de volumen de entrega durante los últimos 28 días (4 semanas).
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-xl self-start sm:self-auto border border-zinc-700/60">
            Total período: <strong className="text-indigo-400">{data.totalCommitsPeriod}</strong> commits
          </span>
        </div>

        {/* Barras de semanas cronológicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {chronologicalTrend.map((bucket, idx) => {
            const isCurrent = bucket.weekLabel === 'Esta Semana';
            const percentage = Math.round((bucket.count / maxWeeklyCount) * 100);

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-indigo-950/20 border-indigo-500/30'
                    : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-indigo-300' : 'text-zinc-400'
                    }`}
                  >
                    {bucket.weekLabel}
                  </span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Actual
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-zinc-100">
                    {bucket.count}
                  </span>
                  <span className="text-[11px] text-zinc-500">commits</span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCurrent ? 'bg-indigo-500' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${Math.max(percentage, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desglose Individual de Desarrolladores */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Desempeño Individual de Desarrolladores
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Detalle de commits, velocidad semana a semana, repositorios activos y tipos de tareas de cada colaborador.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filtrar por desarrollador o repo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs font-medium">
              <button
                onClick={() => setSortBy('thisWeek')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  sortBy === 'thisWeek'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setSortBy('total')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  sortBy === 'total'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Total 4 Semanas
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Tarjetas de Desarrolladores */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDevelopers.map((dev, idx) => {
            const isTop = idx === 0 && dev.thisWeekCommits > 0;
            const chronologicalDevBuckets = [...dev.weeklyBuckets].reverse();
            const maxDevBucket = Math.max(...dev.weeklyBuckets.map((b) => b.count), 1);

            return (
              <div
                key={dev.authorKey}
                className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all shadow-md space-y-5"
              >
                {/* Fila Superior: Perfil + Velocidad */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    {dev.avatar_url ? (
                      <img
                        src={dev.avatar_url}
                        alt={dev.name}
                        className="w-12 h-12 rounded-2xl border border-zinc-700 object-cover flex-shrink-0 shadow-inner"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                        {dev.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-zinc-100">{dev.name}</h4>
                        {isTop && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Award className="w-3 h-3" /> #1 Top Contributor
                          </span>
                        )}
                        {dev.login && (
                          <a
                            href={dev.html_url || `https://github.com/${dev.login}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                          >
                            @{dev.login}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 mt-0.5">
                        {dev.totalCommits} commits totales en el período analizado
                      </p>
                    </div>
                  </div>

                  {/* Badge de Rendimiento Semanal */}
                  <div className="flex items-center gap-3 self-start sm:self-auto bg-zinc-950/60 p-2.5 px-4 rounded-2xl border border-zinc-800">
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block font-medium">Esta semana</span>
                      <span className="text-xl font-black text-zinc-100">
                        {dev.thisWeekCommits}{' '}
                        <span className="text-xs font-normal text-zinc-500">commits</span>
                      </span>
                    </div>

                    <div className="h-8 w-px bg-zinc-800 mx-1" />

                    <div>
                      <span className="text-[10px] text-zinc-500 block">Tendencia vs ant.</span>
                      {dev.trendPercentage !== null ? (
                        <span
                          className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                            dev.trendPercentage > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : dev.trendPercentage < 0
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {dev.trendPercentage > 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-0.5" />
                          ) : dev.trendPercentage < 0 ? (
                            <ArrowDownRight className="w-3 h-3 mr-0.5" />
                          ) : (
                            <Minus className="w-3 h-3 mr-0.5" />
                          )}
                          {dev.trendPercentage > 0
                            ? `+${dev.trendPercentage}%`
                            : `${dev.trendPercentage}%`}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-semibold">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visualizador de Semanas (Evolución de este desarrollador) */}
                <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/80">
                  <span className="text-[11px] font-bold text-zinc-400 mb-3 block">
                    Avance Semana a Semana:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {chronologicalDevBuckets.map((wb, bIdx) => {
                      const isCurrentWeek = wb.weekLabel === 'Esta Semana';
                      const bucketPercent = Math.round((wb.count / maxDevBucket) * 100);

                      return (
                        <div
                          key={bIdx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            isCurrentWeek
                              ? 'bg-indigo-950/20 border-indigo-500/30'
                              : 'bg-zinc-900/60 border-zinc-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span
                              className={`font-semibold ${
                                isCurrentWeek ? 'text-indigo-300' : 'text-zinc-400'
                              }`}
                            >
                              {wb.weekLabel}
                            </span>
                            <span className="font-extrabold text-zinc-100">{wb.count}</span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCurrentWeek ? 'bg-indigo-500' : 'bg-zinc-600'
                              }`}
                              style={{ width: `${Math.max(bucketPercent, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desglose de Tipos de Aportes y Repositorios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Tipos de Tareas */}
                  <div className="bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/80">
                    <span className="text-[11px] font-bold text-zinc-400 mb-2 block">
                      Tipos de Aportes Realizados:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {dev.types.feat > 0 && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {dev.types.feat} Feats / Features
                        </span>
                      )}
                      {dev.types.fix > 0 && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {dev.types.fix} Bug Fixes
                        </span>
                      )}
                      {dev.types.refactor > 0 && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {dev.types.refactor} Refactors
                        </span>
                      )}
                      {dev.types.devops > 0 && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {dev.types.devops} DevOps / Config
                        </span>
                      )}
                      {dev.types.other > 0 && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {dev.types.other} Otros commits
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Repositorios Activos */}
                  <div className="bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/80">
                    <span className="text-[11px] font-bold text-zinc-400 mb-2 block">
                      Repositorios con Actividad:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {dev.repos.map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300"
                        >
                          <Code2 className="w-3 h-3 text-indigo-400" />
                          <strong className="text-zinc-100">{r.repo}</strong>
                          <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded-md">
                            {r.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Último Commit Realizado */}
                {dev.latestCommit && (
                  <div className="pt-2 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-zinc-500 font-medium whitespace-nowrap">
                        Último commit:
                      </span>
                      <code className="text-indigo-400 font-mono text-[11px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {dev.latestCommit.shortSha}
                      </code>
                      <span className="text-zinc-300 truncate font-medium">
                        "{dev.latestCommit.message}"
                      </span>
                      <span className="text-zinc-500 text-[11px] whitespace-nowrap hidden sm:inline">
                        • {dev.latestCommit.repo} ({formatDate(dev.latestCommit.date)})
                      </span>
                    </div>

                    <a
                      href={dev.latestCommit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors flex-shrink-0"
                    >
                      Ver en GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {filteredDevelopers.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
              No se encontraron desarrolladores que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
