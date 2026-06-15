import { User } from '@/types';
import { get, post } from './request';

export const userService = {
  login: async (code: string): Promise<{ accessToken: string; user: User }> => {
    return post('/auth/login', { code });
  },

  getUser: async (id: string): Promise<User> => {
    return get(`/users/${id}`);
  },

  updateUser: async (data: Partial<User>): Promise<User> => {
    return post('/users/profile', data);
  },

  follow: async (userId: string): Promise<void> => {
    return post(`/users/${userId}/follow`);
  },

  unfollow: async (userId: string): Promise<void> => {
    return post(`/users/${userId}/unfollow`);
  },

  getFollowers: async (userId: string): Promise<User[]> => {
    return get(`/users/${userId}/followers`);
  },

  getFollowing: async (userId: string): Promise<User[]> => {
    return get(`/users/${userId}/following`);
  },
};
