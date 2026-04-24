import { useHabits } from '../contexts/HabitContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, TrendingUp, Calendar, Target } from 'lucide-react';

const Stats = () => {
  const { habits } = useHabits();
  const { user } = useAuth();

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const categories = ['Morning', 'Evening', 'Work'];
  const categoryStats = categories.map(cat => {
    const catHabits = habits.filter(h => h.category === cat);
    const catCompleted = catHabits.filter(h => h.completed).length;
    const rate = catHabits.length > 0 ? Math.round((catCompleted / catHabits.length) * 100) : 0;
    return { name: cat, rate, total: catHabits.length };
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Performance</h2>
      <p className="text-gray-400 text-sm mb-8">Hello, {user?.user_metadata?.full_name || 'User'}. Here's your track record.</p>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-sage p-5 rounded-3xl text-white shadow-xl shadow-sage/20">
          <Trophy size={24} className="mb-3 opacity-80" />
          <div className="text-3xl font-bold">{completedHabits}</div>
          <div className="text-xs opacity-80 font-medium">Completed Today</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <TrendingUp size={24} className="mb-3 text-sage" />
          <div className="text-3xl font-bold text-gray-800">{completionRate}%</div>
          <div className="text-xs text-gray-400 font-medium">Daily Score</div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-sage" size={20} />
          <h3 className="font-bold text-gray-800">Category Focus</h3>
        </div>
        <div className="space-y-6">
          {categoryStats.map(stat => (
            <div key={stat.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-700">{stat.name}</span>
                <span className="text-xs text-gray-400">{stat.rate}% ({stat.total} habits)</span>
              </div>
              <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sage transition-all duration-500 ease-out"
                  style={{ width: `${stat.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-sage-light/30 border border-sage-light p-5 rounded-2xl flex items-start gap-4">
        <div className="bg-white p-2 rounded-xl text-sage shadow-sm">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">Keep it up!</h4>
          <p className="text-xs text-gray-600 leading-relaxed mt-1">
            Consistency is key. You've completed {completedHabits} rituals today. Try to hit 100% to boost your streak!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
