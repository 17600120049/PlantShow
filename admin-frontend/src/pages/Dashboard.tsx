import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) {
    return <div style={{ color: '#fff' }}>加载中...</div>;
  }

  const statCards = [
    { title: '总用户数', value: stats.userCount, icon: '👥', color: '#4CAF50' },
    { title: '植物总数', value: stats.plantCount, icon: '🌱', color: '#81C784' },
    { title: '动态总数', value: stats.postCount, icon: '📸', color: '#64B5F6' },
    { title: '交换次数', value: stats.tradeCount, icon: '🤝', color: '#FFB74D' },
    { title: '待处理举报', value: stats.pendingReportCount, icon: '⚠️', color: '#EF5350' },
  ];

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: 24, fontSize: 24 }}>数据看板</h1>
      <Row gutter={16}>
        {statCards.map((stat, index) => (
          <Col span={6} key={index}>
            <Card className="stat-card" style={{ color: '#fff' }}>
              <Statistic
                title={
                  <span>
                    {stat.icon} {stat.title}
                  </span>
                }
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: 32 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
