<script lang="ts">
  import { onMount } from 'svelte'
  import { Sun, Moon } from 'lucide-svelte'

  let { title }: { title: string } = $props()

  let isDark = $state(false)

  onMount(() => {
    isDark = localStorage.getItem('theme') === 'dark'
  })

  function toggleTheme() {
    isDark = !isDark
    const t = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }
</script>

<header class="h-14 bg-base-100 border-b border-base-200 flex items-center justify-between px-6 shrink-0">
  <h1 class="font-semibold text-base">{title}</h1>
  <button
    class="btn btn-ghost btn-circle btn-sm"
    onclick={toggleTheme}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {#if isDark}
      <Sun class="size-4" />
    {:else}
      <Moon class="size-4" />
    {/if}
  </button>
</header>
