<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabase';
    import { goto } from '$app/navigation';
  
    $: companyId = $page.params.id;
    
    let newPassword = {
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      totp_secret: ''
    };
  
    async function createPassword() {
      const { data, error } = await supabase
        .from('passwords')
        .insert({ ...newPassword, company_id: companyId })
        .select();
  
      if (error) {
        console.error('Error creating password:', error);
        alert('Failed to create password. Please try again.');
      } else {
        alert('Password created successfully!');
        goto(`/companies/${companyId}/passwords`);
      }
    }
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Create New Password</h1>
  
    <form on:submit|preventDefault={createPassword} class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" bind:value={newPassword.title} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
  
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
        <input id="username" bind:value={newPassword.username} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
  
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input id="password" type="password" bind:value={newPassword.password} required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
  
      <div>
        <label for="url" class="block text-sm font-medium text-gray-700">URL</label>
        <input id="url" type="url" bind:value={newPassword.url} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
  
      <div>
        <label for="totp_secret" class="block text-sm font-medium text-gray-700">OTP Code</label>
        <input id="totp_secret" bind:value={newPassword.totp_secret} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
  
      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea id="notes" bind:value={newPassword.notes} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3"></textarea>
      </div>
  
      <div>
        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Create Password
        </button>
      </div>
    </form>
  </div>