<script>
    import { signUp } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
  
    let email = '';
    let password = '';
    let confirmPassword = '';
    let error = null;
    let loading = false;
  
    async function handleSubmit() {
      error = null;
      loading = true;
  
      if (password !== confirmPassword) {
        error = "Passwords don't match";
        loading = false;
        return;
      }
  
      if (password.length < 6) {
        error = "Password must be at least 6 characters long";
        loading = false;
        return;
      }
  
      try {
        await signUp(email, password);
        goto('/');
      } catch (e) {
        error = e.message;
      } finally {
        loading = false;
      }
    }
  </script>
  
  <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <div class="mx-auto max-w-xl">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800 sm:text-4xl dark:text-white">
          Create an account
        </h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          Get started with our service
        </p>
      </div>
  
      <div class="mt-12">
        <form on:submit|preventDefault={handleSubmit}>
          <div class="grid gap-4 lg:gap-6">
            <div>
              <label for="email" class="block text-sm mb-2 dark:text-white">Email address</label>
              <input type="email" id="email" class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400" required bind:value={email}>
            </div>
  
            <div>
              <label for="password" class="block text-sm mb-2 dark:text-white">Password</label>
              <input type="password" id="password" class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400" required bind:value={password}>
            </div>
  
            <div>
              <label for="confirm-password" class="block text-sm mb-2 dark:text-white">Confirm Password</label>
              <input type="password" id="confirm-password" class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400" required bind:value={confirmPassword}>
            </div>
          </div>
  
          {#if error}
            <div class="text-center mt-4">
              <p class="text-sm text-red-600">{error}</p>
            </div>
          {/if}
  
          <div class="mt-6">
            <button type="submit" class="w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
  
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Already have an account? 
          <a class="text-blue-600 decoration-2 hover:underline font-medium" href="/login">
            Log in here
          </a>
        </p>
      </div>
    </div>
  </div>