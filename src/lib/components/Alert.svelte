<script lang="ts">
  import { CircleCheck, CircleAlert, Info } from 'lucide-svelte'
  import type { Snippet } from 'svelte'

  let { type, children }: {
    type: 'success' | 'error' | 'info'
    children: Snippet
  } = $props()
</script>

<div role="alert" class="alert alert-{type}">
  {#if type === 'success'}
    <CircleCheck class="size-5 shrink-0" />
  {:else if type === 'error'}
    <CircleAlert class="size-5 shrink-0" />
  {:else}
    <Info class="size-5 shrink-0" />
  {/if}
  <div class="text-sm">
    {@render children()}
  </div>
</div>
