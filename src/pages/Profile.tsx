import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../contexts/HabitContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, User, Settings, Shield, Bell, FileDown, Moon, Sun, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { jsPDF } from 'jspdf';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { fetchHabitLogs } = useHabits();
  const { theme, toggleTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportRange, setExportRange] = useState({ from: '', to: '' });

  const handleExportPDF = async () => {
    if (!exportRange.from || !exportRange.to) {
        alert('Please select a date range first');
        return;
    }

    setIsExporting(true);
    const logs = await fetchHabitLogs(-1); // Fetch all to filter locally for range
    const filteredLogs = logs.filter((l: any) => 
        l.date >= exportRange.from && l.date <= exportRange.to
    );

    const doc = new jsPDF();
    const title = `Rituals Report: ${exportRange.from} to ${exportRange.to}`;
    
    doc.setFontSize(20);
    doc.text('Rituals App - Progress Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`User: ${user?.user_metadata?.full_name || user?.email}`, 20, 30);
    doc.text(title, 20, 38);

    doc.line(20, 42, 190, 42);

    let y = 55;
    doc.setFontSize(14);
    doc.text('Completion History:', 20, y);
    y += 10;
    doc.setFontSize(10);

    const dailySummary: any = {};
    filteredLogs.forEach((l: any) => {
        if (!dailySummary[l.date]) dailySummary[l.date] = [];
        dailySummary[l.date].push(l.habits.name);
    });

    Object.entries(dailySummary).sort().forEach(([date, taskNames]: any) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${date}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${taskNames.join(', ')}`, 50, y);
        y += 7;
    });

    doc.save(`Rituals_Report_${exportRange.from}_${exportRange.to}.pdf`);
    setIsExporting(false);
  };

  const menuItems = [
    { icon: Settings, label: 'Preferences', color: 'text-gray-400' },
    { icon: Shield, label: 'Security', color: 'text-gray-400' },
    { icon: Bell, label: 'Notifications', color: 'text-gray-400' },
  ];

  return (
    <div className="transition-colors duration-300">
      <div className="flex flex-col items-center mb-10 pt-4">
        <div className="w-24 h-24 bg-sage-light dark:bg-sage/10 rounded-[32px] flex items-center justify-center mb-4 relative shadow-inner">
          <User size={48} className="text-sage" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-sage border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg">
            <Settings size={14} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.user_metadata?.full_name || 'Your Profile'}</h2>
        <p className="text-gray-400 text-sm">@{user?.user_metadata?.username || 'user'}</p>
        <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
      </div>

      <div className="space-y-6 mb-10">
        {/* Appearance Toggle */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl">
              {theme === 'light' ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} className="text-blue-400" />}
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-200">Dark Mode</span>
          </div>
          <button 
            onClick={toggleTheme}
            className={clsx(
                "w-14 h-8 rounded-full p-1 transition-colors duration-300",
                theme === 'dark' ? "bg-sage" : "bg-gray-200"
            )}
          >
            <div className={clsx(
                "w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm",
                theme === 'dark' ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Data Export Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-sage-light dark:bg-sage/10 rounded-xl text-sage">
              <FileDown size={20} />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white">Export My Data</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">From</p>
              <input 
                type="date" 
                value={exportRange.from}
                onChange={(e) => setExportRange({...exportRange, from: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">To</p>
              <input 
                type="date" 
                value={exportRange.to}
                onChange={(e) => setExportRange({...exportRange, to: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>

          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full py-4 bg-sage text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-sage-dark active:scale-95 transition-all shadow-lg shadow-sage/20 disabled:opacity-50"
          >
            {isExporting ? 'Generating...' : 'Download PDF Report'}
          </button>
        </div>

        {/* Standard Menu Items */}
        <div className="space-y-3">
          {menuItems.map(({ icon: Icon, label, color }) => (
            <button 
              key={label}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl group hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-800 transition-all">
                  <Icon size={18} className={color} />
                </div>
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => signOut()}
        className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
      >
        <LogOut size={20} />
        <span>Logout Account</span>
      </button>

      <div className="mt-12 opacity-20 flex flex-col items-center pb-8">
        <div className="w-8 h-8 bg-sage rounded-xl flex items-center justify-center mb-2">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <p className="text-[8px] uppercase tracking-[0.2em] font-black text-gray-500 dark:text-gray-400">Rituals Premium v2.0</p>
      </div>
    </div>
  );
};

export default Profile;
