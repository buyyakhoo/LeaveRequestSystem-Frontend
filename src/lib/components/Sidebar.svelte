<script lang="ts">
  import { LogOut, UserRound, LayoutDashboard, ScrollText, UserPlus, CalendarOff, ShieldPlus, Clock, TrendingUp, TrendingDown, UserX } from 'lucide-svelte'
  import { page } from '$app/state'
  import type { AuthUser } from '$lib/auth'
  import { roleLabel } from '$lib/utils'

  let { user, onClose }: { user: AuthUser; onClose?: () => void } = $props()

  const currentPath = $derived(page.url.pathname)
</script>

<aside class="w-64 h-full bg-base-100 border-r border-base-200 flex flex-col">

  <!-- App name + role badge -->
  <div class="p-5 border-b border-base-200">
    <p class="font-bold text-lg leading-tight">Leave Request System</p>
    <span class="badge badge-outline badge-sm mt-2">{roleLabel[user.role] ?? user.role}</span>
  </div>

  <!-- Nav -->
  <nav class="flex-1 p-3 overflow-y-auto">
    <ul class="menu menu-md gap-1 p-0">

      {#if user.role === 'admin'}
        <li>
          <a href="/" class={currentPath === '/' ? 'active' : ''} onclick={onClose}>
            <LayoutDashboard class="size-4" />
            Dashboard
          </a>
        </li>
        <li>
          <a href="/events" class={currentPath === '/events' ? 'active' : ''} onclick={onClose}>
            <ScrollText class="size-4" />
            Event Log
          </a>
        </li>
        <li>
          <a href="/promote" class={currentPath === '/promote' ? 'active' : ''} onclick={onClose}>
            <TrendingUp class="size-4" />
            เลื่อนยศเป็น Manager
          </a>
        </li>
        <li>
          <a href="/demote" class={currentPath === '/demote' ? 'active' : ''} onclick={onClose}>
            <TrendingDown class="size-4" />
            ลดระดับ Manager
          </a>
        </li>
        <li>
          <a href="/managers/new" class={currentPath === '/managers/new' ? 'active' : ''} onclick={onClose}>
            <ShieldPlus class="size-4" />
            เพิ่ม Manager
          </a>
        </li>

      {:else if user.role === 'manager'}
        <li>
          <a href="/" class={currentPath === '/' ? 'active' : ''} onclick={onClose}>
            <LayoutDashboard class="size-4" />
            Dashboard
          </a>
        </li>
        <li>
          <a href="/leave/all" class={currentPath === '/leave/all' ? 'active' : ''} onclick={onClose}>
            <CalendarOff class="size-4" />
            ประวัติการลา
          </a>
        </li>
        <li>
          <a href="/employees" class={currentPath === '/employees' ? 'active' : ''} onclick={onClose}>
            <UserRound class="size-4" />
            พนักงานทั้งหมด
          </a>
        </li>
        <li>
          <a href="/employees/new" class={currentPath === '/employees/new' ? 'active' : ''} onclick={onClose}>
            <UserPlus class="size-4" />
            เพิ่มพนักงาน
          </a>
        </li>
        <li>
          <a href="/resign" class={currentPath === '/resign' ? 'active' : ''} onclick={onClose}>
            <UserX class="size-4" />
            บันทึกการลาออก
          </a>
        </li>
        <li>
          <a href="/events" class={currentPath === '/events' ? 'active' : ''} onclick={onClose}>
            <ScrollText class="size-4" />
            Event Log
          </a>
        </li>

      {:else}
        <li>
          <a href="/" class={currentPath === '/' ? 'active' : ''} onclick={onClose}>
            <LayoutDashboard class="size-4" />
            Dashboard
          </a>
        </li>
        <li>
          <a href="/leave/new" class={currentPath === '/leave/new' ? 'active' : ''} onclick={onClose}>
            <CalendarOff class="size-4" />
            แจ้งลา
          </a>
        </li>
        <li>
          <a href="/leave/history" class={currentPath === '/leave/history' ? 'active' : ''} onclick={onClose}>
            <Clock class="size-4" />
            ประวัติการลา
          </a>
        </li>
      {/if}

    </ul>
  </nav>

  <!-- User section — คลิกเพื่อไปหน้า Profile -->
  <div class="p-4 border-t border-base-200 space-y-3">
    <a
      href="/profile"
      onclick={onClose}
      class="flex items-center gap-3 rounded-lg p-1 hover:bg-base-200 transition-colors"
    >
      <div class="bg-primary text-primary-content rounded-full size-9 flex items-center justify-center shrink-0">
        <UserRound class="size-4" />
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-sm truncate">{user.first_name} {user.last_name}</p>
        <p class="text-xs text-base-content/50 truncate">{user.email}</p>
      </div>
    </a>
    <form method="POST" action="/?/logout">
      <button type="submit" class="btn btn-outline btn-error btn-sm w-full">
        <LogOut class="size-4" />
        ออกจากระบบ
      </button>
    </form>
  </div>

</aside>
