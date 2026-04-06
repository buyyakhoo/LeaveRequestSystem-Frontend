<script lang="ts">
  import type { PageData } from './$types'
  import type { Employee } from '$lib/types'
  import AppLayout from '$lib/components/AppLayout.svelte'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)
  const employees = $derived((data.employees ?? []) as Employee[])

  let search = $state('')

  const filtered = $derived((() => {
    const q = search.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(e =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      (e.email ?? '').toLowerCase().includes(q) ||
      (e.employee_code ?? '').toLowerCase().includes(q)
    )
  })())
</script>

<svelte:head>
  <title>รายชื่อพนักงาน — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="รายชื่อพนักงาน">
  <div class="flex flex-col flex-1 min-h-0 card bg-base-100 shadow-sm">

    <!-- Header + search -->
    <div class="px-6 pt-5 pb-4 shrink-0 space-y-3 border-b border-base-200">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-base">พนักงานทั้งหมด</h2>
        <span class="text-sm text-base-content/50">
          {filtered.length}/{employees.length} คน
        </span>
      </div>

      <label class="input input-bordered flex items-center gap-2 w-full max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          class="grow"
          placeholder="ค้นหาชื่อ, รหัสพนักงาน, อีเมล…"
          bind:value={search}
        />
        {#if search}
          <button class="btn btn-ghost btn-xs px-1" onclick={() => search = ''}>✕</button>
        {/if}
      </label>
    </div>

    {#if filtered.length === 0}
      <p class="text-base-content/50 text-sm py-16 text-center">
        {search ? 'ไม่พบพนักงานที่ตรงกับการค้นหา' : 'ไม่มีพนักงานในระบบ'}
      </p>
    {:else}
      <div class="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
        <table class="table table-sm">
          <thead class="sticky top-0 bg-base-100 z-10">
            <tr>
              <th>ชื่อ</th>
              <th>รหัสพนักงาน</th>
              <th>อีเมล</th>
              <th>แผนก</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as emp (emp.id)}
              <tr class="hover">
                <td class="text-sm font-medium">{emp.first_name} {emp.last_name}</td>
                <td class="text-sm font-mono">
                  {#if emp.employee_code}
                    {emp.employee_code}
                  {:else}
                    <span class="badge badge-warning badge-sm">ยังไม่ตั้ง</span>
                  {/if}
                </td>
                <td class="text-sm text-base-content/70">{emp.email}</td>
                <td class="text-sm text-base-content/70">{emp.departments?.name ?? '—'}</td>
                <td>
                  {#if emp.status === 'active'}
                    <span class="badge badge-success badge-sm">Active</span>
                  {:else}
                    <span class="badge badge-error badge-sm">Disabled</span>
                  {/if}
                </td>
                <td>
                  <a
                    href="/employees/{emp.id}/edit"
                    class="btn btn-ghost btn-xs {emp.status === 'disabled' ? 'pointer-events-none text-base-content/30' : ''}"
                  >แก้ไข</a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

  </div>
</AppLayout>
