'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  RawAsset,
  Publication,
  BrandProfile,
  CadenceHealth,
  TeamMember,
  AssetStatus,
  PublicationStatus,
  Slide,
  PublicationCopy,
  UserRole,
} from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CadenceAlertBanner } from '@/components/CadenceAlertBanner';
import { ContentBankView } from '@/components/ContentBank/ContentBankView';
import { CarouselStudioView } from '@/components/CarouselStudio/CarouselStudioView';
import { EditorialCalendarView } from '@/components/Calendar/EditorialCalendarView';
import { BrandProfileView } from '@/components/BrandProfile/BrandProfileView';
import { TeamManagementView } from '@/components/Team/TeamManagementView';
import { GithubActivityView } from '@/components/Github/GithubActivityView';
import { DeveloperPerformanceView } from '@/components/Github/DeveloperPerformanceView';
import { IntegrationsHubView } from '@/components/Integrations/IntegrationsHubView';
import { UploadModal } from '@/components/ContentBank/UploadModal';
import { LoginPage } from '@/components/Auth/LoginPage';
import { GithubCommit } from '@/lib/types';
import { Database, Sparkles, Calendar, Palette, Plus, Loader2, Users, Code, Code2, ShieldCheck, TrendingUp, MessageSquare } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'bank' | 'studio' | 'calendar' | 'brand' | 'team' | 'github' | 'performance' | 'integrations'>('bank');

  // Estados de datos
  const [assets, setAssets] = useState<RawAsset[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [health, setHealth] = useState<CadenceHealth | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Estados de interfaz
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificar sesión guardada en localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('dev_social_session');
      if (savedSession) {
        setCurrentMember(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthChecked(true);
    }
  }, []);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [assetsData, tagsData, pubsData, brandData, healthData, teamData] = await Promise.all([
        api.getAssets().catch(() => []),
        api.getTags().catch(() => []),
        api.getPublications().catch(() => []),
        api.getBrandProfile().catch(() => null),
        api.getCadenceHealth().catch(() => null),
        api.getTeamMembers().catch(() => []),
      ]);

      setAssets(assetsData);
      setTags(tagsData);
      setPublications(pubsData);
      if (pubsData.length > 0 && !selectedPublicationId) {
        setSelectedPublicationId(pubsData[0].id);
      }
      setBrand(brandData);
      setHealth(healthData);
      setTeam(teamData);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPublicationId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Restricción de pestañas para Desarrolladores
  useEffect(() => {
    if (currentMember?.role === 'DEVELOPER') {
      if (activeTab === 'studio' || activeTab === 'calendar' || activeTab === 'brand' || activeTab === 'team') {
        setActiveTab('bank');
      }
    }
  }, [currentMember, activeTab]);

  // Manejo de Banco de Contenido
  const handleToggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedAssetIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedAssetIds([]);
  };

  const handleUpdateAssetStatus = async (id: string, status: AssetStatus) => {
    await api.updateAssetStatus(id, status);
    const updated = await api.getAssets();
    setAssets(updated);
    const updatedHealth = await api.getCadenceHealth();
    setHealth(updatedHealth);
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('¿Eliminar este material del banco?')) return;
    await api.deleteAsset(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedAssetIds((prev) => prev.filter((i) => i !== id));
  };

  // Generar publicación a partir de los assets seleccionados
  const handleGeneratePublication = async (rawAssetIds: string[], userPrompt?: string) => {
    try {
      setIsGenerating(true);
      const newPub = await api.generatePublication({
        rawAssetIds,
        userPrompt,
      });

      setPublications((prev) => [newPub, ...prev]);
      setSelectedPublicationId(newPub.id);
      setSelectedAssetIds([]);
      setActiveTab('studio');

      const updatedHealth = await api.getCadenceHealth();
      setHealth(updatedHealth);
    } catch (err) {
      console.error('Error al generar publicación:', err);
      alert('Hubo un error al generar el carrusel con IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generación automática desde banner de cadencia
  const handleAutoGenerateFromCadence = async () => {
    try {
      setIsGenerating(true);
      const newPub = await api.autoGenerateFromCadence();
      setPublications((prev) => [newPub, ...prev]);
      setSelectedPublicationId(newPub.id);
      setActiveTab('studio');
      const updatedHealth = await api.getCadenceHealth();
      setHealth(updatedHealth);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generar publicación a partir de un commit de GitHub
  const handleSelectCommitForPost = async (commit: GithubCommit) => {
    try {
      setIsGenerating(true);
      const asset = await api.ingestGithubCommit({
        repo: commit.repo,
        sha: commit.sha,
        message: commit.message,
        html_url: commit.html_url,
        authorName: commit.author.name,
        authorLogin: commit.author.login,
        userId: currentMember?.id,
      });

      const updatedAssets = await api.getAssets();
      setAssets(updatedAssets);

      const newPub = await api.generatePublication({
        rawAssetIds: [asset.id],
        userPrompt: `Enfocar la publicación en el hito técnico del repositorio ${commit.repo}: "${commit.message}". Explicar la importancia de la solución y aprendizaje del equipo de software para redes sociales.`,
      });

      setPublications((prev) => [newPub, ...prev]);
      setSelectedPublicationId(newPub.id);
      setActiveTab('studio');

      const updatedHealth = await api.getCadenceHealth();
      setHealth(updatedHealth);
    } catch (err: any) {
      console.error('Error al generar post desde commit:', err);
      alert(`Hubo un error al generar el carrusel con IA: ${err?.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Actualizaciones dentro del Carousel Studio
  const handleUpdateSlide = async (pubId: string, slideId: string, data: Partial<Slide>) => {
    const updatedSlide = await api.updateSlide(pubId, slideId, data);
    setPublications((prev) =>
      prev.map((pub) => {
        if (pub.id !== pubId) return pub;
        return {
          ...pub,
          slides: pub.slides.map((s) => (s.id === slideId ? { ...s, ...updatedSlide } : s)),
        };
      }),
    );
  };

  const handleRegenerateSlideImage = async (pubId: string, slideId: string) => {
    const updatedSlide = await api.regenerateSlideImage(pubId, slideId);
    setPublications((prev) =>
      prev.map((pub) => {
        if (pub.id !== pubId) return pub;
        return {
          ...pub,
          slides: pub.slides.map((s) => (s.id === slideId ? { ...s, ...updatedSlide } : s)),
        };
      }),
    );
  };

  const handleUpdateCopy = async (pubId: string, copyId: string, data: Partial<PublicationCopy>) => {
    const updatedCopy = await api.updateCopy(pubId, copyId, data);
    setPublications((prev) =>
      prev.map((pub) => {
        if (pub.id !== pubId) return pub;
        return {
          ...pub,
          copies: pub.copies.map((c) => (c.id === copyId ? { ...c, ...updatedCopy } : c)),
        };
      }),
    );
  };

  const handleUpdatePublicationStatus = async (pubId: string, status: PublicationStatus) => {
    const updatedPub = await api.updatePublication(pubId, { status });
    setPublications((prev) => prev.map((p) => (p.id === pubId ? { ...p, status: updatedPub.status } : p)));
    const updatedHealth = await api.getCadenceHealth();
    setHealth(updatedHealth);
  };

  const handlePublishPublication = async (pubId: string) => {
    const updatedPub = await api.publishPublication(pubId);
    setPublications((prev) => prev.map((p) => (p.id === pubId ? updatedPub : p)));
    const updatedAssets = await api.getAssets();
    setAssets(updatedAssets);
    const updatedHealth = await api.getCadenceHealth();
    setHealth(updatedHealth);
  };

  const handleDeletePublication = async (pubId: string) => {
    if (!confirm('¿Deseas eliminar este carrusel y sus diapositivas?')) return;
    await api.deletePublication(pubId);
    setPublications((prev) => prev.filter((p) => p.id !== pubId));
    if (selectedPublicationId === pubId) {
      setSelectedPublicationId(publications.find((p) => p.id !== pubId)?.id || null);
    }
  };

  const handleUpdateBrand = async (data: Partial<BrandProfile>) => {
    const updated = await api.updateBrandProfile(data);
    setBrand(updated);
  };

  // Manejo de Colaboradores / Roles
  const handleCreateMember = async (data: { name: string; email: string; role: UserRole; title?: string }) => {
    const newMember = await api.createMember(data);
    const updatedTeam = await api.getTeamMembers();
    setTeam(updatedTeam);
  };

  const handleUpdateMember = async (id: string, data: Partial<TeamMember>) => {
    await api.updateMember(id, data);
    const updatedTeam = await api.getTeamMembers();
    setTeam(updatedTeam);
    if (currentMember?.id === id) {
      setCurrentMember(updatedTeam.find((m) => m.id === id) || currentMember);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('¿Eliminar este usuario del equipo?')) return;
    await api.deleteMember(id);
    const updatedTeam = await api.getTeamMembers();
    setTeam(updatedTeam);
    if (currentMember?.id === id) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dev_social_session');
    localStorage.removeItem('dev_social_token');
    setCurrentMember(null);
  };

  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Cargando plataforma de contenido...</p>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar pantalla formal de login
  if (!currentMember) {
    return (
      <LoginPage
        brand={brand}
        onLoginSuccess={(user) => {
          setCurrentMember(user);
        }}
      />
    );
  }

  const role = currentMember?.role || 'DEVELOPER';
  const isAdmin = role === 'ADMIN';
  const isMarketing = role === 'MARKETING';
  const isDeveloper = role === 'DEVELOPER';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegación Superior con Perfil y Logout */}
      <Navbar
        brand={brand}
        currentMember={currentMember}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner informativo de modo para Desarrollador */}
        {isDeveloper && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>
                Estás navegando en <strong>Modo Desarrollador</strong>. Tus subidas van directo al banco de notas técnicas para que el equipo de marketing cree publicaciones con ellas.
              </span>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all whitespace-nowrap shadow-xs"
            >
              + Subir Bug / Log Técnico
            </button>
          </div>
        )}

        {/* Banner de Cadencia / Frecuencia de Publicación */}
        {health?.needsNudge && !isDeveloper && (
          <CadenceAlertBanner
            health={health}
            onAutoGenerate={handleAutoGenerateFromCadence}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
        )}

        {/* Barra de Pestañas Principales (Adaptada por Roles) */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'bank'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco de Contenido</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {assets.length}
            </span>
          </button>

          {/* Estudio de Carruseles & Copys (Solo Marketing y Admin) */}
          {!isDeveloper && (
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Estudio de Carruseles & Copys</span>
              {publications.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                  {publications.length}
                </span>
              )}
            </button>
          )}

          {/* Calendario Editorial (Solo Marketing y Admin) */}
          {!isDeveloper && (
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendario Editorial</span>
            </button>
          )}

          {/* Pestañas para Administradores y Marketing */}
          {(isAdmin || isMarketing) && (
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'brand'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Perfil de Marca</span>
            </button>
          )}

          {/* Pestaña de GitHub Commits & Repos */}
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>GitHub Dev</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live
            </span>
          </button>

          {/* Pestaña de Rendimiento y Avance Semanal de Desarrolladores */}
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'performance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Rendimiento Dev</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Semanal
            </span>
          </button>

          {/* Pestaña de Integraciones (Slack, Trello, Mail Plesk) */}
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'integrations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Slack & Trello</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              + Mail
            </span>
          </button>

          {/* Pestaña de Gestión de Equipo (Exclusiva para Administrador) */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'team'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Equipo & Roles</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                {team.length}
              </span>
            </button>
          )}
        </div>

        {/* Contenido según la pestaña activa */}
        <div className="pt-2">
          {activeTab === 'bank' && (
            <ContentBankView
              assets={assets}
              tags={tags}
              selectedAssetIds={selectedAssetIds}
              onToggleSelectAsset={handleToggleSelectAsset}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onUpdateStatus={handleUpdateAssetStatus}
              onDeleteAsset={handleDeleteAsset}
              onGeneratePublication={(ids) => handleGeneratePublication(ids)}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === 'studio' && !isDeveloper && (
            <CarouselStudioView
              publications={publications}
              selectedPublicationId={selectedPublicationId}
              brand={brand}
              currentMember={currentMember}
              onSelectPublication={(id) => setSelectedPublicationId(id)}
              onUpdateSlide={handleUpdateSlide}
              onRegenerateSlideImage={handleRegenerateSlideImage}
              onUpdateCopy={handleUpdateCopy}
              onUpdateStatus={handleUpdatePublicationStatus}
              onPublishPublication={handlePublishPublication}
              onDeletePublication={handleDeletePublication}
              onQuickGenerate={(prompt) => handleGeneratePublication([], prompt)}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === 'calendar' && !isDeveloper && (
            <EditorialCalendarView
              publications={publications}
              health={health}
              onSelectPublication={(id) => {
                setSelectedPublicationId(id);
                setActiveTab('studio');
              }}
              onAutoGenerateFromCadence={handleAutoGenerateFromCadence}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === 'github' && (
            <GithubActivityView
              currentMember={currentMember}
              onSelectCommitForPost={handleSelectCommitForPost}
              onCommitIngested={async () => {
                const updated = await api.getAssets();
                setAssets(updated);
                const updatedTags = await api.getTags();
                setTags(updatedTags);
              }}
            />
          )}

          {activeTab === 'performance' && (
            <DeveloperPerformanceView />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsHubView currentMember={currentMember} team={team} />
          )}

          {activeTab === 'brand' && (isAdmin || isMarketing) && (
            <BrandProfileView brand={brand} onUpdateBrand={handleUpdateBrand} />
          )}

          {activeTab === 'team' && isAdmin && (
            <TeamManagementView
              members={team}
              currentMember={currentMember}
              onCreateMember={handleCreateMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}
        </div>
      </main>

      {/* Modal de Ingesta Rápida (Adaptativo a roles) */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={async () => {
          const updated = await api.getAssets();
          setAssets(updated);
          const updatedTags = await api.getTags();
          setTags(updatedTags);
          const updatedHealth = await api.getCadenceHealth();
          setHealth(updatedHealth);
        }}
        apiUpload={(formData) => api.uploadAsset(formData)}
        currentMember={currentMember}
      />
    </div>
  );
}
