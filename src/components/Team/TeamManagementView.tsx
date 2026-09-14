'use client';

import React, { useState, useEffect } from 'react';
import { TeamMember, UserRole, LoginAuditLog } from '@/lib/types';
import { api } from '@/lib/api';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Code,
  Palette,
  Check,
  X,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Globe,
  Monitor,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TeamManagementViewProps {
  members: TeamMember[];
  currentMember: TeamMember | null;
  onCreateMember: (data: { name: string; email: string; role: UserRole; title?: string; password?: string }) => Promise<void>;
  onUpdateMember: (id: string, data: Partial<TeamMember>) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  members,
  currentMember,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'MEMBERS' | 'AUDIT'>('MEMBERS');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState<UserRole>('DEVELOPER');
  const [password, setPassword] = useState('dev123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<LoginAuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const loadAuditLogs = async () => {
    try {
      setIsLoadingAudit(true);
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error('Error cargando logs de auditoría:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'AUDIT') {
      loadAuditLogs();
    }
  }, [activeSubTab]);

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setTitle('');
    setPassword('dev123');
    setRole('DEVELOPER');
    setEditingMember(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email);
    setTitle(m.title || '');
    setPassword(m.password || '');
    setRole(m.role);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingMember) {
        await onUpdateMember(editingMember.id, { name, email, role, title, password });
      } else {
        await onCreateMember({ name, email, role, title, password });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar el colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (userRole: UserRole | string) => {
    switch (userRole) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin / Lead
          </span>
        );
      case 'MARKETING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Palette className="w-3.5 h-3.5" />
            Marketing
          </span>
        );
      case 'DEVELOPER':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code className="w-3.5 h-3.5" />
            Desarrollador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Cabecera & Pestañas de Sección */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Administración de Equipo, Roles & Auditoría
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gestiona accesos, credenciales y supervisa el registro inmutable de inicios de sesión.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('MEMBERS')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'MEMBERS'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            👥 Colaboradores ({members.length})
          </button>
          <button
            onClick={() => setActiveSubTab('AUDIT')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'AUDIT'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>📋 Auditoría de Logins</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: LISTA DE COLABORADORES */}
      {activeSubTab === 'MEMBERS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Miembros Registrados
            </span>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Agregar Colaborador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const isCurrent = currentMember?.id === member.id;
              return (
                <div
                  key={member.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isCurrent
                      ? 'bg-zinc-900 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-200 border border-zinc-700">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                            {member.name}
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                                Activo
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-zinc-400">{member.title || 'Colaborador'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {members.length > 1 && (
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-zinc-500 text-[11px] truncate">{member.email}</div>
                      <div className="pt-1">{getRoleBadge(member.role)}</div>
                    </div>

                    {/* Métricas de actividad */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                      <span>Aportes en el banco:</span>
                      <strong className="text-zinc-200">{member._count?.rawAssets || 0}</strong>
                    </div>
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-zinc-500" />
                      Acceso protegido
                    </span>
                    {isCurrent && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Sesión activa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

          {/* MATRIZ COMPARATIVA DE PERMISOS POR ROL */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Matriz de Permisos y Flujos Diferenciados
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="py-3 px-4 font-semibold">Funcionalidad en la Plataforma</th>
                    <th className="py-3 px-4 font-semibold text-emerald-400">💻 Desarrollador</th>
                    <th className="py-3 px-4 font-semibold text-pink-400">🎨 Marketing / Creativo</th>
                    <th className="py-3 px-4 font-semibold text-indigo-400">🛡️ Admin / Lead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Subida rápida de Bugs, Incidentes y Queries (Dev Log)
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">✓ Especializada</td>
                    <td className="py-3 px-4 text-zinc-500">Opcional</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Total</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Subida de Fotos, Videos, Diseños y Material Crudo General
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Solo capturas / código</td>
                    <td className="py-3 px-4 text-pink-400 font-bold">✓ Ilimitado</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Total</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Sugerir generación de carruseles con IA desde notas
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">✓ Modo Sugerencia</td>
                    <td className="py-3 px-4 text-pink-400 font-bold">✓ Modo Completo</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Total</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Lienzo Visual de Slides, Edición de Copys y Descarga PNG
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Lectura / Sugerencia</td>
                    <td className="py-3 px-4 text-pink-400 font-bold">✓ Total</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Total</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Calendario Editorial y Alertas de Recurrencia
                    </td>
                    <td className="py-3 px-4 text-zinc-500">Solo consulta</td>
                    <td className="py-3 px-4 text-pink-400 font-bold">✓ Total</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Total</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Configuración del Perfil de Marca (Colores, Tono, Estilo)
                    </td>
                    <td className="py-3 px-4 text-zinc-500">—</td>
                    <td className="py-3 px-4 text-zinc-500">—</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Exclusivo Admin</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">
                      Gestión de Empleados, Asignación de Roles y Permisos
                    </td>
                    <td className="py-3 px-4 text-zinc-500">—</td>
                    <td className="py-3 px-4 text-zinc-500">—</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">✓ Exclusivo Admin</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: REGISTRO DE AUDITORÍA DE INICIOS DE SESIÓN */}
      {activeSubTab === 'AUDIT' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Historial de Accesos & Logins
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Registro inmutable de todos los intentos de autenticación exitosos y fallidos.
              </p>
            </div>

            <button
              onClick={loadAuditLogs}
              disabled={isLoadingAudit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
                    <th className="py-3 px-4 font-semibold">Fecha & Hora</th>
                    <th className="py-3 px-4 font-semibold">Usuario / Correo</th>
                    <th className="py-3 px-4 font-semibold">Rol</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                    <th className="py-3 px-4 font-semibold">Dirección IP</th>
                    <th className="py-3 px-4 font-semibold">Cliente / Navegador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No hay registros de auditoría aún.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isSuccess = log.status === 'SUCCESS';
                      return (
                        <tr key={log.id} className="hover:bg-zinc-950/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-200">
                              {log.user?.name || log.email}
                            </div>
                            <div className="text-[10px] text-zinc-500">{log.email}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.role ? getRoleBadge(log.role) : <span className="text-zinc-500">—</span>}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Exitoso
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                <AlertCircle className="w-3 h-3" />
                                Fallido
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-zinc-500" />
                              {log.ipAddress || '127.0.0.1'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-zinc-400 max-w-xs truncate">
                            <span className="flex items-center gap-1 truncate" title={log.userAgent || ''}>
                              <Monitor className="w-3 h-3 flex-shrink-0 text-zinc-500" />
                              <span className="truncate">{log.userAgent || 'Desconocido'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Colaborador */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                {editingMember ? 'Editar Colaborador' : 'Nuevo Colaborador'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Andrés Silva"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andres@empresa.dev"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña inicial"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Cargo / Puesto</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Fullstack Dev / Social Media Lead"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Selector de Rol */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Rol en la Plataforma</label>
                <div className="space-y-1.5">
                  {[
                    {
                      role: 'DEVELOPER' as UserRole,
                      title: 'Desarrollador (Dev Log)',
                      desc: 'Subida rápida de bugs, incidentes, optimizaciones y código.',
                      icon: Code,
                      color: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10',
                    },
                    {
                      role: 'MARKETING' as UserRole,
                      title: 'Creativo / Marketing',
                      desc: 'Subida de todo el material, carruseles, copys y calendario.',
                      icon: Palette,
                      color: 'border-pink-500/50 text-pink-300 bg-pink-500/10',
                    },
                    {
                      role: 'ADMIN' as UserRole,
                      title: 'Administrador / Lead',
                      desc: 'Acceso total + Perfil de marca y auditoría de accesos.',
                      icon: ShieldCheck,
                      color: 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = role === item.role;
                    return (
                      <div
                        key={item.role}
                        onClick={() => setRole(item.role)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? item.color
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-auto" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingMember ? 'Guardar Cambios' : 'Crear Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
