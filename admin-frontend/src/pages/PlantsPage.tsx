import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import MultiImageUpload from '../components/MultiImageUpload';
import type { Plant, Station } from '../types';

function PlantThumb({ plant }: { plant: Plant }) {
  const cover = plant.photos?.[0];
  if (cover) {
    return (
      <img
        src={cover}
        alt={plant.name}
        width={36}
        height={36}
        style={{ objectFit: 'cover', borderRadius: 6, marginRight: 8, verticalAlign: 'middle' }}
      />
    );
  }
  return null;
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<Plant | null>(null);
  const [form] = Form.useForm();

  const load = async (search?: string) => {
    setLoading(true);
    try {
      const [plantList, stationList] = await Promise.all([
        api.getPlants({ keyword: search }),
        api.getStations(),
      ]);
      setPlants(plantList);
      setStations(stationList);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (plant: Plant) => {
    setEditing(plant);
    form.setFieldsValue({
      name: plant.name,
      species: plant.category,
      description: plant.description,
      photos: plant.photos || [],
      listStatus: plant.listStatus,
      status: plant.plantStatus,
      stationId: plant.stationId,
    });
  };

  const save = async () => {
    if (!editing) return;
    const values = await form.validateFields();
    try {
      await api.updatePlant(editing.id, values);
      message.success('植物已更新');
      setEditing(null);
      load(keyword);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">植物管理</h2>
        <Input.Search
          placeholder="搜索名称/编号/品种"
          allowClear
          onSearch={(v) => {
            setKeyword(v);
            load(v);
          }}
          style={{ width: 280 }}
        />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={plants}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '编号', dataIndex: 'plantCode', width: 120 },
          {
            title: '名称',
            render: (_, r) => (
              <span>
                <PlantThumb plant={r} />
                {r.name}
              </span>
            ),
          },
          { title: '品种', dataIndex: 'category' },
          {
            title: '照片',
            width: 120,
            render: (_, r) => (r.photos?.length || 0) + ' 张',
          },
          { title: '状态', dataIndex: 'status', render: (v: string) => <Tag>{v}</Tag> },
          { title: '中转站', dataIndex: 'station' },
          { title: '主人', dataIndex: 'ownerName' },
          { title: '送养时间', dataIndex: 'donateTime' },
          {
            title: '操作',
            fixed: 'right',
            width: 160,
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除该植物？',
                      onOk: async () => {
                        await api.deletePlant(record.id);
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

      <Modal title="编辑植物" open={!!editing} onOk={save} onCancel={() => setEditing(null)} width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="species" label="品种" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="photos" label="植物照片" extra="支持上传多张，第一张作为封面">
            <MultiImageUpload />
          </Form.Item>
          <Form.Item name="stationId" label="所属中转站">
            <Select
              allowClear
              options={stations.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="listStatus" label="上架状态">
            <Select
              options={[
                { value: 'NONE', label: '未上架' },
                { value: 'AVAILABLE', label: '待领养' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="植物状态">
            <Select
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'ADOPTED', label: 'ADOPTED' },
                { value: 'DEAD', label: 'DEAD' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
