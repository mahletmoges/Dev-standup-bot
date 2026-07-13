export interface User {
  _id: string;
  name: string;
  email: string;
  workspaceId: string | null;
  role: 'admin' | 'member';
  createdAt?: string;
}

export interface Workspace {
  _id: string;
  name: string;
  inviteCode: string;
  slackWebhookUrl?: string;
  notificationEmail?: string;
  members: User[];
  createdAt?: string;
}

export interface Standup {
  _id: string;
  userId: User | string;
  workspaceId: string;
  date: string;
  did: string;
  doing: string;
  blockers: string;
  createdAt?: string;
}

export interface WeeklyDigest {
  _id: string;
  workspaceId: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  blockerHighlights: string[];
  sentAt: string | null;
  sentVia: 'slack' | 'email' | 'both' | null;
  createdAt?: string;
}
