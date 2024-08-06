import { redirect } from '@sveltejs/kit';
import { user } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const handle = async ({ event, resolve }) => {
  const currentUser = get(user);
  const path = event.url.pathname;

  if (currentUser) {
    // Redirect authenticated users away from login and signup pages
    if (path === '/login' || path === '/create-account') {
      throw redirect(303, '/');
    }

    // Check if user is admin for admin center access
    if (path.startsWith('/admin') && currentUser.role_id !== (SELECT id FROM public.roles WHERE name = 'admin')) {
      throw redirect(303, '/');
    }
  } else {
    // Redirect unauthenticated users to login page for protected routes
    if (path !== '/login' && path !== '/create-account') {
      throw redirect(303, '/login');
    }
  }

  return await resolve(event);
};