<script lang="ts">
  import { LogOut, UserRound, LayoutDashboard, ScrollText, UserPlus, CalendarOff } from 'lucide-svelte'
  import { page } from '$app/stores'
  import type { AuthUser } from '$lib/auth'

  let { user }: { user: AuthUser } = $props()

  const currentPath = $derived($page.url.pathname)

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Employee',
  }
</script>

<aside class="w-64 bg-base-100 border-r border-base-200 flex flex-col shrink-0">

  <!-- App name + role badge -->
  <div class="p-5 border-b border-base-200">
    <p class="font-bold text-lg leading-tight">Leave Request System</p>
    <span class="badge badge-outline badge-sm mt-2">{roleLabel[user.role] ?? user.role}</span>
  </div>

  <!-- Nav -->
  <nav class="flex-1 p-3">
    <ul class="menu menu-md gap-1 p-0">

      {#if user.role === 'admin'}
        <li>
          <a href="/" class={currentPath === '/' ? 'active' : ''}>
            <LayoutDashboard class="size-4" />
            Dashboard
          </a>
        </li>
        <li>
          <a href="/events" class={currentPath === '/events' ? 'active' : ''}>
            <ScrollText class="size-4" />
            Event Log
          </a>
        </li>

      {:else if user.role === 'manager'}
        <li>
          <a href="/" class={currentPath === '/' ? 'active' : ''}>
            <LayoutDashboard class="size-4" />
            Dashboard
          </a>
        </li>
        <li>
          <a href="/events" class={currentPath === '/events' ? 'active' : ''}>
            <ScrollText class="size-4" />
            Event Log
          </a>
        </li>
        <li>
          <a href="/employees/new" class={currentPath === '/employees/new' ? 'active' : ''}>
            <UserPlus class="size-4" />
            เพิ่มพนักงาน
          </a>
        </li>

      {:else}
        <li>
          <a href="/leave/new">
            <CalendarOff class="size-4" />
            แจ้งลา
          </a>
        </li>
      {/if}

    </ul>
  </nav>

  <!-- User section -->
  <div class="p-4 border-t border-base-200 space-y-3">
    <div class="flex items-center gap-3">
      <div class="bg-primary text-primary-content rounded-full size-9 flex items-center justify-center shrink-0">
        <UserRound class="size-4" />
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-sm truncate">{user.first_name} {user.last_name}</p>
        <p class="text-xs text-base-content/50 truncate">{user.email}</p>
      </div>
    </div>
    <form method="POST" action="/?/logout">
      <button type="submit" class="btn btn-outline btn-error btn-sm w-full">
        <LogOut class="size-4" />
        ออกจากระบบ
      </button>
    </form>
  </div>

</aside>
