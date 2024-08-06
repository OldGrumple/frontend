<script>
    import Header from '$lib/components/Header.svelte'
    import Sidebar from '$lib/components/Sidebar.svelte'
    import Footer from '$lib/components/Footer.svelte'
    import SearchModal from '$lib/components/SearchModal.svelte'

    import { user } from '$lib/stores/auth'
    import { theme } from '$lib/stores/theme'
    import { page } from '$app/stores'
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import '../app.css'
    import '../output.css';

    let searchModalOpen = false;
    let searchType = '';
  
    $: companyId = $page.params.id;
    $: showSidebar = $page.url.pathname.startsWith('/companies/') && companyId;
  
    onMount(() => {
      if ($user) {
        theme.initialize();
      }

      if (browser) {
        window.addEventListener('keydown', handleKeydown);
      }
      return() => {
        if (browser) {
            window.removeEventListener('keydown', handleKeydown);
        }
      };
    });
    
    function handleKeydown(event) {
        // Check if the user is not typing in an input field
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            if (event.key === 'o' || event.key === 'O') {
                event.preventDefault();
                openSearchModal('companies');
            } else if (event.key === 'p' || event.key === 'P') {
                event.preventDefault();
                openSearchModal('passwords');
            } else if (event.key === 'd' || event.key === 'D') {
                event.preventDefault();
                openSearchModal('documents');
            }
        }
    }

    function openSearchModal(type) {
    searchType = type;
    searchModalOpen = true;
  }

  function handleSearchResult(event) {
    const { type, data } = event.detail;
    switch (type) {
      case 'companies':
        goto(`/companies/${data.id}`);
        break;
      case 'passwords':
        goto(`/companies/${data.company_id}/passwords/${data.id}`);
        break;
      case 'documents':
        goto(`/companies/${data.company_id}/documents/${data.id}`);
        break;
    }
  }

    $: if (browser && $theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (browser) {
      document.documentElement.classList.remove('dark');
    }
  
    function toggleTheme() {
      theme.setTheme($theme === 'light' ? 'dark' : 'light');
    }
  </script>
  
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
    <Header />
  
    <div class="flex flex-1 overflow-hidden">
        {#if showSidebar}
          <Sidebar {companyId} />
        {/if}
        
        <main class="flex-1 overflow-y-auto p-4 mt-20 {showSidebar ? 'ml-24 ml-72' : ''}" style="margin-left: 16rem;">
          <slot />
        </main>
      </div>
  
    <!-- <Footer /> -->

    <SearchModal 
        isOpen={searchModalOpen} 
        {searchType}
        currentCompanyId={companyId} 
        on:close={() => searchModalOpen = false}
        on:resultSelected={handleSearchResult}
    />
  
    {#if browser}
    <button 
      type="button" 
      class="fixed z-[60] bottom-4 right-4 inline-flex flex-shrink-0 justify-center items-center gap-2 h-12 w-12 rounded-full border bg-white border-gray-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-gray-500 hover:text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800"
      on:click={() => theme.setTheme($theme === 'light' ? 'dark' : 'light')}
    >
      {#if $theme === 'light'}
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/>
        </svg>
      {:else}
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
        </svg>
      {/if}
    </button>
    {/if}
  </div>
  
  <svelte:head>
    <!-- Add any additional head elements here -->
  </svelte:head>