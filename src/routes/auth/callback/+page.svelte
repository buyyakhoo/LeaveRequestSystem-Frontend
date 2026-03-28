<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  onMount(() => {
    goto('/', { replaceState: true })
  })
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center">
  <span class="loading loading-spinner loading-lg text-primary"></span>
</div>
