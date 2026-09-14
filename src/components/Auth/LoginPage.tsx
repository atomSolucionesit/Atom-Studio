'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { TeamMember, BrandProfile } from '@/lib/types';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  brand: BrandProfile | null;
  onLoginSuccess: (user: TeamMember) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ brand, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.login(email.trim(), password);
      // Guardar token y usuario en localStorage
      localStorage.setItem('dev_social_session', JSON.stringify(res.user));
      localStorage.setItem('dev_social_token', res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Luces de fondo ambientales */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Cabecera & Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-lg text-white shadow-xl shadow-indigo-500/20 mx-auto">
            {brand?.name ? brand.name.slice(0, 2).toUpperCase() : 'VL'}
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            {brand?.name || 'Dev Social Studio'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Autenticación de colaboradores y control de acceso por roles.
          </p>
        </div>

        {/* Tarjeta de Login Seguro */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@atomsolucionesit.com.ar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Nota de Auditoría de Seguridad al pie */}
        <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Acceso protegido con hashing bcrypt y auditoría de accesos.</span>
        </p>
      </div>
    </div>
  );
};
