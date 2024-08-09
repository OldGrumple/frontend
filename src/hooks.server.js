import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from '$env/static/private'
import { sequence } from '@sveltejs/kit/hooks'
import { createServerClient } from '@supabase/ssr'
import { redirect } from '@sveltejs/kit'

async function supabaseHook({ event, resolve }) {
  event.locals.supabase = createServerClient(
    VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, options)
        },
        remove: (key, options) => {
          event.cookies.delete(key, options)
        },
      },
    }
  )

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}

async function authenticationHook({ event, resolve }) {
  const session = await event.locals.getSession()

  if (event.url.pathname.startsWith('/companies') && !session) {
    throw redirect(303, '/login')
  }

  return resolve(event)
}

export const handle = sequence(supabaseHook, authenticationHook)