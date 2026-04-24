import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'tasks' | 'stats' | 'profile'>('tasks');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-sage-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 max-w-md mx-auto shadow-xl transition-colors duration-300 relative border-x border-gray-100 dark:border-gray-800">
      <main className="flex-1 overflow-y-auto pb-24 p-6">
        {currentPage === 'tasks' && <Dashboard />}
        {currentPage === 'stats' && <Stats />}
        {currentPage === 'profile' && <Profile />}
      </main>
      
      <div className="sticky bottom-0 w-full z-50">
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}

export default App;
