<script>
  import { page } from '$app/stores';
  
  export let companyId;

  $: path = $page.url.pathname;
  $: isActive = (route) => path.includes(route);
</script>

<aside class="bg-gray-100 dark:bg-gray-600 w-64 min-h-screen p-4 text-gray-200">
  <nav>
    <ul class="space-y-2">
      <li>
        <a 
          href="/companies/{companyId}" 
          class="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 {isActive(`/companies/${companyId}`) && !isActive('passwords') && !isActive('documents') && !isActive('networks') && !isActive('assets') ? 'bg-gray-200 dark:bg-gray-700' : ''}"
        >
          Overview
        </a>
      </li>
      <li>
        <a 
          href="/companies/{companyId}/passwords" 
          class="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 {isActive('passwords') ? 'bg-gray-200 dark:bg-gray-700' : ''}"
        >
          Passwords
        </a>
      </li>
      <li>
        <a 
          href="/companies/{companyId}/documents" 
          class="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 {isActive('documents') ? 'bg-gray-200 dark:bg-gray-700' : ''}"
        >
          Documents
        </a>
      </li>
      <li>
        <a 
          href="/companies/{companyId}/networks" 
          class="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 {isActive('networks') ? 'bg-gray-200 dark:bg-gray-700' : ''}"
        >
          Networks
        </a>
      </li>
      <li>
        <a 
          href="/companies/{companyId}/assets" 
          class="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 {isActive('assets') ? 'bg-gray-200 dark:bg-gray-700' : ''}"
        >
          Assets
        </a>
      </li>
    </ul>
  </nav>
</aside>