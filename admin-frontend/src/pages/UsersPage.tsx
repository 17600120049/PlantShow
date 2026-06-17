import { Button, Form, Input, InputNumber, Modal, Space, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { AdminUser } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [pointsUser, setPointsUser] = useState<AdminUser | null>(null);
  const [form] = Form.useForm();
  const [pointsForm] = Form.useForm();

  const load = async (search?: string) => {
    setLoading(true);
    try {
      setUsers(await api.getUsers(search));
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    form.setFieldsValue({ nickname: user.nickname, city: user.city, bio: user.bio });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    const values = await form.validateFields();
    try {
      await api.updateUser(editUser.id, values);
      message.success('已保存');
      setEditUser(null);
      load(keyword);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  const savePoints = async () => {
    if (!pointsUser) return;
    const values = await pointsForm.validateFields();
    try {
      await api.adjustPoints(pointsUser.id, values.delta, values.reason);
      message.success('积分已调整');
      setPointsUser(null);
      load(keyword);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '调整失败');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">用户管理</h2>
        <Space>
          <Input.Search
            placeholder="搜索昵称/OpenID"
            allowClear
            onSearch={(v) => {
              setKeyword(v);
              load(v);
            }}
            style={{ width: 260 }}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={users}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '昵称', dataIndex: 'nickname' },
          { title: 'OpenID', dataIndex: 'openid', ellipsis: true },
          { title: '城市', dataIndex: 'city' },
          { title: '积分', dataIndex: 'points' },
          { title: '植物数', dataIndex: 'plantCount' },
          {
            title: '注册时间',
            dataIndex: 'createdAt',
            render: (v: string) => new Date(v).toLocaleString(),
          },
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
                <Button size="small" onClick={() => { setPointsUser(record); pointsForm.resetFields(); }}>
                  调积分
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除该用户？',
                      onOk: async () => {
                        await api.deleteUser(record.id);
                        message.success('已删除');
                        load(keyword);
                      },
                    });
                  }}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal title="编辑用户" open={!!editUser} onOk={saveEdit} onCancel={() => setEditUser(null)}>
        <Form form={form} layout="vertical">
          <Form.Item name="nickname" label="昵称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label="城市">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="调整积分" open={!!pointsUser} onOk={savePoints} onCancel={() => setPointsUser(null)}>
        <Form form={pointsForm} layout="vertical">
          <Form.Item label="当前积分">
            <Input value={pointsUser?.points} disabled />
          </Form.Item>
          <Form.Item name="delta" label="变动值（正数增加，负数减少）" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="备注">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
