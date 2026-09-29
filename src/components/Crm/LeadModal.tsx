'use client';

import React, { useState } from 'react';
import { CrmCategory, CrmLead, CrmStatus, TeamMember } from '@/lib/types';
import { X, Building2, User, Phone, Mail, MapPin, DollarSign, Cpu, FileText, CheckCircle2 } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  initialCategory?: CrmCategory;
  initialLead?: CrmLead | null;
  team: TeamMember[];
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCategory = 'CUSTOM_DEV',
  initialLead,
  team,
}) => {
  const isEditing = Boolean(initialLead);

  const [category, setCategory] = useState<CrmCategory>(
    initialLead?.category || initialCategory
  );
  const [companyName, setCompanyName] = useState(initialLead?.companyName || '');
  const [contactName, setContactName] = useState(initialLead?.contactName || '');
  const [email, setEmail] = useState(initialLead?.email || '');
  const [phone, setPhone] = useState(initialLead?.phone || '');
  const [city, setCity] = useState(initialLead?.city || '');
  const [province, setProvince] = useState(initialLead?.province || '');

  // Custom dev
  const [projectType, setProjectType] = useState(initialLead?.projectType || 'WEB_APP');
  const [budgetRange, setBudgetRange] = useState(initialLead?.budgetRange || '$2k-$5k');
  const [techNotes, setTechNotes] = useState(initialLead?.techNotes || '');

  // Nexus
  const [businessType, setBusinessType] = useState(initialLead?.businessType || 'RETAIL');
  const [priceList, setPriceList] = useState(initialLead?.priceList || 'Plan PyME Pro');

  const [status, setStatus] = useState<CrmStatus>(initialLead?.status || 'NUEVO');
  const [assignedToId, setAssignedToId] = useState(initialLead?.assignedToId || '');
  const [notes, setNotes] = useState(initialLead?.notes || '');
  const [nextContactAt, setNextContactAt] = useState(
    initialLead?.nextContactAt ? initialLead.nextContactAt.slice(0, 10) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert('Por favor indica el nombre de la empresa o comercio');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        category,
        companyName: companyName.trim(),
        contactName: contactName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        projectType: category === 'CUSTOM_DEV' ? projectType : undefined,
        budgetRange: category === 'CUSTOM_DEV' ? budgetRange : undefined,
        techNotes: category === 'CUSTOM_DEV' ? techNotes.trim() || undefined : undefined,
        businessType: category === 'PRODUCT_NEXUS' ? businessType : undefined,
        priceList: category === 'PRODUCT_NEXUS' ? priceList : undefined,
        status,
        assignedToId: assignedToId || undefined,
        notes: notes.trim() || undefined,
        nextContactAt: nextContactAt ? new Date(nextContactAt).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el prospecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Editar Prospecto' : 'Nuevo Prospecto Comercial'}
              </h3>
              <p className="text-xs text-slate-400">
                Almacena y sincroniza con Google Sheets y el pipeline de Atom
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Category Switcher */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Línea Comercial de ATOM
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('CUSTOM_DEV')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    category === 'CUSTOM_DEV'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    ⚡ Nuevos Desarrollos
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Software a medida, apps móviles, plataformas web e integraciones.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('PRODUCT_NEXUS')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    category === 'PRODUCT_NEXUS'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-md shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    📦 Productos Hechos (Nexus)
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Ventas de licencias de Nexus para control de stock, caja y comercios.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {category === 'CUSTOM_DEV' ? 'Empresa / Proyecto *' : 'Comercio / Negocio *'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={category === 'CUSTOM_DEV' ? 'Ej: Fintech NovaPay S.A.' : 'Ej: Café Central'}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Persona de Contacto
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ej: Mariano Benítez (CTO)"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                WhatsApp / Teléfono
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +5491145678901"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: contacto@empresa.com"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ciudad / Localidad
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Palermo / Rosario"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Provincia
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Ej: Buenos Aires / CABA / Córdoba"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Conditional Fields: Custom Dev vs Nexus */}
          {category === 'CUSTOM_DEV' ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Detalles del Proyecto de Desarrollo
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Proyecto
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CUSTOM_SOFTWARE">Software a Medida Integral</option>
                    <option value="MOBILE_APP">App Móvil (iOS / Android)</option>
                    <option value="WEB_APP">Plataforma Web / SaaS</option>
                    <option value="AI_AGENT">Agente IA / Automatización</option>
                    <option value="CLOUD_BACKEND">Cloud, DevOps & APIs</option>
                    <option value="ATOM_PRODUCT">Producto Propio de Atom</option>
                    <option value="CORPORATE_CLIENT">Cuenta / Cliente Corporativo</option>
                    <option value="INTEGRATION">Integración API / ERP / Webhooks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Rango de Presupuesto Estimado
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="<$2k">Menos de USD 2.000</option>
                      <option value="$2k-$5k">USD 2.000 - 5.000</option>
                      <option value="$5k-$15k">USD 5.000 - 15.000</option>
                      <option value=">$15k">Más de USD 15.000</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas Técnicas / Requerimientos de Arquitectura
                </label>
                <textarea
                  rows={2}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Ej: Necesitan panel en Next.js, app en React Native, base de datos Postgres y conexión con MercadoPago..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-4">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Detalles del Comercio (Nexus)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Rubro Comercial
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RETAIL">Comercio Minorista / Tienda</option>
                    <option value="GASTRONOMY">Gastronomía / Bares / Cafés</option>
                    <option value="WHOLESALE">Distribuidora / Mayorista</option>
                    <option value="SERVICES">Servicios Profesionales</option>
                    <option value="INDUSTRIAL">Ferretería / Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Plan Sugerido de Nexus
                  </label>
                  <select
                    value={priceList}
                    onChange={(e) => setPriceList(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Plan Inicial">Plan Inicial (1 caja / stock básico)</option>
                    <option value="Plan PyME Pro">Plan PyME Pro (Multisucursal + Facturación)</option>
                    <option value="Plan Empresa">Plan Empresa (Personalizado + Soporte Dedicado)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Status & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estado Comercial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CrmStatus)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="NUEVO">Sin contactar (Nuevo)</option>
                <option value="CONTACTADO">Contactado</option>
                <option value="RESPONDIO">Respondió</option>
                <option value="REUNION">Reunión / Demo</option>
                <option value="PROPUESTA">Propuesta Enviada</option>
                <option value="CLIENTE">Cliente Cerrado</option>
                <option value="DESCARTADO">Descartado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Asesor Responsable
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Sin Asignar (Equipo General)</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Próximo Contacto (Agenda)
              </label>
              <input
                type="date"
                value={nextContactAt}
                onChange={(e) => setNextContactAt(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notas de Seguimiento
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe detalles del último contacto o próximos pasos..."
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Prospecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
