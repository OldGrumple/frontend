<script>
  import { page } from '$app/stores';
  
  export let companyId;

  $: path = $page.url.pathname;
  $: isActive = (route) => path.includes(route);
</script>

<aside class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 mt-8 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
  <div class="h-full px-3 pb-4 overflow-y-auto">
    <nav>
      <ul class="space-y-2">
        <li>
          <a 
            href="/companies/{companyId}" 
            class="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 {isActive(`/companies/${companyId}`) && !isActive('passwords') && !isActive('documents') && !isActive('networks') && !isActive('assets') ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          >
            Overview
          </a>
        </li>
        <li>
          <a 
            href="/companies/{companyId}/passwords" 
            class="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 {isActive('passwords') ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          >
            Passwords
          </a>
        </li>
        <li>
          <a 
            href="/companies/{companyId}/documents" 
            class="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 {isActive('documents') ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          >
            Documents
          </a>
        </li>
        <li>
          <a 
            href="/companies/{companyId}/networks" 
            class="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 {isActive('networks') ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          >
            Networks
          </a>
        </li>
        <li>
          <a 
            href="/companies/{companyId}/assets" 
            class="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 {isActive('assets') ? 'bg-gray-100 dark:bg-gray-700' : ''}"
          >
            Assets
          </a>
        </li>
      </ul>
    </nav>
  </div>
</aside>