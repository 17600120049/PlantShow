import { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { Plant } from '../types';

export default function PlantManagement() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/plants');
    const data = await response.json();
    setPlants(data.plants);
    setLoading(false);
  };

  const handleDelete = async (plantId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该植物吗？',
      onOk: async () => {
        await fetch(`/api/admin/plants/${plantId}`, { method: 'DELETE' });
        fetchPlants();
      },
    });
  };

  const columns = [
    { title: '植物ID', dataIndex: 'plantCode', key: 'plantCode', width: 120 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '品种', dataIndex: 'species', key: 'species' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '流浪次数', dataIndex: 'wanderCount', key: 'wanderCount', width: 80 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: 24, fontSize: 24 }}>植物管理</h1>
      <Table
        columns={columns}
        dataSource={plants}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}
      />
    </div>
  );
}
