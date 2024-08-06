<script>
  import { user, signOut } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  async function handleSignOut() {
    await signOut();
    goto('/login');
  }

  $: isAdmin = $user && $user.role === 'admin';  // Assume 'admin' is the admin role
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
    <div class="w-full py-6 flex items-center justify-between">
      <div class="flex items-center">
        <a href="/" class="text-2xl font-bold text-gray-900 dark:text-white">
          ITCache
        </a>
        {#if $user}
          <div class="hidden ml-10 space-x-8 lg:block">
            <a href="/companies" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Companies
            </a>
            {#if isAdmin}
              <a href="/admin" class="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Admin Center
              </a>
            {/if}
          </div>
        {/if}
      </div>
      <div class="ml-10 space-x-4">
        {#if $user}
          <button on:click={handleSignOut} class="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-600">Sign Out</button>
        {:else}
          <a href="/login" class="inline-block bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-indigo-600">Sign In</a>
          <a href="/create-account" class="inline-block bg-white py-2 px-4 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Sign Up</a>
        {/if}
      </div>
    </div>
  </nav>
</header>