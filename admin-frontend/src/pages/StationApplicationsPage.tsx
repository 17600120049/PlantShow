import { Button, Input, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { StationApplication } from '../types';

const statusLabels: Record<StationApplication['status'], string> = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已拒绝',
};

const statusColors: Record<StationApplication['status'], string> = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
};

export default function StationApplicationsPage() {
  const [applications, setApplications] = useState<StationApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reviewing, setReviewing] = useState<StationApplication | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  const load = async () => {
    setLoading(true);
    try {
      setApplications(await api.getStationApplications(statusFilter || undefined));
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const openReview = (application: StationApplication, action: 'APPROVED' | 'REJECTED') => {
    setReviewing(application);
    setReviewAction(action);
    setReviewNote('');
  };

  const submitReview = async () => {
    if (!reviewing) return;
    try {
      await api.reviewStationApplication(reviewing.id, {
        status: reviewAction,
        reviewNote: reviewNote || undefined,
      });
      message.success(reviewAction === 'APPROVED' ? '已通过申请' : '已拒绝申请');
      setReviewing(null);
      load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '审核失败');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">加盟申请</h2>
        <Select
          allowClear
          placeholder="筛选状态"
          style={{ width: 140 }}
          value={statusFilter || undefined}
          onChange={(value) => setStatusFilter(value || '')}
          options={[
            { value: 'PENDING', label: '待审核' },
            { value: 'APPROVED', label: '已通过' },
            { value: 'REJECTED', label: '已拒绝' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={applications}
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: '申请人',
            width: 120,
            render: (_, r) => (
              <div>
                <div>{r.applicantName}</div>
                {r.userNickname && (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {r.userNickname}
                  </Typography.Text>
                )}
              </div>
            ),
          },
          { title: '联系电话', dataIndex: 'phone', width: 130 },
          { title: '中转站名称', dataIndex: 'stationName', width: 140 },
          { title: '地址', dataIndex: 'address', ellipsis: true },
          { title: '营业时间', dataIndex: 'hours', width: 120, render: (v) => v || '—' },
          {
            title: '申请说明',
            dataIndex: 'intro',
            ellipsis: true,
            render: (v) => v || '—',
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status: StationApplication['status']) => (
              <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
            ),
          },
          {
            title: '申请时间',
            dataIndex: 'createdAt',
            width: 170,
            render: (v: string) => new Date(v).toLocaleString('zh-CN'),
          },
          {
            title: '操作',
            fixed: 'right',
            width: 160,
            render: (_, record) =>
              record.status === 'PENDING' ? (
                <Space>
                  <Button size="small" type="primary" onClick={() => openReview(record, 'APPROVED')}>
                    通过
                  </Button>
                  <Button size="small" danger onClick={() => openReview(record, 'REJECTED')}>
                    拒绝
                  </Button>
                </Space>
              ) : (
                <Typography.Text type="secondary">
                  {record.reviewNote || '—'}
                </Typography.Text>
              ),
          },
        ]}
      />

      <Modal
        title={reviewAction === 'APPROVED' ? '通过申请' : '拒绝申请'}
        open={!!reviewing}
        onOk={submitReview}
        onCancel={() => setReviewing(null)}
        okText="确认"
        cancelText="取消"
      >
        {reviewing && (
          <div>
            <Typography.Paragraph>
              <strong>{reviewing.stationName}</strong> · {reviewing.applicantName} · {reviewing.phone}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">{reviewing.address}</Typography.Paragraph>
            {reviewing.intro && (
              <Typography.Paragraph>申请说明：{reviewing.intro}</Typography.Paragraph>
            )}
            <Input.TextArea
              rows={3}
              placeholder={reviewAction === 'APPROVED' ? '审核备注（可选）' : '拒绝原因（可选）'}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
