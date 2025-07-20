
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const getTasks = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase not configured');
          return;
        }

        const { data: tasks, error } = await supabase.from('tasks').select();

        if (error) {
          console.error('Error fetching tasks:', error.message);
          return;
        }

        if (tasks && tasks.length > 0) {
          setTasks(tasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    getTasks();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Task List</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text key={item.id}>{item.title}</Text>}
      />
    </View>
  );
};

