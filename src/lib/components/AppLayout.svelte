<script lang="ts">
  import type { Snippet } from 'svelte'
  import Sidebar from './Sidebar.svelte'
  import TopBar from './TopBar.svelte'
  import type { AuthUser } from '$lib/auth'

  let { user, title, children }: {
    user: AuthUser
    title: string
    children: Snippet
  } = $props()

  let sidebarOpen = $state(false)
</script>

<!-- Mobile backdrop -->
{#if sidebarOpen}
  <button
    class="fixed inset-0 bg-black/40 z-20 lg:hidden cursor-default"
    onclick={() => sidebarOpen = false}
    aria-label="ปิด sidebar"
  ></button>
{/if}

<div class="flex h-screen overflow-hidden">

  <!-- Sidebar: always visible lg+, slide-in drawer on mobile -->
  <div class="fixed lg:static inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out
              {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}">
    <Sidebar {user} onClose={() => sidebarOpen = false} />
  </div>

  <!-- Main area -->
  <div class="flex-1 flex flex-col min-w-0 bg-base-200 overflow-hidden">
    <TopBar {title} onMenuClick={() => sidebarOpen = !sidebarOpen} />
    <main class="flex-1 overflow-y-auto p-6 flex flex-col">
      {@render children()}
    </main>
  </div>

</div>
