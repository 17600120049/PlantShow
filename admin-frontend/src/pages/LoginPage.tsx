import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await api.login(values.username, values.password);
      setToken(res.accessToken);
      message.success('登录成功');
      navigate('/');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登录失败');
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" title="流浪植物管理后台">
        <Typography.Paragraph type="secondary">
          管理用户、积分、中转站与植物数据
        </Typography.Paragraph>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin' }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input size="large" placeholder="admin" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password size="large" placeholder="admin123" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
