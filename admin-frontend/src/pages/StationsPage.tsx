import { Button, Form, Input, Modal, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import ImageUpload from '../components/ImageUpload';
import type { Station } from '../types';

function StationLogo({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={36}
        height={36}
        style={{ objectFit: 'cover', borderRadius: 6, marginRight: 8, verticalAlign: 'middle' }}
      />
    );
  }
  return null;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [creating, setCreating] = useState(false);
  const [qrStation, setQrStation] = useState<Station | null>(null);
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
    form.setFieldsValue({ logoUrl: '' });
  };

  const openEdit = (station: Station) => {
    setEditing(station);
    form.setFieldsValue({
      stationCode: station.stationCode,
      name: station.name,
      address: station.address,
      hours: station.hours,
      phone: station.phone,
      logoUrl: station.logoUrl || '',
    });
  };

  const save = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      logoUrl: values.logoUrl || null,
    };
    try {
      if (creating) {
        await api.createStation(payload);
        message.success('中转站已创建');
        setCreating(false);
      } else if (editing) {
        await api.updateStation(editing.id, payload);
        message.success('中转站已更新');
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
        <h2 className="page-title">中转站管理</h2>
        <Button type="primary" onClick={openCreate}>新增中转站</Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={stations}
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '编号', dataIndex: 'stationCode', width: 100 },
          {
            title: '名称',
            render: (_, r) => (
              <span>
                <StationLogo url={r.logoUrl} name={r.name} />
                {r.name}
              </span>
            ),
          },
          { title: '地址', dataIndex: 'address', ellipsis: true },
          { title: '营业时间', dataIndex: 'hours', width: 120 },
          { title: '电话', dataIndex: 'phone', width: 130 },
          { title: '待领养', dataIndex: 'plants', width: 80 },
          {
            title: '营业状态',
            dataIndex: 'isActive',
            width: 100,
            render: (open: boolean) => (
              open ? <Tag color="green">营业中</Tag> : <Tag>休息中</Tag>
            ),
          },
          {
            title: '二维码',
            width: 90,
            render: (_, record) => (
              <img
                src={api.getStationQrUrl(record.id, 80)}
                alt={`${record.name} 二维码`}
                width={64}
                height={64}
                style={{
                  cursor: 'pointer',
                  borderRadius: 6,
                  border: '1px solid #f0f0f0',
                  padding: 4,
                  background: '#fff',
                }}
                onClick={() => setQrStation(record)}
              />
            ),
          },
          {
            title: '操作',
            fixed: 'right',
            width: 200,
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => setQrStation(record)}>二维码</Button>
                <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除该中转站？',
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
        title={creating ? '新增中转站' : '编辑中转站'}
        open={creating || !!editing}
        onOk={save}
        onCancel={() => { setCreating(false); setEditing(null); }}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stationCode" label="中转站编号" rules={[{ required: true }]}>
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
          <Form.Item name="logoUrl" label="Logo">
            <ImageUpload label="上传中转站 Logo" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={qrStation ? `${qrStation.name} · 中转站二维码` : '中转站二维码'}
        open={!!qrStation}
        onCancel={() => setQrStation(null)}
        footer={[
          <Button key="close" onClick={() => setQrStation(null)}>关闭</Button>,
          qrStation ? (
            <Button
              key="download"
              type="primary"
              href={api.getStationQrUrl(qrStation.id, 512)}
              download={`station-${qrStation.stationCode}-qr.png`}
            >
              下载二维码
            </Button>
          ) : null,
        ]}
        width={400}
      >
        {qrStation && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            {qrStation.logoUrl && (
              <img
                src={qrStation.logoUrl}
                alt={qrStation.name}
                width={72}
                height={72}
                style={{ objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
              />
            )}
            <img
              src={api.getStationQrUrl(qrStation.id, 280)}
              alt={`${qrStation.name} 二维码`}
              width={280}
              height={280}
              style={{
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                padding: 12,
                background: '#fff',
              }}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 8 }}>
              用户扫描此码可进行送养或领养，请打印张贴于中转站门口
            </Typography.Paragraph>
            <Typography.Text code copyable>
              {api.getStationQrPayload(qrStation.id)}
            </Typography.Text>
          </div>
        )}
      </Modal>
    </div>
  );
}
