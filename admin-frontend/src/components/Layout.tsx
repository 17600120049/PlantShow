import { Layout, Menu, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, admin } = useAuthStore();

  const menuItems = [
    { key: '/', label: '数据看板' },
    { key: '/users', label: '用户管理' },
    { key: '/plants', label: '植物管理' },
    { key: '/posts', label: '动态管理' },
    { key: '/trades', label: '交换管理' },
    { key: '/reports', label: '举报管理' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ padding: '20px', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          🌿 流浪植物管理
        </div>
        <Menu
          mode="inline"
          selectedKeys={[window.location.pathname]}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            color: '#fff',
            borderRight: 'none',
          }}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.key}>{item.label}</Menu.Item>
          ))}
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          <span style={{ color: '#fff', fontSize: '18px' }}>
            {menuItems.find((item) => item.key === window.location.pathname)?.label || '管理后台'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              {admin?.username} ({admin?.role})
            </span>
            <Button onClick={handleLogout} danger>
              退出
            </Button>
          </div>
        </Header>

        <Content
          style={{
            padding: '24px',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
