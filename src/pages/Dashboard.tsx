import { useState } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { Plus, Check, Clock, Sun, Moon, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';

const Dashboard = () => {
  const { habits, addHabit, toggleHabit } = useHabits();
  const [activeTab, setActiveTab] = useState<'Morning' | 'Evening' | 'Work'>('Morning');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const filteredHabits = habits.filter(h => h.category === activeTab);
  const completedCount = filteredHabits.filter(h => h.completed).length;
  const totalCount = filteredHabits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      await addHabit(newHabitName.trim(), activeTab);
      setNewHabitName('');
      setIsModalOpen(false);
    }
  };

  const tabs = [
    { id: 'Morning' as const, icon: Sun, label: 'Morning' },
    { id: 'Evening' as const, icon: Moon, label: 'Evening' },
    { id: 'Work' as const, icon: Briefcase, label: 'Work' }
  ];

  return (
    <div className="p-6">
      {/* Header with Progress Ring */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="#F1F3F5"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - progress / 100)}
              className="text-sage transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-gray-800">{Math.round(progress)}%</span>
            <span className="text-sm text-gray-400 font-medium">Progress</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Rituals</h2>
          <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-between bg-gray-50 p-1 rounded-2xl mb-8">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              activeTab === id 
                ? "bg-white text-sage shadow-sm font-bold" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Habit List */}
      <div className="space-y-4">
        {filteredHabits.map((habit) => (
          <div 
            key={habit.id}
            className={clsx(
              "flex items-center justify-between p-5 rounded-2xl border transition-all",
              habit.completed 
                ? "bg-sage-light/30 border-sage-light" 
                : "bg-white border-gray-100 shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleHabit(habit.id, !habit.completed)}
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  habit.completed 
                    ? "bg-sage text-white shadow-lg shadow-sage/30" 
                    : "border-2 border-gray-100 text-transparent"
                )}
              >
                <Check size={20} />
              </button>
              <div>
                <h3 className={clsx(
                  "font-bold transition-all",
                  habit.completed ? "text-gray-400 line-through" : "text-gray-800"
                )}>{habit.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  Every day
                </p>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 flex items-center justify-center gap-2 hover:border-sage hover:text-sage transition-all mt-4"
        >
          <Plus size={20} />
          <span className="font-bold">Add Ritual</span>
        </button>
      </div>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">New {activeTab} Ritual</h3>
            <form onSubmit={handleAddHabit}>
              <input
                autoFocus
                type="text"
                placeholder="Name your ritual..."
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sage mb-6"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-sage text-white rounded-2xl font-bold shadow-lg shadow-sage/30 hover:bg-sage-dark transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
