import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => setStats(null));
  }, []);

  const items = [
    { title: '注册用户', value: stats?.userCount ?? 0 },
    { title: '驿站数量', value: stats?.stationCount ?? 0 },
    { title: '植物总数', value: stats?.plantCount ?? 0 },
    { title: '待领养', value: stats?.availablePlants ?? 0 },
    { title: '积分总量', value: stats?.totalPoints ?? 0 },
    { title: '累计送养', value: stats?.donationCount ?? 0 },
    { title: '累计领养', value: stats?.adoptionCount ?? 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">数据概览</h2>
      </div>
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={item.title}>
            <Card>
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
