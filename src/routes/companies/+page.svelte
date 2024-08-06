<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase';

  let allCompanies = [];
  let gridCompanies = [];
  let tableCompanies = [];
  let filteredTableCompanies = [];
  let error = null;
  let loading = true;
  let searchTerm = '';

  // Pagination
  let currentPage = 1;
  let itemsPerPage = 10;
  $: totalPages = Math.ceil(filteredTableCompanies.length / itemsPerPage);
  $: paginatedCompanies = filteredTableCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  onMount(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (supabaseError) {
        throw supabaseError;
      }

      allCompanies = data.map(company => ({
        ...company,
        shortcode: generateShortcode(company.name)
      }));

      updateCompaniesDisplay();
    } catch (e) {
      console.error('Error fetching companies:', e);
      error = 'Failed to load companies. Please try again later.';
    } finally {
      loading = false;
    }
  });

  function generateShortcode(name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }

  function updateCompaniesDisplay() {
    gridCompanies = allCompanies.slice(0, 24);
    tableCompanies = allCompanies.slice(24);
    filteredTableCompanies = [...allCompanies];
    currentPage = 1;
  }

  $: {
    filteredTableCompanies = allCompanies.filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.shortcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    currentPage = 1;
  }

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Companies</h1>

  {#if loading}
    <p class="text-gray-600 dark:text-gray-400">Loading companies...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <!-- Top Section: Company Grid -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Featured Companies</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {#each gridCompanies as company}
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div class="p-4">
              <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                <span class="text-lg font-bold text-gray-600 dark:text-gray-300">{company.shortcode}</span>
              </div>
              <h3 class="text-sm font-semibold mb-1 text-gray-800 dark:text-white truncate">{company.name}</h3>
              <a href="/companies/{company.id}" class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">View</a>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bottom Section: Searchable Table with Pagination -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">All Companies</h2>
      <input
        type="text"
        placeholder="Search companies..."
        bind:value={searchTerm}
        class="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
      />
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shortcode</th>
              <th class="px-6 py-3 border-b border-gray-200 dark:border-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each allCompanies as company}
              <tr>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                  <div class="text-sm leading-5 font-medium text-gray-900 dark:text-white">{company.name}</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                  <div class="text-sm leading-5 text-gray-500 dark:text-gray-400">{company.shortcode}</div>
                </td>
                <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700 text-sm leading-5 font-medium">
                  <a href="/companies/{company.id}" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600">View</a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="mt-4 flex justify-between items-center">
        <div>
          Page {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTableCompanies.length)} of {allCompanies.length} entries
        </div>
        <div class="flex space-x-2">
          <button 
            on:click={() => changePage(currentPage - 1)} 
            disabled={currentPage === 1}
            class="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          {#each Array(totalPages) as _, i}
            <button 
              on:click={() => changePage(i + 1)} 
              class="px-3 py-1 {currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded"
            >
              {i + 1}
            </button>
          {/each}
          <button 
            on:click={() => changePage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            class="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>