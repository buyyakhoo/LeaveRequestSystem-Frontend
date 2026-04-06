<script lang="ts">
  import StatCard from "$lib/components/StatCard.svelte"
  import LeaveStatusBadge from "$lib/components/LeaveStatusBadge.svelte"
  import { leaveTypeLabel, formatDate, calcDays } from "$lib/utils"
  import type { AuthUser } from "$lib/auth"
  import type { LeaveRequest, LeaveSummary } from "$lib/types"

  import type { Employee } from "$lib/types"

  let { user, summary, myLeaves, currentUserEmployee }: {
    user: AuthUser
    summary: LeaveSummary
    myLeaves: LeaveRequest[]
    currentUserEmployee: Employee | null | undefined
  } = $props()
</script>

<p class="text-sm text-base-content/70 mb-4">
  แผนก: {currentUserEmployee?.departments?.name ?? "—"}
</p>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
  <StatCard label="รออนุมัติ" value={summary.pending_count} subtitle="คำร้อง" valueClass="text-warning" />
  <StatCard label="ลาแล้วปีนี้" value={summary.total_days_this_year} subtitle="วัน (approved)" valueClass="text-primary" />
  <div class="card bg-base-100 shadow-sm col-span-2 sm:col-span-1">
    <div class="card-body py-4 gap-2">
      <p class="text-xs text-base-content/50 uppercase tracking-wide">แยกตามประเภท</p>
      {#if Object.keys(summary.by_type).length === 0}
        <p class="text-xs text-base-content/40">ยังไม่มีข้อมูล</p>
      {:else}
        {#each Object.entries(summary.by_type) as [type, days]}
          <div class="flex justify-between text-sm">
            <span class="text-base-content/70">{leaveTypeLabel[type] ?? type}</span>
            <span class="font-medium">{days} วัน</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<div class="card bg-base-100 shadow-sm">
  <div class="card-body gap-4">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-base">ประวัติการลา</h3>
      <div class="flex gap-2">
        {#if myLeaves.length > 6}
          <a href="/leave/history" class="btn btn-ghost btn-sm">ดูทั้งหมด ({myLeaves.length})</a>
        {/if}
        <a href="/leave/new" class="btn btn-primary btn-sm">+ ยื่นคำร้อง</a>
      </div>
    </div>

    {#if myLeaves.length === 0}
      <p class="text-base-content/50 text-sm py-8 text-center">ยังไม่มีประวัติการลา</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>ประเภท</th>
              <th>วันที่</th>
              <th class="text-center">วัน</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {#each myLeaves.slice(0, 6) as leave (leave.id)}
              <tr class="hover">
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
      {#if myLeaves.length > 6}
        <div class="text-center pt-1">
          <a href="/leave/history" class="btn btn-ghost btn-sm w-full">
            ดูทั้งหมด {myLeaves.length} รายการ
          </a>
        </div>
      {/if}
    {/if}
  </div>
</div>