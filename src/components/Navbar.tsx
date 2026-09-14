'use client';

import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Plus,
  ShieldCheck,
  Code,
  Palette,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  FileSpreadsheet,
  Cloud,
} from 'lucide-react';
import { BrandProfile, TeamMember, UserRole } from '@/lib/types';
import { api } from '@/lib/api';

interface NavbarProps {
  brand: BrandProfile | null;
  currentMember: TeamMember | null;
  onOpenUpload: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  brand,
  currentMember,
  onOpenUpload,
  onLogout,
}) => {
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveSyncResult, setDriveSyncResult] = useState<string | null>(null);

  const loadCloudStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const data = await api.getGoogleStatus();
      setCloudStatus(data);
    } catch (err) {
      console.error('Error al consultar estado de Google:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadCloudStatus();
  }, []);

  const handleSyncSheets = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      const res = await api.syncGoogleSheets();
      if (res.synced > 0) {
        setSyncResult(`✅ Se sincronizaron ${res.synced} de ${res.total} elementos a Google Sheets.`);
      } else {
        setSyncResult(`ℹ️ Total de elementos: ${res.total}. Configura las credenciales en .env para exportar a la planilla.`);
      }
    } catch (err: any) {
      setSyncResult(`❌ Error: ${err.message || 'Fallo de sincronización'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncDrive = async () => {
    try {
      setIsSyncingDrive(true);
      setDriveSyncResult(null);
      const res = await api.syncGoogleDrive();
      if (res.uploaded > 0) {
        setDriveSyncResult(`✅ Se subieron ${res.uploaded} archivos locales a Google Drive con éxito.`);
        loadCloudStatus();
      } else if (res.totalPending === 0) {
        setDriveSyncResult(`✨ Todos los archivos locales ya están sincronizados en Google Drive.`);
      } else {
        const firstErr = res.errors?.[0]?.error || 'Error desconocido';
        setDriveSyncResult(`⚠️ Pendientes: ${res.totalPending}. ${firstErr}`);
      }
    } catch (err: any) {
      setDriveSyncResult(`❌ Error: ${err.message || 'Fallo de sincronización a Drive'}`);
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'MARKETING':
        return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      case 'DEVELOPER':
      default:
        return <Code className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRoleBadgeClasses = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'MARKETING':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'DEVELOPER':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const isConnected = cloudStatus?.isFullyConnected;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            {brand?.name ? brand.name.slice(0, 2).toUpperCase() : 'AT'}
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              {brand?.name || 'Atom Soluciones IT'}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Cloud Sync
              </span>
            </h1>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Gestor de Contenido & Dev Journey
            </p>
          </div>
        </div>

        {/* Acciones Centrales & Derechas */}
        <div className="flex items-center gap-3">
          {/* Indicador Interactivo de Google Drive + Sheets */}
          <button
            onClick={() => {
              setIsCloudModalOpen(true);
              loadCloudStatus();
            }}
            title="Ver estado de conexión con Google Drive y Google Sheets"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all cursor-pointer shadow-xs"
          >
            <HardDrive className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden md:inline">Drive & Sheets</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* Identificador de Usuario & Rol Autenticado */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
            {getRoleIcon(currentMember?.role)}
            <span className="max-w-[130px] truncate font-medium">{currentMember?.name || 'Usuario'}</span>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRoleBadgeClasses(
                currentMember?.role,
              )}`}
            >
              {currentMember?.role || 'DEV'}
            </span>
          </div>

          {/* Botón de Logout seguro */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          )}

          {/* Botón de Carga Rápida (Adaptativo según el rol) */}
          <button
            onClick={onOpenUpload}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all ${
              currentMember?.role === 'DEVELOPER'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {currentMember?.role === 'DEVELOPER' ? 'Subir Bug / Dev Log' : 'Subir Material'}
            </span>
          </button>
        </div>
      </div>
    </header>

    {/* Modal Informativo y de Estado de Google Drive & Sheets (Fuera del header para no verse recortado) */}
    {isCloudModalOpen && (
      <div
        onClick={() => setIsCloudModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto my-auto"
        >
          {/* Cabecera del modal */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Almacenamiento en Nube (Google)
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Google Drive (archivos) & Google Sheets (base de datos)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCloudModalOpen(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Estado de Servicios */}
          <div className="space-y-3">
            {/* Google Drive */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-zinc-200">Google Drive (Imágenes & Videos)</strong>
                  {cloudStatus?.drive?.status === 'CONNECTED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" /> Modo Local (uploads/)
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-[11px] mt-1">
                  {cloudStatus?.drive?.message || 'Verificando...'}
                </p>
              </div>
            </div>

            {/* Google Sheets */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-zinc-200">Google Sheets (Base de Datos)</strong>
                  {cloudStatus?.sheets?.status === 'CONNECTED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Conectado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" /> Sin configurar
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-[11px] mt-1">
                  {cloudStatus?.sheets?.message || 'Verificando...'}
                </p>
              </div>
            </div>
          </div>

          {/* Sincronización Manual */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Sincronización del Banco de Contenido
                </span>
                <span className="text-[10px] text-zinc-500">
                  Exporta todas las notas y material actual a Google Sheets
                </span>
              </div>
              <button
                onClick={handleSyncSheets}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar con Sheets'}</span>
              </button>
            </div>

            {syncResult && (
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                {syncResult}
              </div>
            )}
          </div>

          {/* Sincronización a Google Drive */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Sincronización a Google Drive
                </span>
                <span className="text-[10px] text-zinc-500">
                  Sube fotos y videos locales pendientes a la carpeta de Drive
                </span>
              </div>
              <button
                onClick={handleSyncDrive}
                disabled={isSyncingDrive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                <HardDrive className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                <span>{isSyncingDrive ? 'Subiendo...' : 'Subir a Drive'}</span>
              </button>
            </div>

            {driveSyncResult && (
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300">
                {driveSyncResult}
              </div>
            )}
          </div>

          {/* Cuenta de Servicio Conectada */}
          {cloudStatus?.serviceAccount?.clientEmail && (
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Cuenta de Servicio Conectada
              </span>
              <p className="text-xs font-mono text-emerald-400 break-all">
                {cloudStatus.serviceAccount.clientEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    )}
  </>
  );
};
