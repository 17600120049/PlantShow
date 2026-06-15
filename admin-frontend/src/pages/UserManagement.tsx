import { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { User } from '../types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    setUsers(data.users);
    setLoading(false);
  };

  const handleDelete = async (userId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        fetchUsers();
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '城市', dataIndex: 'city', key: 'city' },
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
      <h1 style={{ color: '#fff', marginBottom: 24, fontSize: 24 }}>用户管理</h1>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}
      />
    </div>
  );
}
