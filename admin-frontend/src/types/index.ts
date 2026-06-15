export interface Admin {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  openid: string;
  nickname: string;
  avatar?: string;
  city?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plant {
  id: string;
  plantCode: string;
  name: string;
  species: string;
  source: string;
  generation: number;
  wanderCount: number;
  status: 'ACTIVE' | 'ADOPTED' | 'DEAD';
  currentOwnerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  type: 'DAILY' | 'GROWTH' | 'WANDER' | 'TRADE';
  createdAt: string;
}

export interface Trade {
  id: string;
  plantId: string;
  ownerId: string;
  receiverId: string;
  type: 'EXCHANGE' | 'ADOPT' | 'FREE';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'IGNORED';
  createdAt: string;
}

export interface DashboardStats {
  userCount: number;
  plantCount: number;
  postCount: number;
  tradeCount: number;
  pendingReportCount: number;
}
