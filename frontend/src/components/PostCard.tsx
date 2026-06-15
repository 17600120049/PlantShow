import { Post } from '@/types';
import './PostCard.scss';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="post-card">
      <div className="post-image">
        <img
          src="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=plant%20growth%20progress%2C%20green%20leaves%2C%20nature&image_size=square"
          alt="post"
        />
      </div>
      <div className="post-content">
        <h3 className="post-title">{post.content.slice(0, 30)}...</h3>
        <div className="post-meta">
          <span className="meta-item">💬 {post.comments?.length || 0}</span>
          <span className="meta-item">❤️ {post.likes?.length || 0}</span>
        </div>
        <div className="post-author">
          <img className="author-avatar" src={post.user?.avatar || ''} alt="" />
          <span className="author-name">{post.user?.nickname}</span>
        </div>
      </div>
    </div>
  );
}
