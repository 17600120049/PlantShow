import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Trade } from '../types';

export default function TradeManagement() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    const response = await fetch('/api/trades');
    const data = await response.json();
    setTrades(data);
    setLoading(false);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '植物ID', dataIndex: 'plantId', key: 'plantId', width: 100 },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '完成时间', dataIndex: 'completedAt', key: 'completedAt' },
  ];

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: 24, fontSize: 24 }}>交换管理</h1>
      <Table
        columns={columns}
        dataSource={trades}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}
      />
    </div>
  );
}
