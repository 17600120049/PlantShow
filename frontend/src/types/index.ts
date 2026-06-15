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
  breederId: string;
  generation: number;
  wanderCount: number;
  status: 'ACTIVE' | 'ADOPTED' | 'DEAD';
  currentOwnerId: string;
  description?: string;
  owner?: User;
  breeder?: User;
  histories?: PlantHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface PlantHistory {
  id: string;
  plantId: string;
  ownerId: string;
  action: 'ADOPT' | 'GIFT' | 'TRADE' | 'WANDER';
  timestamp: string;
  note?: string;
  photoUrl?: string;
  owner?: User;
}

export interface Post {
  id: string;
  userId: string;
  plantId?: string;
  content: string;
  images?: string[];
  type: 'DAILY' | 'GROWTH' | 'WANDER' | 'TRADE';
  user?: User;
  plant?: Plant;
  comments?: Comment[];
  likes?: Like[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  user?: User;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  plantId: string;
  ownerId: string;
  receiverId: string;
  type: 'EXCHANGE' | 'ADOPT' | 'FREE';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  offerContent?: string;
  plant?: Plant;
  owner?: User;
  receiver?: User;
  createdAt: string;
  completedAt?: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessage?: string;
  unreadCount: number;
  user1?: User;
  user2?: User;
  messages?: Message[];
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE';
  sender?: User;
  createdAt: string;
}
