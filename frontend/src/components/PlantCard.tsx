import { Plant } from '@/types';
import './PlantCard.scss';

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  return (
    <div className="plant-card">
      <div className="plant-image-wrapper">
        <img
          className="plant-image"
          src="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=beautiful%20green%20plant%20in%20pot%2C%20natural%20light%2C%20minimalist%20style&image_size=square"
          alt={plant.name}
        />
        <span className={`plant-tag ${plant.status === 'ACTIVE' ? 'active' : 'adopted'}`}>
          {plant.status === 'ACTIVE' ? '待领养' : '已领养'}
        </span>
      </div>
      <div className="plant-info">
        <div className="plant-header">
          <h3 className="plant-name">{plant.name}</h3>
          <span className="plant-code">{plant.plantCode}</span>
        </div>
        <p className="plant-species">{plant.species}</p>
        <div className="plant-meta">
          <span className="meta-item">📍 {plant.owner?.city || '未知'}</span>
          <span className="meta-item">🌱 代{plant.generation}</span>
        </div>
        <div className="plant-footer">
          <div className="plant-owner">
            <img className="owner-avatar" src={plant.owner?.avatar || ''} alt="" />
            <span className="owner-name">{plant.owner?.nickname}</span>
          </div>
          <button className="action-btn">交换</button>
        </div>
      </div>
    </div>
  );
}
