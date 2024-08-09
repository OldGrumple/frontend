import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';

export const user = writable(null);

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  user.set(data.user);
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  user.set(null);
};

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Initialize the store
supabase.auth.getSession().then(({ data: { session } }) => {
  user.set(session?.user ?? null);
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  user.set(session?.user ?? null);
});