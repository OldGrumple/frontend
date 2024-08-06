<script>
    import { page } from '$app/stores';
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { TOTP } from "totp-generator"
    import { user } from '$lib/stores/auth'; 
  
    $: ({ id: companyId, passwordId } = $page.params);
    let password = null;
    let error = null;
    let showPassword = false;
    let showOtp = false;
    let totpCode = '';
    let toastMessage = '';
    let totpTimeRemaining = 30;
    let totpInterval;
    let isEditing = false;
    let editedPassword = {};
  
    $: isAdmin = $user && $user.role === 'admin';  // Assume 'admin' is the admin role

    onMount(async () => {
      await fetchPassword();
      if (password && password.totp_secret) {
        generateTOTP();
        totpInterval = setInterval(generateTOTP, 1000);
      }
    });
  
    onDestroy(() => {
      if (totpInterval) {
        clearInterval(totpInterval);
      }
    });
  
    async function fetchPassword() {
      const { data, error: fetchError } = await supabase
        .from('passwords')
        .select('*')
        .eq('id', passwordId)
        .eq('company_id', companyId)
        .single();
  
      if (fetchError) {
        console.error('Error fetching password:', fetchError);
        error = 'Failed to load password details.';
      } else {
        password = data;
      }
    }
  
    function generateTOTP() {
    if (password && password.totp_secret) {
      totpCode = TOTP.generate(password.totp_secret);
      const epochSeconds = Math.floor(Date.now() / 1000);
      totpTimeRemaining = 30 - (epochSeconds % 30);
    }
  }
  
  $: totpProgressPercentage = (totpTimeRemaining / 30) * 100;

  async function editPassword() {
    const { data, error: updateError } = await supabase
      .from('passwords')
      .update(editedPassword)
      .eq('id', passwordId);

    if (updateError) {
      console.error('Error updating password:', updateError);
      error = 'Failed to update password.';
    } else {
      password = editedPassword;
      isEditing = false;
    }
  }

  async function toggleArchive() {
    const newArchivedState = !password.archived;
    const { data, error } = await supabase
      .from('passwords')
      .update({ archived: newArchivedState })
      .eq('id', passwordId);

    if (error) {
      console.error('Error toggling archive state:', error);
      showToast('Failed to update archive state.');
    } else {
      password.archived = newArchivedState;
      showToast(`Password ${newArchivedState ? 'archived' : 'unarchived'} successfully.`);
    }
  }

  async function deletePassword() {
    if (!isAdmin) return;

    if (confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
      const { data, error: deleteError } = await supabase
        .from('passwords')
        .delete()
        .eq('id', passwordId);

      if (deleteError) {
        console.error('Error deleting password:', deleteError);
        error = 'Failed to delete password.';
      } else {
        alert('Password deleted successfully');
        goto(`/companies/${companyId}/passwords`);
      }
    }
  }

  function toggleEdit() {
    isEditing = !isEditing;
    if (!isEditing) {
      editedPassword = { ...password };
    }
  }
  
    function getPhoneticPassword(pass) {
      const phonetic = {
        'a': 'alpha', 'b': 'bravo', 'c': 'charlie', 'd': 'delta', 'e': 'echo',
        'f': 'foxtrot', 'g': 'golf', 'h': 'hotel', 'i': 'india', 'j': 'juliet',
        'k': 'kilo', 'l': 'lima', 'm': 'mike', 'n': 'november', 'o': 'oscar',
        'p': 'papa', 'q': 'quebec', 'r': 'romeo', 's': 'sierra', 't': 'tango',
        'u': 'uniform', 'v': 'victor', 'w': 'whiskey', 'x': 'x-ray', 'y': 'yankee', 'z': 'zulu'
      };
      return pass.split('').map(char => phonetic[char.toLowerCase()] || char).join(' ');
    }
  
    async function copyToClipboard(text, type) {
      try {
        await navigator.clipboard.writeText(text);
        alert(`${type} copied to clipboard`);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  
    function togglePasswordReveal() {
      showPassword = !showPassword;
    }

    function toggleOtpReveal() {
        showOtp = !showOtp;
    }

    function showToast(message) {
    toastMessage = message;
    setTimeout(() => {
      toastMessage = '';
    }, 3000);
  }
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Password Details</h1>
      <div class="space-x-2">
        <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={toggleEdit}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button class="bg-yellow-500 text-white px-4 py-2 rounded" on:click={toggleArchive}>
          {password?.archived ? 'Unarchive' : 'Archive'}
        </button>
        {#if isAdmin}
          <button class="bg-red-500 text-white px-4 py-2 rounded" on:click={deletePassword}>
            Delete
          </button>
        {/if}
      </div>
    </div>
  
    {#if error}
      <p class="text-red-500">{error}</p>
    {:else if password}
    <h1 class="text-3xl font-light mb-4">{password.title}</h1>
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">USERNAME</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input type="text" readonly value={password.username} class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300" />
            <button type="button" on:click={() => copyToClipboard(password.username, 'Username')} class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
              Copy
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">PASSWORD</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input 
              type={showPassword ? "text" : "password"} 
              readonly 
              value={password.password} 
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300" 
            />
            <button type="button" on:click={togglePasswordReveal} class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {showPassword ? 'Hide' : 'Reveal'}
            </button>
            <button type="button" on:click={() => copyToClipboard(password.password, 'Password')} class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
              Copy
            </button>
          </div>
          {#if showPassword}
            <div class="mt-2 text-sm text-gray-500">
              {getPhoneticPassword(password.password)}
            </div>
          {/if}
        </div>
        
        {#if password.totp_secret}
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">ONE-TIME PASSWORD</label>
          <div class="mt-1 flex rounded-md shadow-sm">
          <input
            type={showOtp ? "text" : "password"}
            readonly
            value={totpCode.otp}
            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            />
            <button type="button" on:click={toggleOtpReveal} class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {showOtp ? 'Hide' : 'Reveal'}
              </button>
            <button type="button" on:click={() => copyToClipboard(totpCode.otp, 'TOTP Code')} class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
              Copy
            </button>
          </div>
          {#if showOtp}
          <div class="mt-2 relative pt-1">
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                style="width:{totpProgressPercentage}%"
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300 ease-linear"
              ></div>
            </div>
          </div>
          {/if}
        </div>
      {/if}
        
        {#if password.url}
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">URL</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input type="text" readonly value={password.url} class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300" />
              <button type="button" on:click={() => copyToClipboard(password.url, 'URL')} class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm">
                Copy
              </button>
            </div>
            <a href={password.url} target="_blank" rel="noopener noreferrer" class="mt-2 inline-block text-sm text-blue-500 hover:underline">
              Visit Website
            </a>
          </div>
        {/if}
        
        {#if password.notes}
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <div class="mt-1">
              <textarea readonly class="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md" rows="3">{password.notes}</textarea>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <p>Loading password details...</p>
    {/if}
  </div>

  {#if toastMessage}
    <div class="fixed bottom-4 right-18 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg" transition:fade>
        {toastMessage}
    </div>
  {/if}