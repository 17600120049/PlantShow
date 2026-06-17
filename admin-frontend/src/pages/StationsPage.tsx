import { Button, Form, Input, Modal, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Station } from '../types';

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setStations(await api.getStations());
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setCreating(true);
    form.resetFields();
    form.setFieldsValue({ imageEmoji: '🏡' });
  };

  const openEdit = (station: Station) => {
    setEditing(station);
    form.setFieldsValue(station);
  };

  const save = async () => {
    const values = await form.validateFields();
    try {
      if (creating) {
        await api.createStation(values);
        message.success('驿站已创建');
        setCreating(false);
      } else if (editing) {
        await api.updateStation(editing.id, values);
        message.success('驿站已更新');
        setEditing(null);
      }
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">驿站管理</h2>
        <Button type="primary" onClick={openCreate}>新增驿站</Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={stations}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '编号', dataIndex: 'stationCode' },
          { title: '名称', render: (_, r) => `${r.imageEmoji || ''} ${r.name}` },
          { title: '地址', dataIndex: 'address', ellipsis: true },
          { title: '营业时间', dataIndex: 'hours' },
          { title: '电话', dataIndex: 'phone' },
          { title: '待领养', dataIndex: 'plants' },
          {
            title: '营业状态',
            dataIndex: 'isActive',
            render: (open: boolean) => (
              open ? <Tag color="green">营业中</Tag> : <Tag>休息中</Tag>
            ),
          },
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除该驿站？',
                      onOk: async () => {
                        await api.deleteStation(record.id);
                        message.success('已删除');
                        load();
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

      <Modal
        title={creating ? '新增驿站' : '编辑驿站'}
        open={creating || !!editing}
        onOk={save}
        onCancel={() => { setCreating(false); setEditing(null); }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stationCode" label="驿站编号" rules={[{ required: true }]}>
            <Input placeholder="ST-004" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="hours" label="营业时间" rules={[{ required: true }]} extra="营业状态将根据此时间自动计算">
            <Input placeholder="09:00-20:00" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="imageEmoji" label="图标 Emoji">
            <Input placeholder="🏡" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
