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
    <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 py-3 z-50 transition-colors duration-300">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setCurrentPage(id)}
          className={clsx(
            "flex flex-col items-center justify-center gap-1 transition-colors",
            currentPage === id ? "text-sage" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          )}
        >
          <Icon size={22} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
