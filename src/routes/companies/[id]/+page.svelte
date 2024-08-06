<script>
    import { page } from '$app/stores';
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabase';
    import { Editor } from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';
    import Image from '@tiptap/extension-image';
    import Table from '@tiptap/extension-table';
    import TableRow from '@tiptap/extension-table-row';
    import TableCell from '@tiptap/extension-table-cell';
    import TableHeader from '@tiptap/extension-table-header';
    import DOMPurify from 'dompurify';
  
    export let data;
  
    let company = null;
    let error = null;
    let loading = true;
    let editor;
    let editorContent = '';
  
    $: companyId = $page.params.id;
  
    onMount(async () => {
      try {
        const { data: companyData, error: supabaseError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
  
        if (supabaseError) throw supabaseError;
  
        company = {
          ...companyData,
          shortcode: generateShortcode(companyData.name)
        };
  
        // Initialize the editor
        editor = new Editor({
          element: document.querySelector('#editor'),
          extensions: [
            StarterKit,
            Image,
            Table,
            TableRow,
            TableCell,
            TableHeader,
          ],
          content: company.notes || '',
          onUpdate: ({ editor }) => {
            editorContent = editor.getHTML();
          },
        });
  
        // Load existing notes
        editorContent = company.notes || '';
      } catch (e) {
        console.error('Error fetching company:', e);
        error = 'Failed to load company details. Please try again later.';
      } finally {
        loading = false;
      }
    });
  
    onDestroy(() => {
      if (editor) {
        editor.destroy();
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
  
    async function saveNotes() {
      try {
        const sanitizedContent = DOMPurify.sanitize(editorContent);
        const { error: updateError } = await supabase
          .from('companies')
          .update({ notes: sanitizedContent })
          .eq('id', companyId);
  
        if (updateError) throw updateError;
  
        alert('Notes saved successfully!');
      } catch (e) {
        console.error('Error saving notes:', e);
        alert('Failed to save notes. Please try again.');
      }
    }
  </script>
  
  <div class="pt-10">
    {#if loading}
      <p class="text-gray-600 dark:text-gray-400">Loading company details...</p>
    {:else if error}
      <p class="text-red-500">{error}</p>
    {:else if company}
    <div class="mb-4">
        <h1 class="text-4xl font-light mb-4 text-gray-800 dark:text-white">{company.name}</h1>
        
        <span class="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">
            Shortcode: {company.shortcode}
        </span>
        <p class="text-gray-600 dark:text-gray-400">{company.description || 'No description available.'}</p>
    </div>
  
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-lighter mb-4 text-gray-800 dark:text-white">Quick Notes</h2>
        <div id="editor" class="prose max-w-none dark:prose-invert mb-4">{company.notes}
        </div>
        <button 
          on:click={saveNotes}
          class="bg-blue-500 hover:bg-blue-700 text-white font-normal py-2 px-2 rounded"
        >
          Save Notes
        </button>
      </div>
    {:else}
      <p class="text-red-500">Company not found.</p>
    {/if}
  </div>
  
  <style>
    /* Add any custom styles for the editor here */
    :global(.ProseMirror) {
      min-height: 200px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
    }
  </style>