import { useState, useEffect, useCallback } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, TrendingUp, Calendar, Target, Clock, MessageSquare, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const Stats = () => {
  const { fetchHabitLogs, habits } = useHabits();
  const { user } = useAuth();
  const [filter, setFilter] = useState<7 | 30 | -1>(7);
  const [stats, setStats] = useState<any>({});
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const calculateStats = useCallback((logData: any[], filterType: number) => {
    if (habits.length === 0) return {};

    const totalRituals = logData.length;
    const daysInRange = filterType === -1 ? 
      (logData.length > 0 ? eachDayOfInterval({ 
        start: parseISO(logData[logData.length-1].date), 
        end: new Date() 
      }).length : 1) : filterType;

    const avgCompletion = totalRituals / (habits.length * daysInRange);
    
    // Streak logic
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    const sortedDates = [...new Set(logData.map(l => l.date))].sort().reverse();
    
    // Simplified streak check (at least one habit per day)
    // Real strict streak would check if completion % == 100
    for (let i = 0; i < sortedDates.length; i++) {
        const date = parseISO(sortedDates[i]);
        const dayLogs = logData.filter(l => l.date === sortedDates[i]);
        if (dayLogs.length === habits.length) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            
            // Check if it's the current streak
            const expectedDate = subDays(today, currentStreak);
            if (isSameDay(date, expectedDate) || isSameDay(date, today)) {
                currentStreak++;
            }
        } else {
            tempStreak = 0;
        }
    }

    // Best Day
    const dailyCompletion = sortedDates.map(d => ({
        date: d,
        count: logData.filter(l => l.date === d).length
    }));
    const bestDay = dailyCompletion.length > 0 ? 
        dailyCompletion.reduce((prev, curr) => prev.count > curr.count ? prev : curr) : null;

    return {
      total: totalRituals,
      avg: Math.round(avgCompletion * 100),
      currentStreak,
      longestStreak,
      bestDay: bestDay ? format(parseISO(bestDay.date), 'MMM do') : 'N/A',
      missedDays: daysInRange - sortedDates.length
    };
  }, [habits]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchHabitLogs(filter);
      setStats(calculateStats(data, filter));

      // Load note
      const { data: noteData } = await supabase.from('notes').select('content').single();
      if (noteData) setNote(noteData.content);
    };
    loadData();
  }, [filter, fetchHabitLogs, calculateStats]);

  const saveNote = async () => {
    setIsSavingNote(true);
    await supabase.from('notes').upsert({ user_id: user?.id, content: note });
    setTimeout(() => setIsSavingNote(false), 800);
  };

  return (
    <div className="p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics</h2>
          <p className="text-gray-400 text-xs">A deep dive into your rituals</p>
        </div>
        <Clock className="text-sage" size={24} />
      </div>

      {/* Time Filter */}
      <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-2xl mb-8">
        {[7, 30, -1].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={clsx(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all",
              filter === f 
                ? "bg-white dark:bg-gray-800 text-sage shadow-sm" 
                : "text-gray-400 dark:text-gray-500"
            )}
          >
            {f === -1 ? 'All Time' : `${f} Days`}
          </button>
        ))}
      </div>

      {/* Streak Counter */}
      <div className="bg-sage p-6 rounded-[32px] text-white shadow-xl shadow-sage/20 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="opacity-80" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Consistency Streak</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black">{stats.currentStreak || 0}</span>
            <span className="text-xl font-bold mb-2">days</span>
          </div>
          <div className="mt-4 flex gap-6 border-t border-white/20 pt-4">
            <div>
              <p className="text-[10px] opacity-60 uppercase font-bold">Longest</p>
              <p className="text-sm font-bold">{stats.longestStreak || 0} days</p>
            </div>
            <div>
              <p className="text-[10px] opacity-60 uppercase font-bold">Score</p>
              <p className="text-sm font-bold">{stats.avg || 0}% avg</p>
            </div>
          </div>
        </div>
        <Trophy size={120} className="absolute -right-8 -bottom-8 opacity-10 rotate-12" />
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <KPICard title="Total Done" value={stats.total} icon={Target} sub="Completed" />
        <KPICard title="Best Day" value={stats.bestDay} icon={Calendar} sub="Peak Output" />
        <KPICard title="Missed" value={stats.missedDays} icon={Clock} sub="Days Off" color="text-red-400" />
        <KPICard title="Efficiency" value={`${stats.avg}%`} icon={TrendingUp} sub="Daily Avg" />
      </div>

      {/* Reminder Notes */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-[32px] shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-sage" size={20} />
            <h3 className="font-bold text-gray-800 dark:text-white">Motivational Notes</h3>
          </div>
          <button 
            disabled={isSavingNote}
            onClick={saveNote}
            className={clsx(
                "p-2 rounded-xl transition-all",
                isSavingNote ? "bg-sage text-white" : "text-gray-400 hover:text-sage"
            )}
          >
            <Save size={18} />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a message to your future self..."
          className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 text-sm text-gray-700 dark:text-gray-300 min-h-[120px] focus:ring-1 focus:ring-sage"
        />
        <p className="text-[10px] text-gray-400 mt-2 text-center">Saved automatically to your profile</p>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, sub, color = "text-sage" }: any) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className={clsx("p-2 rounded-xl bg-gray-50 dark:bg-gray-900", color)}>
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider transition-colors duration-300">{title}</span>
    </div>
    <div className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-1">{value}</div>
    <div className="text-[10px] text-gray-400">{sub}</div>
  </div>
);

export default Stats;
