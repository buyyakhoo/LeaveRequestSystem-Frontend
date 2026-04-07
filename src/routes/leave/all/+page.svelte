<script lang="ts">
  import type { PageData } from './$types'
  import type { LeaveRequest } from '$lib/types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import LeaveStatusBadge from '$lib/components/LeaveStatusBadge.svelte'
  import { leaveTypeLabel, formatDate, calcDays } from '$lib/utils'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)
  const leaves = $derived((data.leaves ?? []) as LeaveRequest[])

  // Sort by start_date desc
  const sorted = $derived(
    [...leaves].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
  )

  let search = $state('')
  let filterStatus = $state('')
  let filterType = $state('')

  const filtered = $derived((() => {
    const q = search.trim().toLowerCase()
    return sorted.filter(l => {
      if (filterStatus && l.status !== filterStatus) return false
      if (filterType && l.leave_type !== filterType) return false
      if (q) {
        const name = `${l.employee?.first_name ?? ''} ${l.employee?.last_name ?? ''}`.toLowerCase()
        const email = (l.employee?.email ?? '').toLowerCase()
        if (!name.includes(q) && !email.includes(q)) return false
      }
      return true
    })
  })())

  function clearFilters() {
    search = ''
    filterStatus = ''
    filterType = ''
  }

  const hasFilter = $derived(!!search || !!filterStatus || !!filterType)
</script>

<svelte:head>
  <title>ประวัติการลาทั้งหมด — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="ประวัติการลาทั้งหมด">
  <div class="flex flex-col flex-1 min-h-0 card bg-base-100 shadow-sm">

    <div class="px-6 pt-5 pb-4 shrink-0 space-y-3 border-b border-base-200">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-base">คำร้องลาทั้งหมด</h2>
        <span class="text-sm text-base-content/50">
          {filtered.length}/{leaves.length} รายการ
        </span>
      </div>

      <div class="flex flex-wrap gap-2 items-end">

        <label class="input input-sm input-bordered flex items-center gap-2 w-56">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            class="grow"
            placeholder="ชื่อ หรือ อีเมล…"
            bind:value={search}
          />
        </label>

        <div class="flex flex-col gap-1">
          <span class="text-xs text-base-content/50">สถานะ</span>
          <select class="select select-sm select-bordered w-36" bind:value={filterStatus}>
            <option value="">ทั้งหมด</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ไม่อนุมัติ</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs text-base-content/50">ประเภทการลา</span>
          <select class="select select-sm select-bordered w-36" bind:value={filterType}>
            <option value="">ทั้งหมด</option>
            {#each Object.entries(leaveTypeLabel) as [key, label]}
              <option value={key}>{label}</option>
            {/each}
          </select>
        </div>

        {#if hasFilter}
          <button class="btn btn-ghost btn-sm self-end" onclick={clearFilters}>
            ล้าง filter
          </button>
        {/if}
      </div>
    </div>

    {#if filtered.length === 0}
      <p class="text-base-content/50 text-sm py-16 text-center">
        {hasFilter ? 'ไม่พบรายการที่ตรงกับการค้นหา' : 'ไม่มีข้อมูล'}
      </p>
    {:else}
      <div class="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
        <table class="table table-sm">
          <thead class="sticky top-0 bg-base-100 z-10">
            <tr>
              <th>พนักงาน</th>
              <th>ประเภท</th>
              <th>วันที่</th>
              <th class="text-center">วัน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as leave (leave.id)}
              <tr class="hover">
                <td>
                  <div class="text-sm font-medium">
                    {leave.employee?.first_name ?? ''} {leave.employee?.last_name ?? ''}
                  </div>
                  <div class="text-xs text-base-content/50">{leave.employee?.email ?? '—'}</div>
                </td>
                <td class="text-sm">{leaveTypeLabel[leave.leave_type] ?? leave.leave_type}</td>
                <td class="text-sm text-base-content/70 whitespace-nowrap">
                  {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                </td>
                <td class="text-center text-sm font-medium">
                  {calcDays(leave.start_date, leave.end_date)}
                </td>
                <td><LeaveStatusBadge status={leave.status} /></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

  </div>
</AppLayout>
