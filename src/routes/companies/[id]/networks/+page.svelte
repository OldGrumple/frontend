<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { goto } from '$app/navigation';
  
    $: companyId = $page.params.id;
    let networks = [];
    let companyName = '';
  
    onMount(async () => {
      await fetchNetworks();
      await fetchCompanyName();
    });
  
    async function fetchNetworks() {
      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .eq('company_id', companyId);
  
      if (error) {
        console.error('Error fetching networks:', error);
      } else {
        networks = await Promise.all(data.map(async (network) => {
          const { data: ipUtilization } = await supabase
            .rpc('calculate_ip_utilization', { network_id: network.id });
          return { ...network, ip_utilization: ipUtilization };
        }));
      }
    }
  
    async function fetchCompanyName() {
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
  
      if (error) {
        console.error('Error fetching company name:', error);
      } else {
        companyName = data.name;
      }
    }
  
    function goToNetworkDetail(networkId) {
      goto(`/companies/${companyId}/networks/${networkId}`);
    }
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <!-- ... (previous content remains the same) ... -->
  
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      {#each networks as network}
        <div class="border-b border-gray-200 last:border-b-0">
          <div class="p-4 flex items-center">
            <div class="flex-grow">
              <h2 class="text-lg font-semibold">
                <button 
                  class="text-blue-600 hover:underline"
                  on:click={() => goToNetworkDetail(network.id)}
                >
                  {network.cidr_range}
                </button>
              </h2>
              <p class="text-gray-600">{network.description || 'No description'}</p>
            </div>
            <div class="w-1/3">
              <div class="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <p>TODO:// Fix</p>
                <div 
                  class="bg-green-600 h-2.5 rounded-full" 
                  style="width: {network.ip_utilization}%"
                ></div>
              </div>
              <p class="text-right mt-1 text-sm text-gray-600">{network.ip_utilization}%</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>