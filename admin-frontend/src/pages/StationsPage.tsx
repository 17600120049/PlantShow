import { Button, Form, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import ImageUpload from '../components/ImageUpload';
import type { ContactType, Station } from '../types';

function contactTypeLabel(type?: ContactType) {
  return type === 'WECHAT' ? '微信' : '电话';
}

function StationLogo({ url, name }: { url?: string | null; name: string }) {
  if (!url) {
    return <span style={{ color: '#bfbfbf' }}>—</span>;
  }
  return (
    <img
      src={url}
      alt={name}
      width={36}
      height={36}
      style={{ objectFit: 'cover', borderRadius: 6, display: 'block' }}
    />
  );
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [creating, setCreating] = useState(false);
  const [qrStation, setQrStation] = useState<Station | null>(null);
  const [form] = Form.useForm();
  const contactType = Form.useWatch('contactType', form) as ContactType | undefined;
  const hoursMode = Form.useWatch('hoursMode', form) as Station['hoursMode'] | undefined;

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
    form.setFieldsValue({ logoUrl: '', contactType: 'PHONE', hoursMode: 'FIXED' });
  };

  const openEdit = (station: Station) => {
    setEditing(station);
    form.setFieldsValue({
      stationCode: station.stationCode,
      name: station.name,
      address: station.address,
      hoursMode: station.hoursMode || 'FIXED',
      hours: station.hoursMode === 'FLEXIBLE' ? '' : station.hours,
      contactType: station.contactType || 'PHONE',
      phone: station.phone,
      logoUrl: station.logoUrl || '',
    });
  };

  const save = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      logoUrl: values.logoUrl || null,
      phone: values.phone?.trim() || null,
      hours: values.hoursMode === 'FLEXIBLE' ? undefined : values.hours?.trim(),
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
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '编号', dataIndex: 'stationCode', width: 100 },
          {
            title: 'Logo',
            width: 72,
            align: 'center',
            render: (_, r) => <StationLogo url={r.logoUrl} name={r.name} />,
          },
          { title: '名称', dataIndex: 'name', width: 140, ellipsis: true },
          { title: '地址', dataIndex: 'address', width: 260, ellipsis: true },
          {
            title: '营业时间',
            dataIndex: 'hours',
            width: 140,
            render: (hours: string, record) => (
              record.hoursMode === 'FLEXIBLE'
                ? <Tag>无固定</Tag>
                : hours
            ),
          },
          {
            title: '联系方式',
            width: 160,
            ellipsis: true,
            render: (_, r) => {
              if (!r.phone) {
                return '—';
              }
              return `${contactTypeLabel(r.contactType)} ${r.phone}`;
            },
          },
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
                      content: '删除后，该站关联的植物将自动解除绑定并下架。',
                      onOk: async () => {
                        try {
                          await api.deleteStation(record.id);
                          message.success('已删除');
                          load();
                        } catch (err) {
                          message.error(err instanceof Error ? err.message : '删除失败');
                          throw err;
                        }
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
          <Form.Item name="address" label="地址" rules={[{ required: true }]} extra="保存时会通过高德地图验证地址是否可搜索">
            <Input placeholder="建议填写完整地址，如：北京市朝阳区双桥中路50号院" />
          </Form.Item>
          <Form.Item name="hoursMode" label="营业时间类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="FIXED">固定营业时间</Select.Option>
              <Select.Option value="FLEXIBLE">无固定营业时间</Select.Option>
            </Select>
          </Form.Item>
          {hoursMode === 'FIXED' && (
            <Form.Item
              name="hours"
              label="营业时间段"
              rules={[{ required: true, message: '请填写营业时间段' }]}
              extra="营业状态将根据此时间自动计算"
            >
              <Input placeholder="09:00-20:00" />
            </Form.Item>
          )}
          {hoursMode === 'FLEXIBLE' && (
            <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
              无固定营业时间的中转站，需由管理员扫码手动切换营业/休息状态。
            </Typography.Paragraph>
          )}
          <Form.Item label="联系方式">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="contactType" noStyle initialValue="PHONE">
                <Select style={{ width: 96 }}>
                  <Select.Option value="PHONE">电话</Select.Option>
                  <Select.Option value="WECHAT">微信</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="phone" noStyle>
                <Input
                  placeholder={contactType === 'WECHAT' ? '请输入微信号' : '请输入电话号码'}
                />
              </Form.Item>
            </Space.Compact>
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
        footer={
          qrStation ? (
            <Button
              type="primary"
              href={api.getStationQrUrl(qrStation.id, 512)}
              download={`station-${qrStation.stationCode}-qr.png`}
            >
              下载二维码
            </Button>
          ) : null
        }
        width={400}
      >
        {qrStation && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
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
            <Typography.Paragraph
              type="secondary"
              style={{ marginTop: 16, marginBottom: 0, padding: '0 8px', whiteSpace: 'normal' }}
            >
              用户扫描此码可进行送养或领养；无固定营业时间的中转站，管理员扫码可切换营业状态
            </Typography.Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
}
