export type AssetType = 'PHOTO' | 'VIDEO' | 'SCREENSHOT' | 'NOTE';
export type AssetStatus = 'UNUSED' | 'USED' | 'ARCHIVED';

export interface RawAsset {
  id: string;
  type: AssetType;
  originalFilename?: string | null;
  mimeType?: string | null;
  driveFileId?: string | null;
  driveViewUrl?: string | null;
  driveThumbnailUrl?: string | null;
  localPath?: string | null;
  noteContent: string;
  technicalDetails?: string | null;
  tags: string;
  status: AssetStatus;
  uploadedById?: string | null;
  createdAt: string;
}

export type SlideType = 'HOOK' | 'CONTEXT' | 'PROBLEM' | 'SOLUTION' | 'STATS' | 'CTA';

export interface Slide {
  id: string;
  publicationId: string;
  orderIndex: number;
  slideType: SlideType;
  headerText: string;
  bodyText: string;
  imageSource: 'RAW_ASSET' | 'AI_GENERATED' | 'NONE';
  rawAssetId?: string | null;
  aiPrompt?: string | null;
  imageUrl?: string | null;
  layoutConfig?: string | null;
  createdAt: string;
}

export type PlatformType = 'LINKEDIN' | 'INSTAGRAM' | 'X';

export interface PublicationCopy {
  id: string;
  publicationId: string;
  platform: PlatformType;
  hook: string;
  body: string;
  cta: string;
  hashtags?: string | null;
  tone: string;
  createdAt: string;
  updatedAt: string;
}

export type PublicationStatus = 'DRAFT' | 'IN_REVIEW' | 'READY' | 'PUBLISHED';

export interface Publication {
  id: string;
  title: string;
  concept: string;
  status: PublicationStatus;
  scheduledFor?: string | null;
  publishedAt?: string | null;
  brandProfileId?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
  copies: PublicationCopy[];
  assets?: {
    rawAsset: RawAsset;
  }[];
  brandProfile?: BrandProfile;
}

export interface BrandProfile {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  toneVoice: string;
  targetAudience: string;
  visualStyle: string;
  referenceExamples?: string | null;
}

export interface CadenceHealth {
  daysSinceLastPost: number;
  lastPublishedDate?: string | null;
  unusedAssetsCount: number;
  draftsCount: number;
  readyCount: number;
  needsNudge: boolean;
  suggestionMessage: string;
  topUnusedAssets: RawAsset[];
}

export type UserRole = 'ADMIN' | 'MARKETING' | 'DEVELOPER';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  title?: string;
  password?: string;
  active?: boolean;
  _count?: {
    rawAssets: number;
    publications: number;
  };
}

export interface LoginAuditLog {
  id: string;
  userId?: string | null;
  email: string;
  role?: string | null;
  status: 'SUCCESS' | 'FAILED';
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    name: string;
    title?: string | null;
    avatar?: string | null;
  } | null;
}

export interface RoleConfigItem {
  key: UserRole;
  label: string;
  badgeColor: string;
  description: string;
  allowedUploads: string[];
  permissions: {
    canManageUsers: boolean;
    canEditBrand: boolean;
    canPublish: boolean;
    canGenerateCarousels: boolean;
    canUploadDevLogs: boolean;
    canUploadMedia: boolean;
  };
}

export interface GithubAuthor {
  name: string;
  email: string;
  login?: string;
  avatar_url?: string;
  html_url?: string;
}

export interface GithubCommit {
  sha: string;
  shortSha: string;
  message: string;
  date: string;
  repo: string;
  repoFullName: string;
  branch?: string;
  html_url: string;
  author: GithubAuthor;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  language: string | null;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
}

export interface GithubStatus {
  configured: boolean;
  org: string;
  orgName?: string;
  avatar_url?: string;
  html_url?: string;
  public_repos?: number;
  total_private_repos?: number;
  authenticatedUser?: {
    login: string;
    name: string;
    avatar_url: string;
  } | null;
  rateLimitRemaining?: string;
  status: 'CONNECTED' | 'ERROR';
  message: string;
}

export interface WeeklyBucket {
  weekLabel: string;
  startDate: string;
  endDate: string;
  count: number;
}

export interface DeveloperWeeklyStats {
  authorKey: string;
  name: string;
  login?: string;
  avatar_url?: string;
  html_url?: string;
  totalCommits: number;
  thisWeekCommits: number;
  lastWeekCommits: number;
  trendPercentage: number | null;
  weeklyBuckets: WeeklyBucket[];
  types: {
    feat: number;
    fix: number;
    refactor: number;
    devops: number;
    other: number;
  };
  repos: { repo: string; count: number }[];
  latestCommit: {
    sha: string;
    shortSha: string;
    message: string;
    date: string;
    repo: string;
    html_url: string;
  } | null;
}

export interface TeamPerformanceSummary {
  selectedBranch?: string;
  totalCommitsPeriod: number;
  totalCommitsThisWeek: number;
  totalCommitsLastWeek: number;
  teamVelocityTrend: number | null;
  activeDevelopersCount: number;
  topContributor: {
    name: string;
    login?: string;
    avatar_url?: string;
    commitsThisWeek: number;
  } | null;
  typeDistribution: {
    feat: number;
    fix: number;
    refactor: number;
    devops: number;
    other: number;
  };
  weeks: string[];
  weeklyTeamTrend: { weekLabel: string; count: number }[];
  developers: DeveloperWeeklyStats[];
}

// --- Integraciones: Slack ---
export interface SlackStatus {
  configured: boolean;
  team?: string;
  user?: string;
  botId?: string;
  url?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  message: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  topic?: string;
  purpose?: string;
  num_members?: number;
}

// --- Integraciones: Trello ---
export interface TrelloStatus {
  configured: boolean;
  username?: string;
  fullName?: string;
  url?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  message: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
  desc?: string;
  url: string;
  closed?: boolean;
}

export interface TrelloList {
  id: string;
  name: string;
  idBoard: string;
}

export interface TrelloCardPayload {
  idList: string;
  name: string;
  desc?: string;
  due?: string;
  notifySlackChannel?: string;
}

// --- Integraciones: Correo Plesk & Mensajería Interna ---
export interface MailStatus {
  configured: boolean;
  host: string;
  port: number;
  secure?: boolean;
  imapHost?: string;
  imapPort?: number;
  pop3Host?: string;
  pop3Port?: number;
  totalSent?: number;
  totalInternalUsers?: number;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  message: string;
}

export interface InternalEmailItem {
  id: string;
  senderId: string;
  recipientId?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  subject: string;
  content: string;
  type: string;
  smtpSent: boolean;
  smtpMessageId?: string | null;
  smtpError?: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    title: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    title: string;
  } | null;
}

export interface SendEmailPayload {
  senderId: string;
  recipientId?: string;
  recipientEmail?: string;
  recipientName?: string;
  subject: string;
  content: string;
  type?: string;
  mailPassword?: string;
  notifySlackChannel?: string;
}

export type SlackEventType = 'ASSET_UPLOADED' | 'COMMIT_SHARED' | 'PUBLICATION_READY' | 'CUSTOM_ANNOUNCEMENT';

export interface SlackNotifyPayload {
  channel: string;
  eventType: SlackEventType;
  title: string;
  detail?: string;
  link?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
