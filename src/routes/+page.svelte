<script lang="ts">
  import type { PageData } from './$types'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import TopBar from '$lib/components/TopBar.svelte'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)

  const expiresAt = $derived(
    data.tokenExp ? new Date(data.tokenExp * 1000).toLocaleString() : '—'
  )

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Employee',
  }
</script>

<svelte:head>
  <title>Dashboard — Leave Request System</title>
</svelte:head>

<div class="flex h-screen overflow-hidden">

  <Sidebar {user} />

  <div class="flex-1 flex flex-col min-w-0 bg-base-200">
    <TopBar title="Dashboard" />

    <main class="flex-1 p-6 space-y-6 overflow-y-auto">

      <!-- Welcome card -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title text-xl">Welcome back, {user.first_name}!</h2>
          <p class="text-base-content/60">You are signed in to the Leave Request System.</p>
        </div>
      </div>

      <!-- Account details -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-4">
          <h3 class="font-semibold text-base">Account Details</h3>
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
        </div>
      </div>

    </main>
  </div>

</div>
