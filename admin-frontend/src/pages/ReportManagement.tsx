import { useEffect, useState } from 'react';
import { Table, Button, Modal, Select } from 'antd';
import { Report, ReportStatus } from '../types';

export default function ReportManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/reports');
    const data = await response.json();
    setReports(data.reports);
    setLoading(false);
  };

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    await fetch(`/api/admin/reports/${reportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchReports();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '目标类型', dataIndex: 'targetType', key: 'targetType' },
    { title: '目标ID', dataIndex: 'targetId', key: 'targetId' },
    { title: '原因', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Select
          value={record.status}
          onChange={(value) => handleUpdateStatus(record.id, value)}
          style={{ width: 120 }}
          options={[
            { value: 'PENDING', label: '待处理' },
            { value: 'RESOLVED', label: '已处理' },
            { value: 'IGNORED', label: '忽略' },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: 24, fontSize: 24 }}>举报管理</h1>
      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}
      />
    </div>
  );
}
