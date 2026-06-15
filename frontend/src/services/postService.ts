import { Post } from '@/types';
import { get, post, del } from './request';

export const postService = {
  getPosts: async (type?: string): Promise<Post[]> => {
    return get('/posts', { type });
  },

  getPost: async (id: string): Promise<Post> => {
    return get(`/posts/${id}`);
  },

  createPost: async (data: Partial<Post>): Promise<Post> => {
    return post('/posts', data);
  },

  deletePost: async (id: string): Promise<void> => {
    return del(`/posts/${id}`);
  },

  addComment: async (postId: string, content: string): Promise<void> => {
    return post(`/posts/${postId}/comments`, { content });
  },

  toggleLike: async (postId: string): Promise<{ liked: boolean }> => {
    return post(`/posts/${postId}/likes`);
  },
};
