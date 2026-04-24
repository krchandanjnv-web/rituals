import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Habit {
  id: string;
  name: string;
  category: 'Morning' | 'Evening' | 'Work';
  completed: boolean;
  created_at: string;
}

export interface UpcomingTask {
  id: string;
  title: string;
  due_date: string;
  user_id: string;
}

interface HabitContextType {
  habits: Habit[];
  upcomingTasks: UpcomingTask[];
  loading: boolean;
  addHabit: (name: string, category: Habit['category']) => Promise<void>;
  toggleHabit: (id: string, completed: boolean) => Promise<void>;
  addUpcomingTask: (title: string, dueDate: string) => Promise<void>;
  deleteUpcomingTask: (id: string) => Promise<void>;
  fetchHabitLogs: (days: number) => Promise<any[]>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setHabits([]);
      setUpcomingTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchHabits(), fetchUpcomingTasks()]);
    setLoading(false);
  };

  const fetchUpcomingTasks = async () => {
    const { data, error } = await supabase
      .from('upcoming_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (!error && data) {
      setUpcomingTasks(data as UpcomingTask[]);
    }
  };

  const fetchHabits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setHabits(data as Habit[]);
    }
    setLoading(false);
  };

  const addHabit = async (name: string, category: Habit['category']) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('habits')
      .insert([{ name, category, user_id: user.id, completed: false }])
      .select();

    if (!error && data) {
      setHabits([...habits, data[0] as Habit]);
    }
  };

  const toggleHabit = async (id: string, completed: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Update local habit state
    setHabits(habits.map(h => h.id === id ? { ...h, completed } : h));

    // Persist completion in logs
    if (completed) {
      await supabase.from('habit_logs').upsert({
        habit_id: id,
        user_id: user?.id,
        date: today,
        completed: true
      });
    } else {
      await supabase.from('habit_logs').delete().match({ habit_id: id, date: today });
    }

    // Also update main habits table for today's snapshot
    await supabase.from('habits').update({ completed }).eq('id', id);
  };

  const addUpcomingTask = async (title: string, dueDate: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('upcoming_tasks')
      .insert([{ title, due_date: dueDate, user_id: user.id }])
      .select();

    if (!error && data) {
      setUpcomingTasks(prev => [...prev, data[0] as UpcomingTask].sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      ));
    }
  };

  const deleteUpcomingTask = async (id: string) => {
    const { error } = await supabase.from('upcoming_tasks').delete().eq('id', id);
    if (!error) {
      setUpcomingTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const fetchHabitLogs = async (days: number) => {
    if (!user) return [];
    
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*, habits(name)')
      .gte('date', days === -1 ? '1970-01-01' : startDateStr);

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return data;
  };

  return (
    <HabitContext.Provider value={{ 
      habits, 
      upcomingTasks, 
      loading, 
      addHabit, 
      toggleHabit, 
      addUpcomingTask, 
      deleteUpcomingTask,
      fetchHabitLogs
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
