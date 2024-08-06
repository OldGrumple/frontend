<script>
    import { signIn } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
  
    let email = '';
    let password = '';
    let error = null;
    let loading = false;
  
    async function handleSubmit() {
      error = null;
      loading = true;
  
      try {
        await signIn(email, password);
        goto('/');
      } catch (e) {
        error = e.message;
      } finally {
        loading = false;
      }
    }
  </script>
  
  <div class="h-full">
    <div class="dark:bg-slate-900 bg-gray-100 flex h-full items-center py-16">
      <div class="w-full max-w-md mx-auto p-6">
        <div class="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div class="p-4 sm:p-7">
            <div class="text-center">
              <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Sign in</h1>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Don't have an account yet?
                <a class="text-blue-600 decoration-2 hover:underline font-medium" href="/create-account">
                  Sign up here
                </a>
              </p>
            </div>
  
            <div class="mt-5">
              <form on:submit|preventDefault={handleSubmit}>
                <div class="grid gap-y-4">
                  <div>
                    <label for="email" class="block text-sm mb-2 dark:text-white">Email address</label>
                    <div class="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        bind:value={email}
                        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                        required
                        aria-describedby="email-error"
                      >
                    </div>
                  </div>
  
                  <div>
                    <div class="flex justify-between items-center">
                      <label for="password" class="block text-sm mb-2 dark:text-white">Password</label>
                      <a class="text-sm text-blue-600 decoration-2 hover:underline font-medium" href="/forgot-password">Forgot password?</a>
                    </div>
                    <div class="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        bind:value={password}
                        class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                        required
                        aria-describedby="password-error"
                      >
                    </div>
                  </div>
  
                  {#if error}
                    <div class="text-center">
                      <p class="text-xs text-red-600" id="email-error">{error}</p>
                    </div>
                  {/if}
  
                  <button
                    type="submit"
                    class="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>