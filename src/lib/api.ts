import {
  RawAsset,
  Publication,
  BrandProfile,
  CadenceHealth,
  TeamMember,
  Slide,
  PublicationCopy,
  GithubRepo,
  GithubCommit,
  GithubStatus,
  TeamPerformanceSummary,
  SlackStatus,
  SlackChannel,
  TrelloStatus,
  TrelloBoard,
  TrelloList,
  TrelloCardPayload,
  MailStatus,
  InternalEmailItem,
  SendEmailPayload,
  SlackNotifyPayload,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = {
  // --- Assets ---
  async getAssets(params?: { tag?: string; status?: string; search?: string; type?: string }): Promise<RawAsset[]> {
    const searchParams = new URLSearchParams();
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);

    const res = await fetch(`${API_BASE}/assets?${searchParams.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar assets');
    return res.json();
  },

  async uploadAsset(formData: FormData): Promise<RawAsset> {
    const res = await fetch(`${API_BASE}/assets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Error al subir asset');
    return res.json();
  },

  async updateAssetStatus(id: string, status: string): Promise<RawAsset> {
    const res = await fetch(`${API_BASE}/assets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado del asset');
    return res.json();
  },

  async deleteAsset(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar asset');
  },

  async getTags(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/assets/tags`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar tags');
    return res.json();
  },

  // --- Publications & Carousels ---
  async generatePublication(dto: { rawAssetIds?: string[]; userPrompt?: string }): Promise<Publication> {
    const res = await fetch(`${API_BASE}/publications/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Error al generar publicación');
    return res.json();
  },

  async getPublications(status?: string): Promise<Publication[]> {
    const url = status && status !== 'ALL' ? `${API_BASE}/publications?status=${status}` : `${API_BASE}/publications`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar publicaciones');
    return res.json();
  },

  async getPublication(id: string): Promise<Publication> {
    const res = await fetch(`${API_BASE}/publications/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar publicación');
    return res.json();
  },

  async updatePublication(id: string, data: { title?: string; concept?: string; status?: string; scheduledFor?: string }): Promise<Publication> {
    const res = await fetch(`${API_BASE}/publications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar publicación');
    return res.json();
  },

  async updateSlide(pubId: string, slideId: string, data: Partial<Slide>): Promise<Slide> {
    const res = await fetch(`${API_BASE}/publications/${pubId}/slides/${slideId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar slide');
    return res.json();
  },

  async regenerateSlideImage(pubId: string, slideId: string): Promise<Slide> {
    const res = await fetch(`${API_BASE}/publications/${pubId}/slides/${slideId}/regenerate-image`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al regenerar imagen de slide');
    return res.json();
  },

  async updateCopy(pubId: string, copyId: string, data: Partial<PublicationCopy>): Promise<PublicationCopy> {
    const res = await fetch(`${API_BASE}/publications/${pubId}/copies/${copyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar copy');
    return res.json();
  },

  async publishPublication(id: string): Promise<Publication> {
    const res = await fetch(`${API_BASE}/publications/${id}/publish`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al marcar como publicada');
    return res.json();
  },

  async deletePublication(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/publications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar publicación');
  },

  // --- Cadence & Calendar ---
  async getCadenceHealth(): Promise<CadenceHealth> {
    const res = await fetch(`${API_BASE}/cadence/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener salud de cadencia');
    return res.json();
  },

  async getCalendarEvents(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/cadence/calendar`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener eventos de calendario');
    return res.json();
  },

  async autoGenerateFromCadence(): Promise<Publication> {
    const res = await fetch(`${API_BASE}/cadence/auto-generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al auto-generar desde cadencia');
    return res.json();
  },

  // --- Brand Profile ---
  async getBrandProfile(): Promise<BrandProfile> {
    const res = await fetch(`${API_BASE}/brand`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar perfil de marca');
    return res.json();
  },

  async updateBrandProfile(data: Partial<BrandProfile>): Promise<BrandProfile> {
    const res = await fetch(`${API_BASE}/brand`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar perfil de marca');
    return res.json();
  },

  // --- Team & Roles ---
  async getTeamMembers(): Promise<TeamMember[]> {
    const res = await fetch(`${API_BASE}/team`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar miembros del equipo');
    return res.json();
  },

  async createMember(data: { name: string; email: string; role: string; title?: string; avatar?: string }): Promise<TeamMember> {
    const res = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear miembro del equipo');
    }
    return res.json();
  },

  async updateMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const res = await fetch(`${API_BASE}/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar miembro del equipo');
    }
    return res.json();
  },

  async deleteMember(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/team/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar miembro del equipo');
  },

  async getRolesConfig(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/team/roles-config`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar configuración de roles');
    return res.json();
  },

  // --- Auth & Audit Logs ---
  async login(email: string, password: string): Promise<{ token: string; user: TeamMember }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Credenciales inválidas');
    }
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/audit-logs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar logs de auditoría');
    return res.json();
  },

  // --- Google Cloud (Drive & Sheets) ---
  async getGoogleStatus(): Promise<{
    drive: { configured: boolean; status: string; message: string; folderId: string | null; folderName?: string };
    sheets: { configured: boolean; status: string; message: string; spreadsheetId: string | null; title?: string };
    isFullyConnected: boolean;
  }> {
    const res = await fetch(`${API_BASE}/google/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener estado de Google Drive y Sheets');
    return res.json();
  },

  async syncGoogleSheets(): Promise<{ total: number; synced: number }> {
    const res = await fetch(`${API_BASE}/assets/sync-sheets`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al sincronizar con Google Sheets');
    return res.json();
  },

  async syncGoogleDrive(): Promise<{ totalPending: number; uploaded: number; errors: Array<{ id: string; error: string }> }> {
    const res = await fetch(`${API_BASE}/assets/sync-drive`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al sincronizar archivos con Google Drive');
    return res.json();
  },

  // --- GitHub Integration ---
  async getGithubStatus(): Promise<GithubStatus> {
    const res = await fetch(`${API_BASE}/github/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar estado de GitHub');
    return res.json();
  },

  async getGithubRepos(): Promise<GithubRepo[]> {
    const res = await fetch(`${API_BASE}/github/repos`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al listar repositorios de GitHub');
    return res.json();
  },

  async getGithubBranches(repo?: string): Promise<string[]> {
    const url = repo && repo !== 'ALL'
      ? `${API_BASE}/github/branches?repo=${encodeURIComponent(repo)}`
      : `${API_BASE}/github/branches`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return ['main', 'testing', 'dev'];
    return res.json();
  },

  async getGithubCommits(repo?: string, branch?: string, limit = 25): Promise<GithubCommit[]> {
    const params = new URLSearchParams();
    if (repo && repo !== 'ALL') params.append('repo', repo);
    if (branch && branch !== 'ALL') params.append('branch', branch);
    params.append('limit', limit.toString());
    const res = await fetch(`${API_BASE}/github/commits?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener commits de GitHub');
    return res.json();
  },

  async ingestGithubCommit(data: {
    repo: string;
    sha: string;
    message: string;
    html_url: string;
    authorName?: string;
    authorLogin?: string;
    userId?: string;
  }): Promise<RawAsset> {
    const res = await fetch(`${API_BASE}/github/ingest-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar commit en el banco de contenido');
    return res.json();
  },

  async getDeveloperPerformance(branch?: string): Promise<TeamPerformanceSummary> {
    const qs = branch && branch !== 'ALL' ? `?branch=${encodeURIComponent(branch)}` : '';
    const res = await fetch(`${API_BASE}/github/performance${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener analítica de rendimiento dev');
    return res.json();
  },

  // --- Slack Integration ---
  async getSlackStatus(): Promise<SlackStatus> {
    const res = await fetch(`${API_BASE}/slack/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar estado de Slack');
    return res.json();
  },

  async getSlackChannels(): Promise<SlackChannel[]> {
    const res = await fetch(`${API_BASE}/slack/channels`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al listar canales de Slack');
    return res.json();
  },

  async postSlackMessage(data: {
    channel: string;
    text: string;
    blocks?: any[];
    username?: string;
    icon_url?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/slack/post-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al publicar mensaje en Slack');
    return res.json();
  },

  async postSlackDaily(data: {
    channel: string;
    branch?: string;
    customNote?: string;
    authorName?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/slack/post-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al enviar daily a Slack');
    return res.json();
  },

  async postSlackBugFix(data: {
    channel: string;
    repo: string;
    title: string;
    description?: string;
    shortSha?: string;
    author?: string;
    html_url?: string;
    authorName?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/slack/post-bugfix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al notificar bugfix en Slack');
    return res.json();
  },

  async notifySlackActivity(data: SlackNotifyPayload): Promise<any> {
    const res = await fetch(`${API_BASE}/slack/notify-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al notificar actividad en Slack');
    }
    return res.json();
  },

  // --- Trello Integration ---
  async getTrelloStatus(): Promise<TrelloStatus> {
    const res = await fetch(`${API_BASE}/trello/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar estado de Trello');
    return res.json();
  },

  async getTrelloBoards(): Promise<TrelloBoard[]> {
    const res = await fetch(`${API_BASE}/trello/boards`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al listar tableros de Trello');
    return res.json();
  },

  async getTrelloBoardLists(boardId: string): Promise<TrelloList[]> {
    const res = await fetch(`${API_BASE}/trello/boards/${boardId}/lists`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al listar columnas de Trello');
    return res.json();
  },

  async createTrelloCard(data: TrelloCardPayload): Promise<any> {
    const res = await fetch(`${API_BASE}/trello/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear tarjeta en Trello');
    return res.json();
  },

  // --- Plesk Mail (Internal Mailing) ---
  async getMailStatus(): Promise<MailStatus> {
    const res = await fetch(`${API_BASE}/mail/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar estado de correo Plesk');
    return res.json();
  },

  async sendInternalEmail(data: SendEmailPayload): Promise<InternalEmailItem> {
    const res = await fetch(`${API_BASE}/mail/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al enviar correo vía Plesk');
    return res.json();
  },

  async getUserEmails(userId?: string): Promise<{ received: InternalEmailItem[]; sent: InternalEmailItem[] }> {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/mail/user-emails${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar correos');
    return res.json();
  },
};
