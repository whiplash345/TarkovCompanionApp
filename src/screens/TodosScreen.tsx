import React from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

async function fetchTodos() {
  const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function addTodo(title: string) {
  const { data: auth } = await supabase.auth.getUser();
  const user_id = auth.user?.id;
  if (!user_id) throw new Error('Not signed in');
  const { error } = await supabase.from('todos').insert({ title, user_id });
  if (error) throw error;
}

export default function TodosScreen() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });
  const mutation = useMutation({
    mutationFn: () => addTodo('New task'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });

  if (isLoading) return <Text>Loading…</Text>;
  if (error) return <Text>{(error as Error).message}</Text>;

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Button title="Add todo" onPress={() => mutation.mutate()} />
      <FlatList
        data={data}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}
