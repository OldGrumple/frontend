<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';
  
    $: companyId = $page.params.id;
    $: networkId = $page.params.networkId;
    let network = null;
    let ipAddresses = [];
    let ipUtilization = 0;

    onMount(async () => {
      await fetchNetworkDetails();
      await fetchIPAddresses();
    });
  
    async function fetchNetworkDetails() {
        const { data, error } = await supabase
        .from('networks')
        .select(`
            *,
            status:status_item_id(value),
            role:role_item_id(value)
        `)
        .eq('id', networkId)
        .single();

        if (error) {
        console.error('Error fetching network details:', error);
        } else {
        network = data;
        calculateIPUtilization();
        }
    }

    function calculateNetworkDetails() {
      if (!cidrRange) return;
  
      const [ip, bits] = cidrRange.split('/');
      if (!ip || !bits) return;
  
      maskBits = parseInt(bits);
      const maxBits = 32; // For IPv4
    
      // Calculate mask
      const maskNum = (0xFFFFFFFF << (maxBits - maskBits)) >>> 0;
      mask = [
        (maskNum >>> 24) & 255,
        (maskNum >>> 16) & 255,
        (maskNum >>> 8) & 255,
        maskNum & 255
      ].join('.');
  
      // Calculate wildcard
      const wildcardNum = ~maskNum >>> 0;
      wildcard = [
        (wildcardNum >>> 24) & 255,
        (wildcardNum >>> 16) & 255,
        (wildcardNum >>> 8) & 255,
        wildcardNum & 255
      ].join('.');
    }

    async function fetchIPAddresses() {
        const { data, error } = await supabase
        .from('network_devices')
        .select('*')
        .eq('network_id', networkId);

        if (error) {
        console.error('Error fetching IP addresses:', error);
        } else {
        ipAddresses = data;
        calculateIPUtilization();
        }
    }
  
    function calculateIPUtilization() {
        if (network && ipAddresses) {
        const totalAddresses = Math.pow(2, 32 - parseInt(network.cidr_range.split('/')[1])) - 2; // Subtract network and broadcast addresses
        ipUtilization = ((ipAddresses.length / totalAddresses) * 100).toFixed(2);
        }
    }

    function calculateAvailableAddresses() {
        if (!network || !ipAddresses) return 0;
        const totalAddresses = Math.pow(2, 32 - parseInt(network.cidr_range.split('/')[1])) - 2; // Subtract network and broadcast addresses
        return totalAddresses - ipAddresses.length;
    }

    function goToNetworkDetail(networkId) {
        goto(`/companies/${companyId}/networks/${networkId}`);
    }


    $: usableIPAddresses = network ? Math.pow(2, 32 - parseInt(network.cidr_range.split('/')[1])) - 2 : 0;
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{network?.cidr_range}</h1>
  
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-semibold mb-4">Details</h2>
      {#if network}
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-semibold">CIDR Range</p>
            <p>{network.cidr_range}</p>
          </div>
          <div>
            <p class="font-semibold">IP Utilization</p>
            <div class="flex items-center">
              <div class="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div class="bg-green-600 h-2.5 rounded-full" style="width: {ipUtilization}%"></div>
              </div>
              <span>{ipUtilization}%</span>
            </div>
          </div>
          <div>
            <p class="font-semibold">Number of Usable IP Addresses</p>
            <p>{usableIPAddresses}</p>
          </div>
          <div>
            <p class="font-semibold">Available Addresses</p>
            <p>{calculateAvailableAddresses()}</p>
          </div>
          <div>
            <p class="font-semibold">Description</p>
            <p>{network.description || 'N/A'}</p>
          </div>
          <div>
            <p class="font-semibold">Comments</p>
            <p>{network.comments || 'N/A'}</p>
          </div>
          <div>
            <p class="font-semibold">Status</p>
            <p>{network.status?.value || 'N/A'}</p>
          </div>
          <div>
            <p class="font-semibold">Role</p>
            <p>{network.role?.value || 'N/A'}</p>
          </div>
          <div>
            <p class="font-semibold">Mask</p>
            <p>{network.mask || 'N/A'}</p>
          </div>
          <div>
            <p class="font-semibold">Wildcard</p>
            <p>{network.wildcard || 'N/A'}</p>
          </div>
          <div>
            <p class="font-semibold">Mask Bits</p>
            <p>{network.cidr_range.split('/')[1]}</p>
          </div>
        </div>
      {:else}
        <p>Loading network details...</p>
      {/if}
    </div>
  
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">IP Addresses</h2>
        <div>
          <button class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Export</button>
          <button class="bg-blue-500 text-white px-3 py-1 rounded mr-2">Import</button>
          <button class="bg-green-500 text-white px-3 py-1 rounded">+ New</button>
        </div>
      </div>
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="text-left">IP ADDRESS</th>
            <th class="text-left">Type</th>
            <th class="text-left">ASSIGNED TO</th>
          </tr>
        </thead>
        <tbody>
          {#each ipAddresses as ip}
            <tr>
              <td>{ip.ip_address}</td>
              <td>{ip.type_item_id || 'N/A'}</td>
              <td>{ip.assigned_to || 'N/A'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>