import { create } from 'zustand';
import { Post } from '@/types';
import { postService } from '@/services/postService';

interface PostStore {
  posts: Post[];
  fetchPosts: () => Promise<void>;
  createPost: (data: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  fetchPosts: async () => {
    try {
      const posts = await postService.getPosts();
      set({ posts });
    } catch (error) {
      console.error('Fetch posts failed:', error);
    }
  },
  createPost: async (data) => {
    try {
      const post = await postService.createPost(data);
      set((state) => ({ posts: [post, ...state.posts] }));
    } catch (error) {
      console.error('Create post failed:', error);
    }
  },
  deletePost: async (id) => {
    try {
      await postService.deletePost(id);
      set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Delete post failed:', error);
    }
  },
}));
