import { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { Post } from '../types';

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/posts');
    const data = await response.json();
    setPosts(data.posts);
    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该动态吗？',
      onOk: async () => {
        await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
        fetchPosts();
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type' },
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
      <h1 style={{ color: '#fff', marginBottom: 24, fontSize: 24 }}>动态管理</h1>
      <Table
        columns={columns}
        dataSource={posts}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}
      />
    </div>
  );
}
