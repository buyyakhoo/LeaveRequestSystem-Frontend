<script lang="ts">
  import type { PageData } from './$types'
  import type { LeaveRequest } from '../../+page.server'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import LeaveStatusBadge from '$lib/components/LeaveStatusBadge.svelte'
  import { leaveTypeLabel, formatDate, calcDays } from '$lib/utils'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)
  const leaves = $derived(data.leaves as LeaveRequest[])
</script>

<svelte:head>
  <title>ประวัติการลา — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="ประวัติการลา">
  <div class="flex flex-col flex-1 min-h-0 card bg-base-100 shadow-sm">
    <div class="flex items-center justify-between px-6 pt-5 pb-3 shrink-0 border-b border-base-200">
      <h2 class="font-semibold text-base">ประวัติการลาทั้งหมด</h2>
      <div class="flex items-center gap-3">
        <span class="text-sm text-base-content/50">{leaves.length} รายการ</span>
        <a href="/leave/new" class="btn btn-primary btn-sm">+ ยื่นคำร้อง</a>
      </div>
    </div>

    {#if leaves.length === 0}
      <p class="text-base-content/50 text-sm py-16 text-center">ยังไม่มีประวัติการลา</p>
    {:else}
      <div class="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
        <table class="table table-sm">
          <thead class="sticky top-0 bg-base-100 z-10">
            <tr>
              <th>ประเภท</th>
              <th>วันที่เริ่ม</th>
              <th>วันที่สิ้นสุด</th>
              <th class="text-center">จำนวนวัน</th>
              <th>เหตุผล</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {#each leaves as leave (leave.id)}
              <tr class="hover">
                <td class="text-sm">{leaveTypeLabel[leave.leave_type] ?? leave.leave_type}</td>
                <td class="text-sm text-base-content/70 whitespace-nowrap">{formatDate(leave.start_date)}</td>
                <td class="text-sm text-base-content/70 whitespace-nowrap">{formatDate(leave.end_date)}</td>
                <td class="text-center text-sm font-medium">{calcDays(leave.start_date, leave.end_date)}</td>
                <td class="text-sm text-base-content/70 max-w-xs truncate">{leave.reason}</td>
                <td><LeaveStatusBadge status={leave.status} /></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</AppLayout>
