import { useEffect } from 'react';
import { usePlantStore } from '@/store/plantStore';
import { usePostStore } from '@/store/postStore';
import PlantCard from '@/components/PlantCard';
import PostCard from '@/components/PostCard';
import './HomePage.scss';

export default function HomePage() {
  const { plants, fetchPlants } = usePlantStore();
  const { posts, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPlants();
    fetchPosts();
  }, []);

  return (
    <div className="page-container">
      <header className="header">
        <div className="location">
          <span className="location-icon">📍</span>
          <span className="location-text">杭州</span>
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">搜索植物、品种或用户</span>
        </div>
        <div className="notification">🔔</div>
      </header>

      <div className="banner">
        <div className="banner-item">
          <h2 className="banner-title">让每一株植物</h2>
          <p className="banner-subtitle">找到下一位主人</p>
          <button className="banner-btn">了解更多 →</button>
        </div>
      </div>

      <div className="nav-grid">
        <div className="nav-item">
          <span className="nav-icon">🌱</span>
          <span className="nav-text">流浪植物</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">📸</span>
          <span className="nav-text">植物动态</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">📋</span>
          <span className="nav-text">植物档案</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">🗺️</span>
          <span className="nav-text">植物地图</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">👥</span>
          <span className="nav-text">植物圈子</span>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <h3 className="section-title">推荐动态</h3>
          <span className="section-more">查看更多 →</span>
        </div>
        <div className="post-scroll">
          <div className="post-list">
            {posts.slice(0, 5).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3 className="section-title">最新流浪</h3>
          <span className="section-more">查看更多 →</span>
        </div>
        <div className="plant-list">
          {plants.slice(0, 3).map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </section>
    </div>
  );
}
