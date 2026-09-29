'use client';

import React, { useState } from 'react';
import { CrmLead } from '@/lib/types';
import { X, Send, Copy, Check, MessageSquare, Sparkles } from 'lucide-react';

interface WhatsAppModalProps {
  lead: CrmLead;
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  lead,
  isOpen,
  onClose,
  onMessageSent,
}) => {
  const isNexus = lead.category === 'PRODUCT_NEXUS';

  const NEXUS_TEMPLATES = {
    presentacion: {
      titulo: 'Presentación Demo (15 min)',
      texto: `Hola {nombre}, ¿cómo estás? Te escribo de ATOM Soluciones IT.

Trabajamos con comercios como {empresa} ordenando el stock, las ventas y el control de caja en un solo sistema. Se llama Nexus y está hecho para PyMEs argentinas: sabés qué se vende, qué te falta reponer y cuánta plata entra, sin planillas sueltas ni cuentas a mano.

Si querés te lo muestro funcionando en una videollamada de 15 minutos, sin ningún compromiso.

¿Qué día de esta semana te queda cómodo?`,
    },
    corto: {
      titulo: 'Contacto Corto',
      texto: `Hola {nombre}, te escribo de ATOM Soluciones IT. Trabajamos con comercios como {empresa} ordenando stock, ventas y caja en un solo sistema propio, Nexus. ¿Te interesa que te muestre cómo funciona en 15 minutos?`,
    },
    seguimiento: {
      titulo: 'Seguimiento',
      texto: `Hola {nombre}, ¿cómo va? Te había escrito por Nexus, el sistema de gestión que armamos en ATOM para comercios como {empresa}.

Te dejo la puerta abierta: si esta semana tenés 15 minutos, te lo muestro funcionando y vos decidís. ¿Te sirve algún día en particular?`,
    },
    cierre: {
      titulo: 'Cierre / Agendar',
      texto: `Hola {nombre}, quedamos en que te mostraba Nexus funcionando en {empresa}.

Tengo lugar disponible esta semana. ¿Te queda mejor mañana a la mañana o por la tarde?`,
    },
  };

  const DEV_TEMPLATES = {
    discovery: {
      titulo: 'Relevamiento Técnico (Discovery)',
      texto: `Hola {nombre}, ¿cómo estás? Te contacto de ATOM Soluciones IT.

Estuvimos analizando los requerimientos para el proyecto de {empresa} ({tipo_proyecto}). Como software factory especializada en arquitecturas modernas y desarrollo a medida, nos gustaría coordinar una breve reunión técnica de 20 minutos con uno de nuestros Tech Leads para relevar el alcance y prepararles una propuesta con estimación de sprints y costos.

¿Qué día y horario les queda bien para una videollamada rápida?`,
    },
    propuesta: {
      titulo: 'Envío de Propuesta & Presupuesto',
      texto: `Hola {nombre}, un gusto saludarte. Te escribo de ATOM Soluciones IT para comentarte que nuestro equipo de ingeniería ya tiene lista la propuesta técnica y estimación de desarrollo para {empresa}.

Incluye arquitectura recomendada, tecnologías, cronograma de entregas y presupuesto estimado. ¿Te parece si te la enviamos por correo o preferís que la revisemos juntos en una call de 15 minutos?`,
    },
    seguimiento_dev: {
      titulo: 'Seguimiento de Cotización',
      texto: `Hola {nombre}, ¿cómo estás? Te escribo de ATOM para consultar si pudieron revisar la propuesta de desarrollo que les enviamos para {empresa}.

Cualquier duda sobre el alcance técnico, plazos o formas de pago, estamos a total disposición para adaptarla a sus necesidades.`,
    },
    kickoff: {
      titulo: 'Kickoff de Desarrollo',
      texto: `Hola {nombre}, ¡excelentes noticias! Ya tenemos listo al equipo de desarrollo de ATOM para dar inicio al proyecto de {empresa}.

¿Podemos coordinar para mañana a las 11:00 hs la reunión de inicio (Kickoff) para presentarles al equipo y definir los primeros entregables?`,
    },
  };

  const activeTemplates = isNexus ? NEXUS_TEMPLATES : DEV_TEMPLATES;
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
    Object.keys(activeTemplates)[0]
  );
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Inicializar o actualizar texto cuando cambia el template o el lead
  React.useEffect(() => {
    const tpl = (activeTemplates as any)[selectedTemplateKey]?.texto || '';
    const formatted = tpl
      .replace(/{nombre}/g, lead.contactName || 'Estimado/a')
      .replace(/{empresa}/g, lead.companyName || 'su empresa')
      .replace(/{ciudad}/g, lead.city || 'su ciudad')
      .replace(/{tipo_proyecto}/g, lead.projectType || 'desarrollo a medida');
    setCustomText(formatted);
    setCopied(false);
  }, [selectedTemplateKey, lead, isNexus]);

  if (!isOpen) return null;

  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

  const handleOpenWhatsApp = () => {
    if (!cleanPhone) {
      alert('Este prospecto no tiene un número de teléfono válido registrado.');
      return;
    }
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    if (onMessageSent) onMessageSent();
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                WhatsApp Comercial · {lead.companyName}
              </h3>
              <p className="text-xs text-slate-400">
                Línea:{' '}
                <span className={isNexus ? 'text-indigo-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {isNexus ? '📦 Productos Hechos (Nexus)' : '⚡ Nuevos Desarrollos'}
                </span>{' '}
                · Contacto: {lead.contactName || 'No especificado'} ({lead.phone || 'Sin tel'})
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

        {/* Templates Selector */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Plantillas probadas para esta línea comercial
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeTemplates).map(([key, tpl]: [string, any]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplateKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTemplateKey === key
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tpl.titulo}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Mensaje a enviar (personalizable antes de enviar):
          </label>
          <textarea
            rows={9}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none shadow-inner"
            placeholder="Escribe el mensaje..."
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Variables reemplazadas: <b>{lead.contactName || 'nombre'}</b>, <b>{lead.companyName}</b>
            </span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar texto'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Abrir en WhatsApp Web / App
          </button>
        </div>
      </div>
    </div>
  );
};
