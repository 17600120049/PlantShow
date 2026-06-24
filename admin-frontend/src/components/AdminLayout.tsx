import { Button, Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  FormOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearToken } from '../api';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/stations', icon: <ShopOutlined />, label: '中转站管理' },
  { key: '/station-applications', icon: <FormOutlined />, label: '加盟申请' },
  { key: '/plants', icon: <EnvironmentOutlined />, label: '植物管理' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <Layout className="admin-layout">
      <Sider className="admin-sider" width={168} theme="dark" style={{ background: '#1a2e24' }}>
        <div className="admin-logo">PlantShow</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#1a2e24' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600 }}>管理后台</span>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
