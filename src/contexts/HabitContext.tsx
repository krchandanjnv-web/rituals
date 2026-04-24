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

interface HabitContextType {
  habits: Habit[];
  loading: boolean;
  addHabit: (name: string, category: Habit['category']) => Promise<void>;
  toggleHabit: (id: string, completed: boolean) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [user]);

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
    const { error } = await supabase
      .from('habits')
      .update({ completed })
      .eq('id', id);

    if (!error) {
      setHabits(habits.map(h => h.id === id ? { ...h, completed } : h));
    }
  };

  return (
    <HabitContext.Provider value={{ habits, loading, addHabit, toggleHabit }}>
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
