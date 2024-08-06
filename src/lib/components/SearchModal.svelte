<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { supabase } from '$lib/supabase';

  export let isOpen = false;
  export let searchType = '';

  let searchTerm = '';
  let results = [];
  let loading = false;
  let searchGlobally = false;
  let selectedIndex = -1;
  export let currentCompanyId = null;

  const dispatch = createEventDispatcher();

  $: if (isOpen) {
    searchTerm = '';
    results = [];
    searchGlobally = false;
    selectedIndex = -1;
  }

  onMount(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  async function handleSearch() {
    loading = true;
    let query;

    switch (searchType) {
      case 'companies':
        query = supabase
          .from('companies')
          .select('id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(10);
        break;
      case 'passwords':
        query = supabase
          .from('passwords')
          .select('id, title, company_id')
          .ilike('title', `%${searchTerm}%`)
          .limit(10);
        if (!searchGlobally) {
          query = query.eq('company_id', currentCompanyId); // You need to define currentCompanyId
        }
        break;
      case 'documents':
        query = supabase
          .from('documents')
          .select('id, title, company_id')
          .ilike('title', `%${searchTerm}%`)
          .limit(10);
        if (!searchGlobally) {
          query = query.eq('company_id', currentCompanyId); // You need to define currentCompanyId
        }
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching:', error);
    } else {
      results = data;
    }

    loading = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      dispatch('close');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % results.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex = (selectedIndex - 1 + results.length) % results.length;
    } else if (event.key === 'Enter' && selectedIndex !== -1) {
      handleResultClick(results[selectedIndex]);
    }
  }

  function handleResultClick(result) {
    dispatch('resultSelected', { type: searchType, data: result });
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" on:click={() => dispatch('close')} transition:fade={{ duration: 200 }}>
    <div 
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
      on:click|stopPropagation
      transition:fly="{{ y: -50, duration: 200 }}"
    >
      <div class="p-4">
        <input
          type="text"
          placeholder="Search {searchType}..."
          bind:value={searchTerm}
          on:input={handleSearch}
          class="w-full text-lg bg-transparent border-none outline-none dark:text-white"
          autofocus
        />
      </div>
      {#if searchType !== 'companies'}
        <div class="px-4 pb-2">
          <label class="inline-flex items-center">
            <input type="checkbox" bind:checked={searchGlobally} on:change={handleSearch} class="form-checkbox h-5 w-5 text-blue-600" />
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Search all {searchType}</span>
          </label>
        </div>
      {/if}
      {#if loading}
        <div class="px-4 py-2 text-gray-500 dark:text-gray-400">Searching...</div>
      {:else if results.length > 0}
        <ul class="max-h-96 overflow-y-auto">
          {#each results as result, index}
            <li 
              class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer {index === selectedIndex ? 'bg-blue-100 dark:bg-blue-800' : ''}"
              on:click={() => handleResultClick(result)}
            >
              <div class="flex items-center">
                <span class="text-gray-800 dark:text-gray-200">{result.title || result.name}</span>
              </div>
            </li>
          {/each}
        </ul>
      {:else if searchTerm}
        <div class="px-4 py-2 text-gray-500 dark:text-gray-400">No results found</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .overflow-y-auto {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
</style>