import { writable } from 'svelte/store'
import { supabase } from '$lib/supabase'

export const user = writable(null);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    getCurrentUser().then(currentUser => {
      user.set(currentUser);
    });
  } else if (event === 'SIGNED_OUT') {
    user.set(null);
  }
});

export const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return getCurrentUser();
  };
  
  export const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  };
  
  export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.set(null);
    goto('/login');
  };
  
  export const getCurrentUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role_id, theme_preference')
        .eq('id', currentUser.id)
        .single();
  
      if (userError) throw userError;
  
      return { ...currentUser, role_id: userData.role_id, theme_preference: userData.theme_preference };
    }
    return null;
  };

// Initialize user on page load
getCurrentUser().then(currentUser => {
    if (currentUser) {
      user.set(currentUser);
    }
  });