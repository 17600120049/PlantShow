export interface Admin {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';
}

export interface DashboardStats {
  userCount: number;
  stationCount: number;
  plantCount: number;
  availablePlants: number;
  totalPoints: number;
  donationCount: number;
  adoptionCount: number;
}

export interface AdminUser {
  id: string;
  openid: string;
  nickname: string;
  avatar: string | null;
  city: string | null;
  bio: string | null;
  points: number;
  plantCount: number;
  historyCount: number;
  createdAt: string;
}

export interface Station {
  id: number;
  stationCode: string;
  name: string;
  address: string;
  hours: string;
  phone: string | null;
  imageEmoji?: string;
  logoUrl: string | null;
  image?: string | null;
  plants: number;
  isActive: boolean;
}

export interface Plant {
  id: string;
  plantCode: string;
  name: string;
  category: string;
  status: string;
  image: string;
  photoUrl: string | null;
  photos: string[];
  station: string | null;
  stationId: number | null;
  ownerName: string;
  ownerId: string;
  listStatus: string;
  plantStatus: string;
  description: string;
  donateTime: string;
}
