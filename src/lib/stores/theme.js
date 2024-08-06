import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';

function createThemeStore() {
  const { subscribe, set, update } = writable('light');

  return {
    subscribe,
    setTheme: async (newTheme) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating theme preference:', error);
        }
      }
      set(newTheme);
      if (browser) {
        localStorage.setItem('theme', newTheme);
      }
    },
    initialize: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('theme_preference')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          set(data.theme_preference);
        }
      } else if (browser) {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
          set(localTheme);
        }
      }
    }
  };
}

export const theme = createThemeStore();