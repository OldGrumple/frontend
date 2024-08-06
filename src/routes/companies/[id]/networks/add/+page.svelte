<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { goto } from '$app/navigation';
  
    $: companyId = $page.params.id;
    let cidrRange = '';
    let parentNetworks = [];
    let networkRoles = [];
    let networkStatuses = [];
    let selectedParent = null;
    let selectedStatus = null;
    let selectedRole = null;
    let description = '';
    let comments = '';
  
    // Network details
    let usableIPs = 0;
    let mask = '';
    let maskBits = 0;
    let wildcard = '';
  
    onMount(async () => {
        await Promise.all([
            fetchParentNetworks(),
            fetchNetRoles(),
            fetchNetStatus()
        ]);
    });
  
    // Hardcoded list IDs for MVP (replace these with your actual list IDs)
    const NETWORK_STATUS_LIST_ID = '41fd8432-cd38-46d9-8021-784a1e1c342f';
    const NETWORK_ROLES_LIST_ID = '5e4f7e1f-ee39-4ec1-8a24-7f4287725dcc';

    onMount(async () => {
        await fetchParentNetworks();
        await fetchListItems();
        await fetchNetRoles();
        await fetchNetStatus();
    });

    async function fetchNetRoles() {
        const { data, error } = await supabase
            .from('list_items')
            .select('id, value')
            .eq('list_id', NETWORK_ROLES_LIST_ID);

        if (error) {
            console.error('Error fetching network roles:', error);
        } else {
            networkRoles = data;
        }
    }

    async function fetchNetStatus() {
        const { data, error } = await supabase
            .from('list_items')
            .select('id, value')
            .eq('list_id', NETWORK_STATUS_LIST_ID);

        if (error) {
            console.error('Error fetching network status:', error);
        } else {
            networkStatuses = data;
        }
    }

    async function fetchParentNetworks() {
        const { data, error } = await supabase
            .from('networks')
            .select('id, cidr_range')
            .eq('company_id', companyId);
        
        if (error) {
            console.error('Error fetching parent networks:', error);
        } else {
            parentNetworks = data;
        }
    }

    async function fetchListItems(listId, targetArray) {
        const { data, error } = await supabase
        .from('list_items')
        .select('id, value')
        .eq('list_id', listId);
        
        if (error) {
        console.error(`Error fetching list items for ${targetArray}:`, error);
        } else {
        // Using eval here for dynamic assignment. Be cautious with this approach in production.
        eval(`${targetArray} = data`);
        }
    }
  
    function calculateNetworkDetails() {
      if (!cidrRange) return;
  
      const [ip, bits] = cidrRange.split('/');
      if (!ip || !bits) return;
  
      maskBits = parseInt(bits);
      const maxBits = 32; // For IPv4
  
      // Calculate usable IPs
      usableIPs = Math.pow(2, maxBits - maskBits) - 2; // Subtract network and broadcast addresses
  
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
  
    async function createNetwork() {
    const { data, error } = await supabase
      .from('networks')
      .insert({
        company_id: companyId,
        cidr_range: cidrRange,
        parent_network_id: selectedParent,
        status_item_id: selectedStatus,  // Changed from status_id to status_item_id
        role_item_id: selectedRole,      // Changed from role_id to role_item_id
        description,
        comments
      });

    if (error) {
      console.error('Error creating network:', error);
      alert('Failed to create network. Please try again.');
    } else {
      alert('Network created successfully!');
      goto(`/companies/${companyId}/networks`);
    }
  }
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">New Network</h1>
  
    <form on:submit|preventDefault={createNetwork} class="space-y-6">
      <div>
        <label for="cidr-range" class="block text-sm font-medium text-gray-700">CIDR Range *</label>
        <div class="mt-1 flex rounded-md shadow-sm">
          <input 
            type="text" 
            id="cidr-range" 
            bind:value={cidrRange} 
            on:input={calculateNetworkDetails}
            required 
            placeholder="Enter range" 
            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
          />
          <span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            /{maskBits}
          </span>
        </div>
      </div>
  
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Usable IP Addresses</h3>
          <p class="mt-1 text-lg font-semibold">{usableIPs}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Mask</h3>
          <p class="mt-1 text-lg font-semibold">{mask}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Mask Bits</h3>
          <p class="mt-1 text-lg font-semibold">{maskBits}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Wildcard</h3>
          <p class="mt-1 text-lg font-semibold">{wildcard}</p>
        </div>
      </div>
  
      <div>
        <label for="parent-network" class="block text-sm font-medium text-gray-700">Parent Network</label>
        <select 
          id="parent-network" 
          bind:value={selectedParent}
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={null}>Select a parent</option>
          {#each parentNetworks as network}
            <option value={network.id}>{network.cidr_range}</option>
          {/each}
        </select>
      </div>
  
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select 
          id="status" 
          bind:value={selectedStatus}
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={null}>Select a status</option>
          {#each networkStatuses as status}
            <option value={status.id}>{status.value}</option>
          {/each}
        </select>
      </div>
  
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
        <select 
          id="role" 
          bind:value={selectedRole}
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={null}>Select a role</option>
          {#each networkRoles as role}
            <option value={role}>{role.value}</option>
          {/each}
        </select>
      </div>
  
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <input 
          type="text" 
          id="description" 
          bind:value={description}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
  
      <div>
        <label for="comments" class="block text-sm font-medium text-gray-700">Comments</label>
        <textarea 
          id="comments" 
          bind:value={comments}
          rows="3"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>
  
      <div>
        <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Create Network
        </button>
      </div>
    </form>
  </div>