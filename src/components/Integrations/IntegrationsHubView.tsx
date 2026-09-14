'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  SlackStatus,
  SlackChannel,
  TrelloStatus,
  TrelloBoard,
  TrelloList,
  MailStatus,
  InternalEmailItem,
  TeamMember,
} from '@/lib/types';
import { TrelloIcon } from './CreateTrelloCardModal';
import {
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Layers,
  Calendar,
  KeyRound,
  ShieldCheck,
  User as UserIcon,
  ChevronRight,
  GitCommit,
  Flame,
  Bug,
  HelpCircle,
  Inbox,
  SendHorizontal,
  Palmtree,
  Briefcase,
  Wrench,
  Globe,
  Lock,
  Clock,
  UserCheck,
  AtSign,
} from 'lucide-react';

interface IntegrationsHubViewProps {
  currentMember: TeamMember | null;
  team: TeamMember[];
}

export const IntegrationsHubView: React.FC<IntegrationsHubViewProps> = ({
  currentMember,
  team,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'slack' | 'trello' | 'mail'>('slack');

  // Estados de Diagnóstico / Conexión
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  const [trelloStatus, setTrelloStatus] = useState<TrelloStatus | null>(null);
  const [mailStatus, setMailStatus] = useState<MailStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Estados de Slack
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([]);
  const [selectedSlackChannel, setSelectedSlackChannel] = useState<string>('');
  const [dailyBranch, setDailyBranch] = useState<string>('main');
  const [dailyCustomNote, setDailyCustomNote] = useState<string>('');
  const [isSendingDaily, setIsSendingDaily] = useState<boolean>(false);
  const [dailySuccessMsg, setDailySuccessMsg] = useState<string | null>(null);

  // Slack: Bug Fix Form
  const [bugRepo, setBugRepo] = useState<string>('atom-crm-api');
  const [bugTitle, setBugTitle] = useState<string>('');
  const [bugDesc, setBugDesc] = useState<string>('');
  const [bugSha, setBugSha] = useState<string>('');
  const [isSendingBug, setIsSendingBug] = useState<boolean>(false);
  const [bugSuccessMsg, setBugSuccessMsg] = useState<string | null>(null);

  // Slack: Mensaje Libre
  const [freeText, setFreeText] = useState<string>('');
  const [isSendingFreeText, setIsSendingFreeText] = useState<boolean>(false);
  const [freeTextSuccess, setFreeTextSuccess] = useState<string | null>(null);

  // Estados de Trello
  const [trelloBoards, setTrelloBoards] = useState<TrelloBoard[]>([]);
  const [selectedTrelloBoardId, setSelectedTrelloBoardId] = useState<string>('');
  const [trelloLists, setTrelloLists] = useState<TrelloList[]>([]);
  const [selectedTrelloListId, setSelectedTrelloListId] = useState<string>('');
  const [trelloCardTitle, setTrelloCardTitle] = useState<string>('');
  const [trelloCardDesc, setTrelloCardDesc] = useState<string>('');
  const [trelloCardDue, setTrelloCardDue] = useState<string>('');
  const [trelloNotifySlack, setTrelloNotifySlack] = useState<boolean>(true);
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);
  const [createdTrelloCards, setCreatedTrelloCards] = useState<any[]>([]);

  // Estados de Correo Plesk extendidos
  const [recipientType, setRecipientType] = useState<'team' | 'external'>('team');
  const [emailRecipientId, setEmailRecipientId] = useState<string>('');
  const [emailExternalAddress, setEmailExternalAddress] = useState<string>('');
  const [emailExternalName, setEmailExternalName] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailContent, setEmailContent] = useState<string>('');
  const [emailTemplate, setEmailTemplate] = useState<string>('custom');
  const [emailMailPassword, setEmailMailPassword] = useState<string>('');
  const [emailNotifySlack, setEmailNotifySlack] = useState<boolean>(false);
  const [emailSlackChannel, setEmailSlackChannel] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

  // Bandeja de Entrada / Salida
  const [mailSubView, setMailSubView] = useState<'compose' | 'inbox' | 'sent'>('compose');
  const [userEmails, setUserEmails] = useState<{ received: InternalEmailItem[]; sent: InternalEmailItem[] }>({
    received: [],
    sent: [],
  });
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);

  // Cargar estados y recursos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoadingStatus(true);
      const [slackSt, trelloSt, mailSt, channelsRes, boardsRes] = await Promise.all([
        api.getSlackStatus().catch(() => null),
        api.getTrelloStatus().catch(() => null),
        api.getMailStatus().catch(() => null),
        api.getSlackChannels().catch(() => []),
        api.getTrelloBoards().catch(() => []),
      ]);

      setSlackStatus(slackSt);
      setTrelloStatus(trelloSt);
      setMailStatus(mailSt);

      setSlackChannels(channelsRes);
      if (channelsRes.length > 0) {
        setSelectedSlackChannel(channelsRes[0].id);
        setEmailSlackChannel(channelsRes[0].id);
      }

      setTrelloBoards(boardsRes);
      if (boardsRes.length > 0) {
        const firstBoard = boardsRes[0];
        setSelectedTrelloBoardId(firstBoard.id);
        const listsRes = await api.getTrelloBoardLists(firstBoard.id).catch(() => []);
        setTrelloLists(listsRes);
        if (listsRes.length > 0) {
          setSelectedTrelloListId(listsRes[0].id);
        }
      }

      // Pre-seleccionar primer miembro diferente a mí para correo
      const otherMember = team.find((m) => m.id !== currentMember?.id) || team[0];
      if (otherMember) {
        setEmailRecipientId(otherMember.id);
      }
    } catch (err) {
      console.error('Error cargando integraciones:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [team, currentMember]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Cargar emails del usuario cuando va a inbox o sent
  const loadUserEmails = async () => {
    try {
      setIsLoadingEmails(true);
      const emails = await api.getUserEmails(currentMember?.id);
      setUserEmails(emails);
    } catch (err) {
      console.error('Error cargando emails:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'mail' && (mailSubView === 'inbox' || mailSubView === 'sent')) {
      loadUserEmails();
    }
  }, [activeSubTab, mailSubView]);

  // Manejo de cambio de tablero de Trello
  const handleTrelloBoardChange = async (boardId: string) => {
    setSelectedTrelloBoardId(boardId);
    try {
      const listsRes = await api.getTrelloBoardLists(boardId);
      setTrelloLists(listsRes);
      if (listsRes.length > 0) setSelectedTrelloListId(listsRes[0].id);
      else setSelectedTrelloListId('');
    } catch (err) {
      console.error(err);
    }
  };

  // Enviar Daily de Avances a Slack
  const handleSendDaily = async () => {
    if (!selectedSlackChannel) {
      alert('Por favor selecciona un canal de Slack');
      return;
    }

    try {
      setIsSendingDaily(true);
      setDailySuccessMsg(null);
      const res = await api.postSlackDaily({
        channel: selectedSlackChannel,
        branch: dailyBranch,
        customNote: dailyCustomNote.trim() || undefined,
        authorName: currentMember?.name,
      });

      const chName = slackChannels.find((c) => c.id === selectedSlackChannel)?.name || selectedSlackChannel;
      setDailySuccessMsg(
        res.simulated
          ? `Daily simulado procesado para #${chName} (Revisa la consola / configura SLACK_BOT_TOKEN)`
          : `¡Daily de avances publicado con éxito en #${chName}!`,
      );
      setDailyCustomNote('');
    } catch (err: any) {
      alert(`Error al enviar daily: ${err.message || err}`);
    } finally {
      setIsSendingDaily(false);
    }
  };

  // Enviar Notificación de Bug Fix a Slack
  const handleSendBugFix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim()) {
      alert('Por favor indica el título del bug resuelto.');
      return;
    }

    try {
      setIsSendingBug(true);
      setBugSuccessMsg(null);
      const res = await api.postSlackBugFix({
        channel: selectedSlackChannel,
        repo: bugRepo,
        title: bugTitle.trim(),
        description: bugDesc.trim() || undefined,
        shortSha: bugSha.trim() || undefined,
        author: currentMember?.name || 'Dev Team',
        authorName: currentMember?.name,
      });

      const chName = slackChannels.find((c) => c.id === selectedSlackChannel)?.name || selectedSlackChannel;
      setBugSuccessMsg(
        res.simulated
          ? `Notificación de bug procesada en modo simulación para #${chName}`
          : `¡Bug fix anunciado en #${chName}!`,
      );
      setBugTitle('');
      setBugDesc('');
      setBugSha('');
    } catch (err: any) {
      alert(`Error al notificar bugfix: ${err.message || err}`);
    } finally {
      setIsSendingBug(false);
    }
  };

  // Enviar Mensaje Libre a Slack
  const handleSendFreeText = async () => {
    if (!freeText.trim()) return;

    try {
      setIsSendingFreeText(true);
      setFreeTextSuccess(null);
      const res = await api.postSlackMessage({
        channel: selectedSlackChannel,
        text: freeText.trim(),
        username: currentMember?.name ? `${currentMember.name} (Atom)` : undefined,
        icon_url: currentMember?.avatar || undefined,
      });
      const chName = slackChannels.find((c) => c.id === selectedSlackChannel)?.name || selectedSlackChannel;
      setFreeTextSuccess(res.simulated ? `Mensaje simulado para #${chName}` : `¡Mensaje enviado a #${chName}!`);
      setFreeText('');
    } catch (err: any) {
      alert(`Error: ${err.message || err}`);
    } finally {
      setIsSendingFreeText(false);
    }
  };

  // Crear Tarjeta en Trello
  const handleCreateTrelloCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trelloCardTitle.trim()) {
      alert('Por favor indica un título para la tarjeta.');
      return;
    }
    if (!selectedTrelloListId) {
      alert('Por favor selecciona una lista de Trello.');
      return;
    }

    try {
      setIsCreatingCard(true);
      const card = await api.createTrelloCard({
        idList: selectedTrelloListId,
        name: trelloCardTitle.trim(),
        desc: trelloCardDesc.trim() || undefined,
        due: trelloCardDue ? new Date(trelloCardDue).toISOString() : undefined,
        notifySlackChannel: trelloNotifySlack && selectedSlackChannel ? selectedSlackChannel : undefined,
      });

      setCreatedTrelloCards((prev) => [card, ...prev]);
      setTrelloCardTitle('');
      setTrelloCardDesc('');
      setTrelloCardDue('');
    } catch (err: any) {
      alert(`Error al crear tarjeta: ${err.message || err}`);
    } finally {
      setIsCreatingCard(false);
    }
  };

  // Manejar plantilla de correo corporativo y operativo
  const handleTemplateChange = (tpl: string) => {
    setEmailTemplate(tpl);
    const myName = currentMember?.name || 'Julian Niveyro';
    const myEmail = currentMember?.email || 'admin@atomsolucionesit.com.ar';
    const myTitle = currentMember?.title || 'Atom Soluciones IT';

    if (tpl === 'ausencia') {
      setEmailSubject(`[Ausencia / Permiso] Aviso y cobertura - ${myName}`);
      setEmailContent(
`Estimado equipo,\n\nLes comunico que estaré ausente desde el [Fecha inicio] hasta el [Fecha fin] por motivos de [Vacaciones / Trámite personal / Permiso acordado].\n\nDurante este período:\n• Las tareas y soporte activo quedan cubiertos por: [Nombre del compañero]\n• Contacto de contingencia para emergencias críticas: [Slack / Teléfono]\n\nSaludos cordiales,\n${myName}\n${myTitle}`
      );
    } else if (tpl === 'presencia') {
      setEmailSubject(`[Presencia / Guardia] Disponibilidad operativa activa - ${myName}`);
      setEmailContent(
`Hola equipo,\n\nConfirmo inicio de turno y disponibilidad activa para atención de tickets, soporte y guardias técnicas de infraestructura.\n\n• Franja horaria: 09:00 a 18:00 hs (ART)\n• Canales de contacto inmediato: Slack y Correo Corporativo.\n\nQuedo atento a cualquier urgencia o requerimiento.\n\nSaludos,\n${myName}`
      );
    } else if (tpl === 'lead') {
      setRecipientType('external');
      setEmailSubject(`Propuesta de Servicios y Soluciones Tecnológicas — Atom IT`);
      setEmailContent(
`Estimado/a [Nombre del Cliente / Lead],\n\nEs un placer ponerme en contacto con usted desde Atom Soluciones IT. Nos especializamos en diseño e ingeniería de software, arquitectura cloud escalable y transformación digital para empresas.\n\nNos gustaría acercarle nuestra propuesta técnica y comercial acordada o coordinar una breve llamada de 15 minutos para profundizar sobre los requerimientos de su proyecto.\n\nQuedamos a su entera disposición ante cualquier consulta.\n\nAtentamente,\n${myName}\n${myTitle} — Atom Soluciones IT\n${myEmail}`
      );
    } else if (tpl === 'tecnico') {
      setEmailSubject(`[Aviso Técnico] Despliegue de Release y Cierre de Sprint`);
      setEmailContent(
`Equipo técnico y de producto,\n\nSe ha completado el despliegue programado en el entorno de producción:\n• Versión: v1.4.0\n• Módulos clave: Core API, Integraciones Slack/Trello, Plesk Mail universal\n• Notas: Monitoreo activo sin errores detectados\n\nPor favor verificar sus funcionalidades asignadas y reportar cualquier incidencia.\n\nSaludos,\n${myName}`
      );
    } else if (tpl === 'bug') {
      setEmailSubject(`[Alerta de Incidente] Corrección y verificación requerida`);
      setEmailContent(
`Hola equipo,\n\nSe detectó y solucionó la siguiente incidencia en el sistema:\n• Repositorio / Servicio: atom-crm-api\n• Causa identificada: Problema de sincronización de credenciales\n• Estado: Parche aplicado y verificado en rama test\n\nSaludos,\n${myName}`
      );
    } else {
      setEmailSubject('');
      setEmailContent('');
    }
  };

  // Enviar Correo Interno o Externo vía Plesk SMTP (Universal)
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) {
      alert('Debes estar autenticado para enviar correos.');
      return;
    }
    if (recipientType === 'team' && !emailRecipientId) {
      alert('Por favor selecciona un compañero del equipo.');
      return;
    }
    if (recipientType === 'external' && !emailExternalAddress.trim()) {
      alert('Por favor indica la dirección de correo electrónico del destinatario / cliente.');
      return;
    }
    if (!emailSubject.trim() || !emailContent.trim()) {
      alert('Completa el asunto y el contenido del correo.');
      return;
    }

    try {
      setIsSendingEmail(true);
      setEmailSuccessMsg(null);
      setEmailErrorMsg(null);

      const payload: any = {
        senderId: currentMember.id,
        subject: emailSubject.trim(),
        content: emailContent.trim(),
        type:
          emailTemplate === 'ausencia'
            ? 'AUSENCIA'
            : emailTemplate === 'presencia'
            ? 'PRESENCIA'
            : emailTemplate === 'lead'
            ? 'LEAD_CONTACT'
            : emailTemplate === 'tecnico'
            ? 'TECNICO'
            : emailTemplate === 'bug'
            ? 'BUG_ALERT'
            : 'GENERAL',
      };

      if (recipientType === 'team') {
        payload.recipientId = emailRecipientId;
      } else {
        payload.recipientEmail = emailExternalAddress.trim();
        payload.recipientName = emailExternalName.trim() || emailExternalAddress.trim();
      }

      if (emailMailPassword.trim()) {
        payload.mailPassword = emailMailPassword.trim();
      }

      if (emailNotifySlack && emailSlackChannel) {
        payload.notifySlackChannel = emailSlackChannel;
      }

      const email = await api.sendInternalEmail(payload);

      const destText =
        recipientType === 'team'
          ? `${email.recipient?.name || 'el compañero'} (${email.recipient?.email})`
          : `${email.recipientName || email.recipientEmail} (${email.recipientEmail})`;

      if (email.smtpSent) {
        setEmailSuccessMsg(
          `¡Correo despachado con éxito vía servidor Plesk (${mailStatus?.host || 'mail.atomsolucionesit.com.ar'}:${mailStatus?.port || 465} SSL) a ${destText}!`,
        );
      } else {
        setEmailSuccessMsg(
          `Correo registrado en plataforma para ${destText}.${
            (email as any).smtpError ? ` (Aviso SMTP: ${(email as any).smtpError})` : ' (Listo en tu bandeja).'
          }`,
        );
      }

      setEmailSubject('');
      setEmailContent('');
      setEmailExternalAddress('');
      setEmailExternalName('');
      setEmailTemplate('custom');
      // Recargar listados
      loadUserEmails();
    } catch (err: any) {
      setEmailErrorMsg(`Error al enviar correo: ${err.message || err}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera Principal */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner flex-shrink-0">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-zinc-100">
                Centro de Integraciones & Comunicación
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Slack • Trello • Plesk Mail
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Publica reportes y fixes en Slack, gestiona tareas en Trello y envía correos internos vía Plesk sin webmail.
            </p>
          </div>
        </div>

        {/* Badges de Estado de Conexión */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Slack Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              slackStatus?.configured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Slack: {slackStatus?.configured ? 'Conectado' : 'Simulación'}</span>
          </span>

          {/* Trello Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              trelloStatus?.configured
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <TrelloIcon className="w-3.5 h-3.5" />
            <span>Trello: {trelloStatus?.configured ? 'Conectado' : 'Simulación'}</span>
          </span>

          {/* Mail Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              mailStatus?.configured
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Plesk Mail: {mailStatus?.configured ? 'SMTP Activo' : 'Interno'}</span>
          </span>
        </div>
      </div>

      {/* Sub-Pestañas de Navegación */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('slack')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'slack'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Slack Hub (Dailies & Fixes)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('trello')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'trello'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <TrelloIcon className="w-4 h-4" />
          <span>Trello Hub (Levantar Tareas)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeSubTab === 'mail'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Correo Plesk (Mailing sin Webmail)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. SECCIÓN SLACK HUB */}
      {/* ========================================================= */}
      {activeSubTab === 'slack' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Selector de Canal General de Slack */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-zinc-300">
                Canal de Slack seleccionado para envíos:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSlackChannel}
                onChange={(e) => setSelectedSlackChannel(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono font-semibold focus:outline-hidden focus:border-indigo-500"
              >
                {slackChannels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.name} {ch.is_private ? '(privado)' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-zinc-500">
                ({slackChannels.length} canales disponibles)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Publicador de Daily de Avances */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Publicar Daily de Avances</h3>
                  <p className="text-[11px] text-zinc-400">
                    Genera y envía automáticamente el resumen de commits de GitHub a Slack.
                  </p>
                </div>
              </div>

              {dailySuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{dailySuccessMsg}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Rama de GitHub a incluir en el daily:
                  </label>
                  <div className="flex items-center gap-2">
                    {['main', 'testing', 'dev'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setDailyBranch(b)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all text-xs ${
                          dailyBranch === b
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Nota o anuncio del Tech Lead (Opcional):
                  </label>
                  <input
                    type="text"
                    value={dailyCustomNote}
                    onChange={(e) => setDailyCustomNote(e.target.value)}
                    placeholder="Ej: Recuerden probar la sincronización de facturación antes del deploy"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <span className="font-bold text-zinc-300 block">Estructura automática del mensaje:</span>
                  <p>• Título con fecha y rama analizada</p>
                  <p>• Features implementadas con enlace directo al commit</p>
                  <p>• Bug Fixes resueltos y autores involucrados</p>
                </div>

                <button
                  onClick={handleSendDaily}
                  disabled={isSendingDaily}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSendingDaily ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Publicar Daily en #{slackChannels.find((c) => c.id === selectedSlackChannel)?.name || 'canal'}</span>
                </button>
              </div>
            </div>

            {/* Card 2: Notificador de Bug Fix */}
            <form
              onSubmit={handleSendBugFix}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Notificar Fix de Bug</h3>
                  <p className="text-[11px] text-zinc-400">
                    Avisa al canal del equipo sobre una corrección desplegada o lista para testing.
                  </p>
                </div>
              </div>

              {bugSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{bugSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Repositorio:</label>
                    <select
                      value={bugRepo}
                      onChange={(e) => setBugRepo(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono"
                    >
                      <option value="atom-crm-api">atom-crm-api</option>
                      <option value="atom-crm-front">atom-crm-front</option>
                      <option value="trascendencia">trascendencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-zinc-300 block mb-1">Commit SHA (opcional):</label>
                    <input
                      type="text"
                      value={bugSha}
                      onChange={(e) => setBugSha(e.target.value)}
                      placeholder="Ej: cdcc91e"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Título del Bug Fix: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder="Ej: Corrección de error 500 al sincronizar productos de ML"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Detalle de la resolución:</label>
                  <textarea
                    rows={2}
                    value={bugDesc}
                    onChange={(e) => setBugDesc(e.target.value)}
                    placeholder="Se ajustaron los headers de autenticación del webhook y timeout."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingBug || !bugTitle.trim()}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {isSendingBug ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bug className="w-4 h-4" />
                  )}
                  <span>Enviar Notificación de Bug a Slack</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Mensaje Libre a Slack */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                <SendHorizontal className="w-4 h-4 text-indigo-400" />
                Mensaje Rápido / Anuncio Libre a Slack
              </h3>
              {freeTextSuccess && (
                <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {freeTextSuccess}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={`Escribe un mensaje para #${slackChannels.find((c) => c.id === selectedSlackChannel)?.name || 'canal'}...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendFreeText();
                }}
              />
              <button
                onClick={handleSendFreeText}
                disabled={isSendingFreeText || !freeText.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {isSendingFreeText ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Enviar</span>
              </button>
            </div>
          </div>

          {/* Guía de Configuración de Slack */}
          {!slackStatus?.configured && (
            <div className="p-5 rounded-3xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-2">
              <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Cómo conectar tu bot de Slack oficial:
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Actualmente la plataforma opera con canales y mensajes simulados. Para conectar tu workspace en vivo:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                <li>Ve a <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-semibold">api.slack.com/apps</a> y crea una app ("Atom Bot").</li>
                <li>En <strong>OAuth & Permissions</strong>, agrega los scopes: <code className="text-indigo-300">channels:read</code>, <code className="text-indigo-300">chat:write</code> y <code className="text-indigo-300">chat:write.public</code>.</li>
                <li>Instala la app en tu workspace y copia el <strong>Bot User OAuth Token</strong> (<code className="text-emerald-400">xoxb-...</code>).</li>
                <li>Pégalo en <code className="text-emerald-400">backend/.env</code> como <code className="text-emerald-400">SLACK_BOT_TOKEN="xoxb-..."</code> y reinicia.</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SECCIÓN TRELLO HUB */}
      {/* ========================================================= */}
      {activeSubTab === 'trello' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario para Levantar Tarea en Trello */}
            <form
              onSubmit={handleCreateTrelloCard}
              className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <TrelloIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Levantar Nueva Tarea en Trello</h3>
                  <p className="text-[11px] text-zinc-400">
                    Crea una tarjeta en tu tablero de gestión y sincroniza el aviso con Slack.
                  </p>
                </div>
              </div>

              {/* Selectores de Tablero y Columna */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Tablero de Trello:
                  </label>
                  <select
                    value={selectedTrelloBoardId}
                    onChange={(e) => handleTrelloBoardChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-blue-500"
                  >
                    {trelloBoards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <TrelloIcon className="w-3.5 h-3.5 text-blue-400" />
                    Columna / Lista de destino:
                  </label>
                  <select
                    value={selectedTrelloListId}
                    onChange={(e) => setSelectedTrelloListId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-blue-500"
                  >
                    {trelloLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Título de la tarjeta */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">
                  Título de la Tarea: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={trelloCardTitle}
                  onChange={(e) => setTrelloCardTitle(e.target.value)}
                  placeholder="Ej: Implementar endpoint de reportes semanales"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">Detalles de la Tarea (Markdown):</label>
                <textarea
                  rows={4}
                  value={trelloCardDesc}
                  onChange={(e) => setTrelloCardDesc(e.target.value)}
                  placeholder="Describe los requerimientos técnicos, repositorio, dependencias o criterios de aceptación..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono resize-none leading-relaxed focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Fecha y Notificación Slack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">Fecha Límite (Due Date):</label>
                  <input
                    type="date"
                    value={trelloCardDue}
                    onChange={(e) => setTrelloCardDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none mt-4">
                    <input
                      type="checkbox"
                      checked={trelloNotifySlack}
                      onChange={(e) => setTrelloNotifySlack(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-bold text-zinc-300 text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      Notificar a Slack al crear
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingCard || !trelloCardTitle.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {isCreatingCard ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TrelloIcon className="w-4 h-4" />
                )}
                <span>Levantar Tarjeta en Trello</span>
              </button>
            </form>

            {/* Panel Lateral: Tarjetas Creadas Recientemente */}
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs shadow-sm">
              <h4 className="font-bold text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Tarjetas Levantadas en esta Sesión
              </h4>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {createdTrelloCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-zinc-100 text-xs truncate">{card.name}</h5>
                      <a
                        href={card.url || card.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex-shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    {card.desc && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{card.desc}</p>
                    )}
                    <span className="text-[10px] text-zinc-500 block">
                      {card.simulated ? '⚡ Modo Demostración' : '✓ Creada en Trello'}
                    </span>
                  </div>
                ))}

                {createdTrelloCards.length === 0 && (
                  <p className="text-zinc-500 text-xs py-8 text-center">
                    Aún no has levantado tarjetas en esta sesión.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guía de Configuración de Trello */}
          {!trelloStatus?.configured && (
            <div className="p-5 rounded-3xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 space-y-2">
              <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                Cómo conectar tu cuenta de Trello:
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Actualmente se muestran tableros y columnas de demostración. Para conectar tus tableros reales de Trello:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300">
                <li>Inicia sesión en Trello y visita <a href="https://trello.com/power-ups/admin" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold">trello.com/power-ups/admin</a>.</li>
                <li>Crea un Power-Up o API Key nueva y copia tu <strong>API Key</strong>.</li>
                <li>En esa misma pantalla, haz clic en el enlace para generar tu <strong>Token</strong> de acceso personal.</li>
                <li>Agrega en <code className="text-emerald-400">backend/.env</code>:
                  <div className="mt-1 p-2 rounded-xl bg-zinc-950 font-mono text-[11px] text-emerald-400 border border-zinc-800">
                    TRELLO_API_KEY="tu_key_aqui"<br />
                    TRELLO_TOKEN="tu_token_aqui"
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SECCIÓN CORREO PLESK (MAILING UNIVERSAL SIN WEBMAIL) */}
      {/* ========================================================= */}
      {activeSubTab === 'mail' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Banner de Servidor Universal Plesk */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-purple-950/40 via-zinc-900/60 to-indigo-950/40 border border-purple-500/20 text-xs shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-zinc-100">Servidor de Correo Corporativo Plesk</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {mailStatus?.host || 'mail.atomsolucionesit.com.ar'}:{mailStatus?.port || 465} (SSL/TLS)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Configuración universal (Host DNS directo): cada usuario envía y recibe desde su propia casilla sin intermediación de proxy.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap bg-zinc-950/50 px-3 py-2 rounded-2xl border border-zinc-800/80">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>IMAP: <strong>{mailStatus?.imapPort || 993}</strong> | POP3: <strong>{mailStatus?.pop3Port || 995}</strong></span>
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Remitente: <strong className="text-zinc-200">{currentMember?.name}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Sub-barra de Correo: Redactar / Bandeja de Entrada / Enviados */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMailSubView('compose')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mailSubView === 'compose'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Redactar Correo</span>
              </button>

              <button
                onClick={() => setMailSubView('inbox')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mailSubView === 'inbox'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Bandeja de Entrada ({userEmails.received.length})</span>
              </button>

              <button
                onClick={() => setMailSubView('sent')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  mailSubView === 'sent'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>Enviados ({userEmails.sent.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-zinc-500">
              Casilla de salida: <strong className="text-purple-300">{currentMember?.email}</strong>
            </span>
          </div>

          {/* VISTA 1: REDACTAR CORREO */}
          {mailSubView === 'compose' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form
                onSubmit={handleSendEmail}
                className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs shadow-sm"
              >
                {/* Selector Rápido de Plantillas */}
                <div>
                  <label className="font-semibold text-zinc-300 block mb-2">Plantillas Rápidas Operativas & Comerciales:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTemplateChange('ausencia')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        emailTemplate === 'ausencia'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-amber-500/30'
                      }`}
                    >
                      <Palmtree className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate text-[11px]">🏖️ Ausencias / Vacaciones</span>
                        <span className="text-[9px] text-zinc-500 block truncate">Permisos y coberturas</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('presencia')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        emailTemplate === 'presencia'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-emerald-500/30'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate text-[11px]">🟢 Presencias / Guardias</span>
                        <span className="text-[9px] text-zinc-500 block truncate">Disponibilidad activa</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('lead')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        emailTemplate === 'lead'
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-indigo-500/30'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate text-[11px]">💼 Clientes & Leads</span>
                        <span className="text-[9px] text-zinc-500 block truncate">Propuestas comerciales</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('tecnico')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        emailTemplate === 'tecnico'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-blue-500/30'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate text-[11px]">🛠️ Avisos Técnicos</span>
                        <span className="text-[9px] text-zinc-500 block truncate">Releases y sprints</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('bug')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        emailTemplate === 'bug'
                          ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-red-500/30'
                      }`}
                    >
                      <Bug className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate text-[11px]">🐛 Alertas de Bug</span>
                        <span className="text-[9px] text-zinc-500 block truncate">Incidentes y fixes</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTemplateChange('custom')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        emailTemplate === 'custom'
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-xs'
                          : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-purple-500/30'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold block truncate text-[11px]">✍️ Mensaje Libre</span>
                        <span className="text-[9px] text-zinc-500 block truncate">Redacción personalizada</span>
                      </div>
                    </button>
                  </div>
                </div>

                {emailSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    <span className="font-medium">{emailSuccessMsg}</span>
                  </div>
                )}

                {emailErrorMsg && (
                  <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span className="font-medium">{emailErrorMsg}</span>
                  </div>
                )}

                {/* Selector de Destinatario: Interno vs Cliente Externo */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-zinc-300">Tipo de Destinatario:</label>
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setRecipientType('team')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                          recipientType === 'team'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Compañero de Equipo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientType('external')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                          recipientType === 'external'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Cliente / Lead Externo</span>
                      </button>
                    </div>
                  </div>

                  {recipientType === 'team' ? (
                    <div className="space-y-1 pt-1">
                      <select
                        value={emailRecipientId}
                        onChange={(e) => setEmailRecipientId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500"
                        required
                      >
                        {team
                          .filter((m) => m.id !== currentMember?.id)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} — {m.email} ({m.title || m.role})
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-medium">Correo Electrónico:</label>
                        <div className="relative">
                          <AtSign className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                          <input
                            type="email"
                            value={emailExternalAddress}
                            onChange={(e) => setEmailExternalAddress(e.target.value)}
                            placeholder="cliente@empresa.com"
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400 font-medium">Nombre / Empresa:</label>
                        <input
                          type="text"
                          value={emailExternalName}
                          onChange={(e) => setEmailExternalName(e.target.value)}
                          placeholder="Ej: Acero del Plata SA / Juan Pérez"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Asunto */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Asunto:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Ej: [Ausencia] Solicitud de vacaciones o [Lead] Propuesta comercial"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-hidden focus:border-purple-500 font-medium"
                    required
                  />
                </div>

                {/* Mensaje */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300">Contenido del Correo:</label>
                  <textarea
                    rows={7}
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Redacta los detalles del aviso, propuesta o solicitud..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs leading-relaxed resize-none focus:outline-hidden focus:border-purple-500 font-sans"
                    required
                  />
                </div>

                {/* Integración opcional con Slack & Contraseña de Casilla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800/80">
                  {/* Replicar en Slack */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={emailNotifySlack}
                        onChange={(e) => setEmailNotifySlack(e.target.checked)}
                        className="rounded-md border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        Replicar aviso a canal de Slack
                      </span>
                    </label>

                    {emailNotifySlack && (
                      <select
                        value={emailSlackChannel}
                        onChange={(e) => setEmailSlackChannel(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
                      >
                        {slackChannels.map((c) => (
                          <option key={c.id} value={c.id}>
                            #{c.name} {c.is_private ? '🔒' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Contraseña de casilla (Opcional / Cifrada) */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-purple-400" />
                      Contraseña Plesk (opcional si ya iniciaste sesión):
                    </label>
                    <input
                      type="password"
                      value={emailMailPassword}
                      onChange={(e) => setEmailMailPassword(e.target.value)}
                      placeholder="Usa tu pass de login automáticamente"
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Barra de Envío */}
                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Despacho seguro con credenciales de <strong>{currentMember?.email}</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmail || !emailSubject.trim() || !emailContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center gap-2 shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingEmail ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isSendingEmail ? 'Despachando...' : 'Enviar Correo'}</span>
                  </button>
                </div>
              </form>

              {/* Panel Informativo / Directorio de Correos Corporativos */}
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="font-bold text-zinc-200 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      Directorio de Casillas Plesk
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {team.length} cuentas
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Casillas corporativas del dominio <code className="text-purple-300">atomsolucionesit.com.ar</code> configuradas en Plesk:
                  </p>

                  <div className="space-y-2.5">
                    {team.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (m.id !== currentMember?.id) {
                            setRecipientType('team');
                            setEmailRecipientId(m.id);
                            setMailSubView('compose');
                          }
                        }}
                        className={`p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-2 transition-all ${
                          m.id !== currentMember?.id ? 'hover:border-purple-500/50 cursor-pointer group' : 'opacity-80'
                        }`}
                        title={m.id !== currentMember?.id ? `Clic para redactar correo a ${m.name}` : 'Tu cuenta actual'}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-200 block truncate group-hover:text-purple-300">
                              {m.name}
                            </span>
                            {m.id === currentMember?.id && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Tú</span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono block truncate">{m.email}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 flex-shrink-0">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200/90 mt-4 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Comunicación Unificada</span>
                  </div>
                  <p className="text-zinc-400 leading-normal">
                    Todos los mensajes enviados generan copia de respaldo en la base de datos interna y se despachan por el servidor SMTP seguro para que lleguen a cualquier casilla externa o interna.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 2: BANDEJA DE ENTRADA */}
          {mailSubView === 'inbox' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-zinc-100">
                    Mensajes Recibidos para {currentMember?.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                    {userEmails.received.length}
                  </span>
                </div>
                <button
                  onClick={loadUserEmails}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>

              <div className="space-y-3">
                {userEmails.received.map((mail) => {
                  const typeBadges: Record<string, { label: string; color: string }> = {
                    AUSENCIA: { label: '🏖️ Ausencia', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                    PRESENCIA: { label: '🟢 Presencia', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    LEAD_CONTACT: { label: '💼 Cliente/Lead', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                    TECNICO: { label: '🛠️ Técnico', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                    BUG_ALERT: { label: '🐛 Bug', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                    GENERAL: { label: '📢 General', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                  };
                  const badge = typeBadges[mail.type] || typeBadges.GENERAL;

                  return (
                    <div
                      key={mail.id}
                      className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5 hover:border-zinc-700/80 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-500/30">
                            {mail.sender?.name?.substring(0, 2).toUpperCase() || 'DE'}
                          </div>
                          <div>
                            <span className="font-bold text-zinc-200">{mail.sender?.name}</span>
                            <span className="text-[11px] text-zinc-400 ml-2 font-mono">({mail.sender?.email})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-zinc-500">{formatDate(mail.createdAt)}</span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-2">
                        <h4 className="text-xs font-bold text-indigo-300 mb-1">{mail.subject}</h4>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                          {mail.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                        <span>
                          {mail.smtpSent
                            ? '✓ Entregado vía Plesk SMTP (465 SSL)'
                            : 'ℹ️ Registrado en bandeja de Atom Studio'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {userEmails.received.length === 0 && (
                  <div className="text-center py-12 space-y-2">
                    <Inbox className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-400 text-xs font-medium">No tienes mensajes recibidos en tu casilla.</p>
                    <p className="text-zinc-600 text-[11px]">Los correos dirigidos a tu cuenta aparecerán aquí.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA 3: BANDEJA DE ENVIADOS */}
          {mailSubView === 'sent' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <SendHorizontal className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-zinc-100">
                    Mensajes Enviados por {currentMember?.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                    {userEmails.sent.length}
                  </span>
                </div>
                <button
                  onClick={loadUserEmails}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>

              <div className="space-y-3">
                {userEmails.sent.map((mail) => {
                  const typeBadges: Record<string, { label: string; color: string }> = {
                    AUSENCIA: { label: '🏖️ Ausencia', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                    PRESENCIA: { label: '🟢 Presencia', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    LEAD_CONTACT: { label: '💼 Cliente/Lead', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                    TECNICO: { label: '🛠️ Técnico', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                    BUG_ALERT: { label: '🐛 Bug', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                    GENERAL: { label: '📢 General', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                  };
                  const badge = typeBadges[mail.type] || typeBadges.GENERAL;

                  const recipientDisplayName =
                    mail.recipient?.name || mail.recipientName || mail.recipientEmail || 'Destinatario';
                  const recipientDisplayEmail =
                    mail.recipient?.email || mail.recipientEmail || '';

                  return (
                    <div
                      key={mail.id}
                      className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5 hover:border-zinc-700/80 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-medium">Para:</span>
                          <span className="font-bold text-zinc-200">{recipientDisplayName}</span>
                          {recipientDisplayEmail && (
                            <span className="text-[11px] text-zinc-400 font-mono">({recipientDisplayEmail})</span>
                          )}
                          {!mail.recipientId && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                              Externo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-zinc-500">{formatDate(mail.createdAt)}</span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-800/60 pt-2">
                        <h4 className="text-xs font-bold text-purple-300 mb-1">{mail.subject}</h4>
                        <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                          {mail.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          {mail.smtpSent ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-emerald-400/90 font-medium">Despachado vía servidor Plesk SMTP (465 SSL)</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>Registrado en Atom Studio</span>
                            </>
                          )}
                        </span>
                        {mail.smtpMessageId && (
                          <span className="font-mono text-[9px] text-zinc-600 truncate max-w-[200px]">ID: {mail.smtpMessageId}</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {userEmails.sent.length === 0 && (
                  <div className="text-center py-12 space-y-2">
                    <SendHorizontal className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-zinc-400 text-xs font-medium">No has enviado mensajes desde la plataforma todavía.</p>
                    <p className="text-zinc-600 text-[11px]">Usa la pestaña Redactar para enviar correos internos o a clientes.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
