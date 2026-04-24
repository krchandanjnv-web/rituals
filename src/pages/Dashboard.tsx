import { useState } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { Plus, Check, Sun, Moon, Briefcase, Calendar, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format, differenceInDays, parseISO } from 'date-fns';

const Dashboard = () => {
  const { habits, addHabit, toggleHabit, upcomingTasks, addUpcomingTask, deleteUpcomingTask } = useHabits();
  const [activeTab, setActiveTab] = useState<'Morning' | 'Evening' | 'Work'>('Morning');
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  const filteredHabits = habits.filter(h => h.category === activeTab);
  const completedCount = filteredHabits.filter(h => h.completed).length;
  const totalCount = filteredHabits.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      await addHabit(newHabitName.trim(), activeTab);
      setNewHabitName('');
      setIsRitualModalOpen(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && newTaskDate) {
      await addUpcomingTask(newTaskTitle.trim(), newTaskDate);
      setNewTaskTitle('');
      setNewTaskDate('');
      setIsTaskModalOpen(false);
    }
  };

  const tabs = [
    { id: 'Morning' as const, icon: Sun, label: 'Morning' },
    { id: 'Evening' as const, icon: Moon, label: 'Evening' },
    { id: 'Work' as const, icon: Briefcase, label: 'Work' }
  ];

  return (
    <div className="p-6 transition-colors duration-300">
      {/* Header with Progress Ring */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)}
              className="text-sage transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-800 dark:text-white">{Math.round(progress)}%</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Today</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {format(new Date(), 'EEEE, MMMM do')}
          </h2>
          <p className="text-gray-400 text-xs">Keep up the momentum!</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl mb-8">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              "flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
              activeTab === id 
                ? "bg-white dark:bg-gray-800 text-sage shadow-sm font-bold" 
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <Icon size={16} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* Habit List */}
      <div className="space-y-4 mb-10">
        {filteredHabits.map((habit) => (
          <div 
            key={habit.id}
            className={clsx(
              "flex items-center justify-between p-4 rounded-2xl border transition-all",
              habit.completed 
                ? "bg-sage-light/20 dark:bg-sage/10 border-sage-light/50 dark:border-sage/20" 
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleHabit(habit.id, !habit.completed)}
                className={clsx(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  habit.completed 
                    ? "bg-sage text-white shadow-lg shadow-sage/30" 
                    : "border-2 border-gray-100 dark:border-gray-700 text-transparent"
                )}
              >
                <Check size={18} />
              </button>
              <div>
                <h3 className={clsx(
                  "font-bold text-sm transition-all",
                  habit.completed ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-800 dark:text-gray-200"
                )}>{habit.name}</h3>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setIsRitualModalOpen(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 flex items-center justify-center gap-2 hover:border-sage hover:text-sage transition-all"
        >
          <Plus size={18} />
          <span className="text-sm font-bold">Add Ritual</span>
        </button>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-sage" size={20} />
            <h3 className="font-bold text-gray-800 dark:text-white">Upcoming Tasks</h3>
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="p-2 text-sage hover:bg-sage-light/30 rounded-xl transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingTasks.length === 0 ? (
            <p className="text-center py-4 text-xs text-gray-400 dark:text-gray-600 italic">
              No upcoming tasks. Planning ahead helps!
            </p>
          ) : (
            upcomingTasks.map(task => {
              const daysLeft = differenceInDays(parseISO(task.due_date), new Date());
              return (
                <div key={task.id} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{task.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Due {format(parseISO(task.due_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-bold",
                      daysLeft < 3 ? "bg-red-50 text-red-500 dark:bg-red-900/20" : "bg-sage-light text-sage dark:bg-sage/10"
                    )}>
                      {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </div>
                    <button 
                      onClick={() => deleteUpcomingTask(task.id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals - Common Style */}
      {isRitualModalOpen && (
        <Modal 
          title={`New ${activeTab} Ritual`} 
          onClose={() => setIsRitualModalOpen(false)}
          onSubmit={handleAddHabit}
        >
          <input
            autoFocus
            type="text"
            placeholder="Name your ritual..."
            className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            required
          />
        </Modal>
      )}

      {isTaskModalOpen && (
        <Modal 
          title="New Upcoming Task" 
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleAddTask}
        >
          <div className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Task title..."
              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
            <input
              type="date"
              className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              required
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

// Simple Modal Component
const Modal = ({ title, children, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">{title}</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-8">{children}</div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
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
);

export default Dashboard;
