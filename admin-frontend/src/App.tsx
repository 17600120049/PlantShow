import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import PlantManagement from './pages/PlantManagement';
import PostManagement from './pages/PostManagement';
import TradeManagement from './pages/TradeManagement';
import ReportManagement from './pages/ReportManagement';
import Layout from './components/Layout';
import { useAuthStore } from './store/authStore';

function App() {
  const { isLoggedIn } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="plants" element={<PlantManagement />} />
          <Route path="posts" element={<PostManagement />} />
          <Route path="trades" element={<TradeManagement />} />
          <Route path="reports" element={<ReportManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
