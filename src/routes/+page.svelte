<script lang="ts">
  import { onMount } from 'svelte'
  import { Sun, Moon, LogOut, UserRound } from 'lucide-svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const user = data.user!

  const expiresAt = data.tokenExp
    ? new Date(data.tokenExp * 1000).toLocaleString()
    : '—'

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Employee',
  }

  // ─── Theme toggle ─────────────────────────────────────────────────────────
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

<svelte:head>
  <title>Dashboard — Leave Request System</title>
</svelte:head>

<div class="min-h-screen bg-base-200">

  <!-- Navbar -->
  <nav class="navbar bg-base-100 shadow-sm px-4">
    <div class="navbar-start">
      <span class="font-bold text-lg">Leave Request System</span>
    </div>

    <div class="navbar-end gap-1">
      <!-- Theme toggle -->
      <button
        class="btn btn-ghost btn-circle"
        onclick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {#if isDark}
          <Sun class="size-5" />
        {:else}
          <Moon class="size-5" />
        {/if}
      </button>

      <!-- Avatar dropdown -->
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
            <UserRound class="size-5" />
          </div>
        </div>
        <ul class="dropdown-content menu bg-base-100 rounded-box z-10 w-60 p-2 shadow-lg mt-2">
          <li class="menu-title">
            <span class="font-semibold text-base-content">{user.first_name} {user.last_name}</span>
            <span class="text-xs font-normal text-base-content/50">{user.email}</span>
          </li>
          <li>
            <form method="POST" action="?/logout">
              <button type="submit" class="text-error flex items-center gap-2 w-full">
                <LogOut class="size-4" />
                Sign Out
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Main -->
  <main class="max-w-4xl mx-auto p-6 space-y-6">

    <!-- Welcome card -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h1 class="card-title text-2xl">
          Welcome back, {user.first_name}!
        </h1>
        <p class="text-base-content/60">You are signed in to the Leave Request System.</p>
      </div>
    </div>

    <!-- User info card -->
    <div class="card bg-base-100 shadow">
      <div class="card-body gap-4">
        <h2 class="font-semibold text-lg">Account Details</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="space-y-1">
            <p class="text-base-content/50 uppercase text-xs tracking-wide">Full Name</p>
            <p class="font-medium">{user.first_name} {user.last_name}</p>
          </div>
          <div class="space-y-1">
            <p class="text-base-content/50 uppercase text-xs tracking-wide">Employee Code</p>
            <p class="font-medium font-mono">{user.employee_code}</p>
          </div>
          <div class="space-y-1">
            <p class="text-base-content/50 uppercase text-xs tracking-wide">Email</p>
            <p class="font-medium">{user.email}</p>
          </div>
          <div class="space-y-1">
            <p class="text-base-content/50 uppercase text-xs tracking-wide">Role</p>
            <span class="badge badge-primary badge-outline">
              {roleLabel[user.role] ?? user.role}
            </span>
          </div>
          <div class="space-y-1 sm:col-span-2">
            <p class="text-base-content/50 uppercase text-xs tracking-wide">Session Expires</p>
            <p class="font-medium text-base-content/70">{expiresAt}</p>
          </div>
        </div>

        <div class="card-actions justify-end pt-2">
          <form method="POST" action="?/logout">
            <button type="submit" class="btn btn-outline btn-error btn-sm">
              <LogOut class="size-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>

  </main>
</div>
