'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { GithubCommit, GithubRepo, GithubStatus, TeamMember } from '@/lib/types';
import { CreateTrelloCardModal, TrelloIcon } from '../Integrations/CreateTrelloCardModal';
import { ShareToSlackModal } from '../Integrations/ShareToSlackModal';
import {
  GitCommit,
  GitBranch,
  ExternalLink,
  RefreshCw,
  Sparkles,
  BookmarkPlus,
  CheckCircle2,
  Lock,
  Globe,
  Code2,
  Calendar,
  User as UserIcon,
  AlertCircle,
  KeyRound,
  ChevronRight,
  Search,
  MessageSquare,
} from 'lucide-react';

interface GithubActivityViewProps {
  currentMember: TeamMember | null;
  onSelectCommitForPost?: (commit: GithubCommit) => void;
  onCommitIngested?: () => void;
}

export const GithubActivityView: React.FC<GithubActivityViewProps> = ({
  currentMember,
  onSelectCommitForPost,
  onCommitIngested,
}) => {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [branches, setBranches] = useState<string[]>(['main', 'testing']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [ingestedShas, setIngestedShas] = useState<Record<string, boolean>>({});
  const [ingestingSha, setIngestingSha] = useState<string | null>(null);
  const [showTokenHelp, setShowTokenHelp] = useState<boolean>(false);
  const [trelloModalCommit, setTrelloModalCommit] = useState<GithubCommit | null>(null);
  const [slackModalCommit, setSlackModalCommit] = useState<GithubCommit | null>(null);

  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const [statusRes, reposRes, branchesRes] = await Promise.all([
        api.getGithubStatus().catch(() => null),
        api.getGithubRepos().catch(() => []),
        api.getGithubBranches(selectedRepo).catch(() => ['main', 'testing']),
      ]);

      setStatus(statusRes);
      setRepos(reposRes);
      setBranches(branchesRes);

      const commitsRes = await api.getGithubCommits(selectedRepo, selectedBranch).catch(() => []);
      setCommits(commitsRes);
    } catch (err) {
      console.error('Error al cargar datos de GitHub:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRepo, selectedBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRepoChange = async (repoName: string) => {
    setSelectedRepo(repoName);
    try {
      setIsRefreshing(true);
      const repoBranches = await api.getGithubBranches(repoName).catch(() => ['main', 'testing']);
      setBranches(repoBranches);
      const branchToUse = repoBranches.includes(selectedBranch) ? selectedBranch : (repoBranches[0] || 'main');
      if (branchToUse !== selectedBranch) {
        setSelectedBranch(branchToUse);
      }
      const commitsRes = await api.getGithubCommits(repoName, branchToUse);
      setCommits(commitsRes);
    } catch (err) {
      console.error('Error al cambiar de repositorio:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBranchChange = async (branchName: string) => {
    setSelectedBranch(branchName);
    try {
      setIsRefreshing(true);
      const commitsRes = await api.getGithubCommits(selectedRepo, branchName);
      setCommits(commitsRes);
    } catch (err) {
      console.error('Error al cambiar de rama:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleIngestCommit = async (commit: GithubCommit) => {
    try {
      setIngestingSha(commit.sha);
      await api.ingestGithubCommit({
        repo: commit.repo,
        sha: commit.sha,
        message: commit.message,
        html_url: commit.html_url,
        authorName: commit.author.name,
        authorLogin: commit.author.login,
        userId: currentMember?.id,
      });

      setIngestedShas((prev) => ({ ...prev, [commit.sha]: true }));
      if (onCommitIngested) onCommitIngested();
    } catch (err: any) {
      alert(`Error al guardar en el banco: ${err.message || err}`);
    } finally {
      setIngestingSha(null);
    }
  };

  const getCommitTypeBadge = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.startsWith('feat') || lower.includes('feat:')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">FEAT</span>;
    }
    if (lower.startsWith('fix') || lower.includes('fix:')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">BUG FIX</span>;
    }
    if (lower.startsWith('refactor') || lower.includes('refactor:')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">REFACTOR</span>;
    }
    if (lower.startsWith('perf') || lower.includes('perf:')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">PERF</span>;
    }
    if (lower.startsWith('config') || lower.startsWith('chore') || lower.startsWith('ci') || lower.startsWith('build')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">DEVOPS</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">DEV</span>;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredCommits = commits.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.message.toLowerCase().includes(q) ||
      c.author.name.toLowerCase().includes(q) ||
      (c.author.login && c.author.login.toLowerCase().includes(q)) ||
      c.repo.toLowerCase().includes(q) ||
      c.shortSha.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera Principal de GitHub */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-700 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
            {status?.avatar_url ? (
              <img src={status.avatar_url} alt="GitHub Org" className="w-full h-full object-cover" />
            ) : (
              <Code2 className="w-7 h-7 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-zinc-100">
                {status?.orgName || 'Atom Soluciones IT'}
              </h2>
              <a
                href={status?.html_url || `https://github.com/${status?.org || 'atomSolucionesit'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 transition-colors"
              >
                github.com/{status?.org || 'atomSolucionesit'}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Feed en tiempo real de commits, desarrolladores y código fuente listo para redes.
            </p>
          </div>
        </div>

        {/* Acciones y Estado */}
        <div className="flex items-center gap-3">
          {status?.configured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Token GitHub Activo
            </span>
          ) : (
            <button
              onClick={() => setShowTokenHelp(!showTokenHelp)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" /> Repos Privados: Conectar Token
            </button>
          )}

          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            title="Recargar commits"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Banner Informativo si falta el Token de Repositorios Privados */}
      {(!status?.configured || showTokenHelp) && (
        <div className="p-5 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-3 shadow-lg">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="font-bold text-zinc-100 text-sm">
                ¿Cómo ver repositorios privados como <code className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">atom-crm-front</code> y <code className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">atom-crm-api</code>?
              </h4>
              <p className="text-zinc-300 leading-relaxed">
                Por defecto, la API pública de GitHub solo muestra repositorios públicos. Para que la plataforma liste los repositorios privados y lea los commits de tu equipo:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400 pt-1">
                <li>
                  Ingresa a{' '}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 underline font-semibold"
                  >
                    github.com/settings/tokens
                  </a>{' '}
                  y crea un <strong>Personal access token (classic)</strong>.
                </li>
                <li>
                  Marca la casilla <strong>repo</strong> (Full control of private repositories) y <strong>read:org</strong>.
                </li>
                <li>
                  Agrega en <code className="text-emerald-400 font-mono">backend/.env</code>:
                  <div className="mt-1 p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-emerald-400 border border-zinc-800 select-all">
                    GITHUB_TOKEN="ghp_tu_token_aqui"<br />
                    GITHUB_ORG="atomSolucionesit"
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros: Repositorios y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Selector de Repositorios */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => handleRepoChange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedRepo === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Todos los Repos</span>
            <span className="text-[10px] opacity-70 bg-black/20 px-1.5 py-0.2 rounded-full">
              {repos.length}
            </span>
          </button>

          {repos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleRepoChange(repo.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedRepo === repo.name
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {repo.private ? (
                <Lock className="w-3 h-3 text-amber-400" />
              ) : (
                <Globe className="w-3 h-3 text-zinc-500" />
              )}
              <span>{repo.name}</span>
            </button>
          ))}
        </div>

        {/* Buscador de commits */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por mensaje o autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Selector de Rama: main vs testing y demás ramas */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mr-1">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rama activa:</span>
          </div>

          {/* Botón main (Producción) */}
          <button
            onClick={() => handleBranchChange('main')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedBranch === 'main'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedBranch === 'main' ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>main (Producción)</span>
          </button>

          {/* Botón testing (Pruebas / QA) */}
          <button
            onClick={() => handleBranchChange('testing')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedBranch === 'testing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${selectedBranch === 'testing' ? 'bg-amber-300 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>testing (Pruebas / QA)</span>
          </button>

          {/* Selector de otras ramas detectadas */}
          {branches.filter((b) => !['main', 'testing'].includes(b)).length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={['main', 'testing'].includes(selectedBranch) ? '' : selectedBranch}
                onChange={(e) => {
                  if (e.target.value) handleBranchChange(e.target.value);
                }}
                className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="">Otras ramas ({branches.filter((b) => !['main', 'testing'].includes(b)).length})...</option>
                {branches
                  .filter((b) => !['main', 'testing'].includes(b))
                  .map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
          <span>Repositorio:</span>
          <span className="font-semibold text-zinc-200">
            {selectedRepo === 'ALL' ? 'Todos' : selectedRepo}
          </span>
          <span className="text-zinc-600">•</span>
          <span>Rama:</span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-950 font-mono text-[11px] font-bold text-indigo-300 border border-zinc-800">
            {selectedBranch}
          </span>
        </div>
      </div>

      {/* Lista de Commits */}
      {isLoading ? (
        <div className="p-16 text-center rounded-3xl bg-zinc-900/30 border border-zinc-800/80">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-400">Consultando commits de la organización...</p>
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800">
          <GitCommit className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">No se encontraron commits</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {selectedRepo !== 'ALL'
              ? `No hay commits recientes en el repositorio ${selectedRepo}.`
              : 'Verifica la conexión a GitHub o agrega tu GITHUB_TOKEN para ver repositorios privados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCommits.map((commit) => {
            const isIngested = ingestedShas[commit.sha];
            const isIngesting = ingestingSha === commit.sha;

            return (
              <div
                key={commit.sha}
                className="group p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Info Principal: Autor y Mensaje */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Avatar de GitHub del Desarrollador */}
                  <a
                    href={commit.author.html_url || `https://github.com/${commit.author.login || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Ver perfil de ${commit.author.name} en GitHub`}
                    className="relative flex-shrink-0"
                  >
                    <img
                      src={commit.author.avatar_url || `https://github.com/identicons/${commit.author.name}.png`}
                      alt={commit.author.name}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700/80 shadow-sm"
                    />
                  </a>

                  {/* Detalle del Commit */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Badge de tipo de commit */}
                      {getCommitTypeBadge(commit.message)}

                      {/* Repositorio */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-950 text-indigo-300 border border-zinc-800">
                        {commit.repo}
                      </span>

                      {/* Rama */}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                        (commit.branch || selectedBranch) === 'main'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : (commit.branch || selectedBranch) === 'testing'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          : 'bg-zinc-950 text-indigo-300 border-zinc-800'
                      }`}>
                        <GitBranch className="w-2.5 h-2.5" />
                        {commit.branch || selectedBranch}
                      </span>

                      {/* Short SHA */}
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                        {commit.shortSha}
                      </span>

                      {/* Fecha */}
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(commit.date)}
                      </span>
                    </div>

                    {/* Mensaje del Commit */}
                    <p className="text-xs font-mono text-zinc-200 break-words leading-relaxed">
                      {commit.message}
                    </p>

                    {/* Autor */}
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-semibold text-zinc-300">
                        {commit.author.name}
                      </span>
                      {commit.author.login && (
                        <span className="text-zinc-500">
                          @{commit.author.login}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center gap-2 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                  {/* Botón Ver en GitHub */}
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="hidden sm:inline">GitHub</span>
                  </a>

                  {/* Botón Crear Tarea en Trello */}
                  <button
                    onClick={() => setTrelloModalCommit(commit)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/40 hover:border-blue-700 text-blue-300 text-xs font-medium transition-colors"
                    title="Crear tarea o reporte en Trello desde este commit"
                  >
                    <TrelloIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Trello</span>
                  </button>

                  {/* Botón Notificar a Slack */}
                  <button
                    onClick={() => setSlackModalCommit(commit)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 hover:border-purple-700 text-purple-300 text-xs font-medium transition-colors"
                    title="Notificar o compartir este commit en Slack"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Slack</span>
                  </button>

                  {/* Guardar en Banco de Contenido */}
                  <button
                    onClick={() => handleIngestCommit(commit)}
                    disabled={isIngested || isIngesting}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isIngested
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {isIngested ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Guardado</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>{isIngesting ? 'Guardando...' : 'Al Banco'}</span>
                      </>
                    )}
                  </button>

                  {/* Crear Publicación con IA (Solo para Marketing y Admin) */}
                  {onSelectCommitForPost && currentMember?.role !== 'DEVELOPER' && (
                    <button
                      onClick={() => onSelectCommitForPost(commit)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Crear Post con IA</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear Tarea Trello desde Commit */}
      {trelloModalCommit && (
        <CreateTrelloCardModal
          isOpen={!!trelloModalCommit}
          onClose={() => setTrelloModalCommit(null)}
          initialData={{
            name: `[${trelloModalCommit.repo}] ${trelloModalCommit.message.split('\n')[0]}`,
            desc: `📌 Commit en GitHub:\n• Repositorio: ${trelloModalCommit.repo}\n• Rama: ${trelloModalCommit.branch || selectedBranch}\n• Autor: ${trelloModalCommit.author.name} (@${trelloModalCommit.author.login || 'dev'})\n• Commit SHA: ${trelloModalCommit.sha}\n• URL: ${trelloModalCommit.html_url}\n\n📝 Mensaje Completo:\n${trelloModalCommit.message}`,
          }}
        />
      )}

      {/* Modal Notificar Commit a Slack */}
      {slackModalCommit && (
        <ShareToSlackModal
          isOpen={!!slackModalCommit}
          onClose={() => setSlackModalCommit(null)}
          currentMember={currentMember}
          initialData={{
            eventType: 'COMMIT_SHARED',
            title: `[${slackModalCommit.repo}] ${slackModalCommit.message.split('\n')[0]}`,
            detail: `📌 Commit en rama \`${slackModalCommit.branch || selectedBranch}\` por *${slackModalCommit.author.name}* (@${slackModalCommit.author.login || 'dev'})\nSHA: \`${slackModalCommit.shortSha}\`\n\n${slackModalCommit.message}`,
            link: slackModalCommit.html_url,
            metadata: {
              repo: slackModalCommit.repo,
              branch: slackModalCommit.branch || selectedBranch,
              sha: slackModalCommit.sha,
            },
            preferredChannel: 'desarrollo',
          }}
        />
      )}
    </div>
  );
};
