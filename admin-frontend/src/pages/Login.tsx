import { useState } from 'react';
import { Button, Input, Card, Typography } from 'antd';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !password) return;
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      alert('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
            🌿 流浪植物管理后台
          </Title>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>欢迎登录</p>
        </div>

        <Input
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: 16, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
        />
        
        <Input.Password
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 24, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
        />

        <Button
          type="primary"
          block
          loading={loading}
          onClick={handleSubmit}
          style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', border: 'none', height: 48 }}
        >
          登录
        </Button>
      </Card>
    </div>
  );
}
