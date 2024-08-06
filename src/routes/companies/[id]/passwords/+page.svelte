<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';

  $: companyId = $page.params.id;
  let items = [];
  let allFolders = [];
  let currentFolder = null;
  let newFolderName = '';
  let isDropdownOpen = false;
  let isCreatingFolder = false;
  let toastMessage = '';
  let isMoving = false;
  let moveTarget = null;
  let showArchived = false;

  onMount(async () => {
    await fetchAllFolders();
    await fetchItems();
  });


  async function fetchAllFolders() {
    const { data, error } = await supabase
      .from('password_folders')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching all folders:', error);
    } else {
      allFolders = data;
    }
  }

  async function fetchItems() {
    let folderQuery = supabase
      .from('password_folders')
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    let passwordQuery = supabase
      .from('passwords')
      .select('*')
      .eq('company_id', companyId)
      .order('title');

    if (currentFolder === null) {
      folderQuery = folderQuery.is('parent_folder_id', null);
      passwordQuery = passwordQuery.is('folder_id', null);
    } else {
      folderQuery = folderQuery.eq('parent_folder_id', currentFolder);
      passwordQuery = passwordQuery.eq('folder_id', currentFolder);
    }

    if (!showArchived) {
      passwordQuery = passwordQuery.is('archived', false);
    }

    const [{ data: folderData, error: folderError }, { data: passwordData, error: passwordError }] = await Promise.all([
      folderQuery,
      passwordQuery
    ]);

    if (folderError) {
      console.error('Error fetching folders:', folderError);
    }

    if (passwordError) {
      console.error('Error fetching passwords:', passwordError);
    }

    items = [
      ...(folderData || []).map(folder => ({ ...folder, type: 'folder', itemCount: 0 })),
      ...(passwordData || []).map(password => ({ ...password, type: 'password' }))
    ];

    // Calculate item count for folders
    for (let folder of items.filter(item => item.type === 'folder')) {
      const { count, error } = await supabase
        .from('passwords')
        .select('*', { count: 'exact' })
        .eq('folder_id', folder.id)
        .eq('archived', false);
      
      if (!error) {
        folder.itemCount = count;
      }
    }
  }

  async function getRecursiveItemCount(folderId) {
    let totalCount = 0;

    // Count passwords directly in this folder
    const { count: passwordCount, error: passwordError } = await supabase
      .from('passwords')
      .select('*', { count: 'exact' })
      .eq('folder_id', folderId);

    if (passwordError) {
      console.error('Error counting passwords:', passwordError);
    } else {
      totalCount += passwordCount;
    }

    // Get subfolders
    const { data: subfolders, error: folderError } = await supabase
      .from('password_folders')
      .select('id')
      .eq('parent_folder_id', folderId);

    if (folderError) {
      console.error('Error fetching subfolders:', folderError);
    } else {
      // Recursively count items in subfolders
      for (let subfolder of subfolders) {
        totalCount += await getRecursiveItemCount(subfolder.id);
      }
    }

    return totalCount;
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;

    const { data, error } = await supabase
      .from('password_folders')
      .insert({ company_id: companyId, name: newFolderName, parent_folder_id: currentFolder })
      .select();

    if (error) {
      console.error('Error creating folder:', error);
    } else {
      newFolderName = '';
      isCreatingFolder = false;
      isDropdownOpen = false;
      await fetchAllFolders();
      await fetchItems();
    }
  }

  async function deleteFolder(folderId) {
    if (!confirm('Are you sure you want to delete this folder? All items inside will be moved to the current folder.')) return;

    // Recursively delete subfolders and move their contents
    await recursiveDeleteFolder(folderId, currentFolder);

    // Delete the folder
    const { error } = await supabase
      .from('password_folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Error deleting folder:', error);
    } else {
      await fetchAllFolders();
      await fetchItems();
    }
  }

  async function recursiveDeleteFolder(folderId, newParentId) {
    // Move all passwords in this folder to the new parent
    await supabase
      .from('passwords')
      .update({ folder_id: newParentId })
      .eq('folder_id', folderId);

    // Get all subfolders
    const { data: subfolders, error } = await supabase
      .from('password_folders')
      .select('*')
      .eq('parent_folder_id', folderId);

    if (error) {
      console.error('Error fetching subfolders:', error);
      return;
    }

    // Recursively delete subfolders
    for (let subfolder of subfolders) {
      await recursiveDeleteFolder(subfolder.id, newParentId);
    }

    // Delete this folder
    await supabase
      .from('password_folders')
      .delete()
      .eq('id', folderId);
  }

  function navigateToFolder(folderId) {
    currentFolder = folderId;
    fetchItems();
  }

  async function moveItem(itemId, itemType, newFolderId) {
    let table = itemType === 'folder' ? 'password_folders' : 'passwords';
    let updateField = itemType === 'folder' ? 'parent_folder_id' : 'folder_id';

    const { error } = await supabase
      .from(table)
      .update({ [updateField]: newFolderId })
      .eq('id', itemId);

    if (error) {
      console.error(`Error moving ${itemType}:`, error);
    } else {
      showToast(`${itemType} moved successfully`);
      await fetchAllFolders();
      await fetchItems();
    }
  }

  function startMoving(item) {
    isMoving = true;
    moveTarget = item;
  }

  function cancelMove() {
    isMoving = false;
    moveTarget = null;
  }

  async function completeMove(newFolderId) {
    if (moveTarget) {
      await moveItem(moveTarget.id, moveTarget.type, newFolderId);
      cancelMove();
    }
  }
  
    function toggleDropdown() {
      isDropdownOpen = !isDropdownOpen;
      if (!isDropdownOpen) {
        isCreatingFolder = false;
        newFolderName = '';
      }
    }
  
    function startCreatingFolder() {
      isCreatingFolder = true;
    }
  
    function createPassword() {
      goto(`/companies/${companyId}/passwords/create`);
    }
  
    async function copyToClipboard(text, type) {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${type} copied to clipboard`);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }

    async function toggleArchive(item) {
    if (item.type !== 'password') return;

    const newArchivedState = !item.archived;
    const { data, error } = await supabase
      .from('passwords')
      .update({ archived: newArchivedState })
      .eq('id', item.id);

    if (error) {
      console.error('Error toggling archive state:', error);
      showToast('Failed to update archive state.');
    } else {
      item.archived = newArchivedState;
      showToast(`Password ${newArchivedState ? 'archived' : 'unarchived'} successfully.`);
      await fetchItems();
    }
  }
  
    function showToast(message) {
      toastMessage = message;
      setTimeout(() => {
        toastMessage = '';
      }, 3000);
    }

    function toggleArchived() {
    showArchived = !showArchived;
    fetchItems();
  }
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Passwords</h1>
      <div class="flex items-center">
        <label class="inline-flex items-center mr-4">
            <label class="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showArchived} 
                  on:change={toggleArchived} 
                  class="form-checkbox h-5 w-5 text-blue-600"
                >
                <span class="ml-2 text-gray-700 mr-2">Show Archived</span>
              </label>
        <div class="relative">
          <button 
            on:click={toggleDropdown}
            class="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          >
            Create New
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {#if isDropdownOpen}
            <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    {#if isCreatingFolder}
                      <form on:submit|preventDefault={createFolder} class="p-2">
                        <input 
                          bind:value={newFolderName}
                          placeholder="Folder name"
                          class="w-full p-2 border rounded mb-2"
                        />
                        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">
                          Create Folder
                        </button>
                      </form>
                    {:else}
                      <button 
                        on:click={startCreatingFolder}
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Create Folder
                      </button>
                      <button 
                        on:click={createPassword}
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Create Password
                      </button>
                    {/if}
                  </div>
            </div>
          {/if}
        </div>
      </div>
    </div>


    <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#if currentFolder !== null}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <button on:click={() => navigateToFolder(null)} class="text-blue-600 hover:text-blue-900">
                    ../ (Back)
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">Folder</td>
                <td class="px-6 py-4 whitespace-nowrap"></td>
              </tr>
            {/if}
            {#each items as item}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap {item.archived ? 'dark:bg-gray-100': '' }">
                  {#if item.type === 'folder'}
                    <button on:click={() => navigateToFolder(item.id)} class="text-blue-600 hover:text-blue-900 flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                      </svg>
                      {item.name}
                    </button>
                  {:else}
                    <a href="/companies/{companyId}/passwords/{item.id}" class="text-blue-600 hover:text-blue-900 {item.archived ? 'line-through' : ''}">
                        {item.title}
                    </a>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {item.type}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {#if isMoving}
                      <button on:click={() => completeMove(item.id)} class="text-green-600 hover:text-green-900 mr-2">Move Here</button>
                    {:else}
                      <button on:click={() => startMoving(item)} class="text-blue-600 hover:text-blue-900 mr-2">Move</button>
                    {/if}
                    {#if item.type === 'folder'}
                      <button on:click={() => deleteFolder(item.id)} class="text-red-600 hover:text-red-900 ml-2">Delete</button>
                    {:else}
                      <button on:click={() => toggleArchive(item)} class="text-yellow-600 hover:text-yellow-900 mr-2">
                        {item.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button on:click={() => copyToClipboard(item.username, 'Username')} class="text-gray-600 hover:text-gray-900 mr-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </button>
                      <button on:click={() => copyToClipboard(item.password, 'Password')} class="text-gray-600 hover:text-gray-900 mr-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </button>
                      {#if item.totp_secret}
                        <button on:click={() => copyToClipboard(item.totp_secret, 'TOTP Code')} class="text-gray-600 hover:text-gray-900">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </button>
                      {/if}
                    {/if}
                  </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    
      {#if isMoving}
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Move Item</h3>
              <div class="mt-2 px-7 py-3">
                <p class="text-sm text-gray-500">
                  Select a destination folder:
                </p>
                <select on:change={(e) => completeMove(e.target.value)} class="mt-3 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="null">Root</option>
                  {#each allFolders as folder}
                    <option value={folder.id}>{folder.name}</option>
                  {/each}
                </select>
              </div>
              <div class="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  on:click={cancelMove}
                  class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    {#if toastMessage}
      <div class="fixed bottom-4 right-18 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg" transition:fade>
        {toastMessage}
      </div>
    {/if}