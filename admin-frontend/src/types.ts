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
  managedStationId: number | null;
  managedStationName: string | null;
  createdAt: string;
}

export type ContactType = 'PHONE' | 'WECHAT';

export interface Station {
  id: number;
  stationCode: string;
  name: string;
  address: string;
  hours: string;
  hoursMode: 'FIXED' | 'FLEXIBLE';
  contactType: ContactType;
  phone: string | null;
  imageEmoji?: string;
  logoUrl: string | null;
  image?: string | null;
  plants: number;
  isActive: boolean;
  isFlexibleHours?: boolean;
}

export interface StationApplication {
  id: string;
  applicantName: string;
  phone: string;
  stationName: string;
  address: string;
  hours: string | null;
  intro: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  userId: string | null;
  userNickname: string | null;
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
