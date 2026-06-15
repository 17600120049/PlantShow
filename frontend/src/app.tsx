import { useEffect } from 'react';
import { useUserStore } from './store/userStore';
import HomePage from './pages/HomePage';
import './App.scss';

function App() {
  const { initUser } = useUserStore();

  useEffect(() => {
    initUser();
  }, []);

  return (
    <div className="app">
      <HomePage />
    </div>
  );
}

export default App;
