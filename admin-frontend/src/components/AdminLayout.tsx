import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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
        <Header style={{ background: '#fff', padding: '0 24px', fontWeight: 600 }}>
          管理后台
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
