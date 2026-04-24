import React from 'react';
import { ListTodo, BarChart2, User } from 'lucide-react';
import { clsx } from 'clsx';

interface NavbarProps {
  currentPage: 'tasks' | 'stats' | 'profile';
  setCurrentPage: (page: 'tasks' | 'stats' | 'profile') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const tabs = [
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
    { id: 'profile', icon: User, label: 'Profile' }
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setCurrentPage(id)}
          className={clsx(
            "flex flex-col items-center gap-1 transition-colors",
            currentPage === id ? "text-sage" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Icon size={24} />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
