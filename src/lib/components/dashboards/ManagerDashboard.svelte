<script lang="ts">
  import { enhance } from '$app/forms'
  import StatCard from "$lib/components/StatCard.svelte"
  import { formatDate, calcDays, leaveTypeLabel } from "$lib/utils"
  import type { AuthUser } from "$lib/auth"
  import type { Employee, LeaveRequest } from "$lib/types"

  let { user, employees, pendingLeaves, allLeaves, currentManagerEmployee }: {
    user: AuthUser
    employees: Employee[]
    pendingLeaves: LeaveRequest[]
    allLeaves: LeaveRequest[]
    currentManagerEmployee: Employee | null | undefined
  } = $props()

  const activeEmployeeCount = $derived(employees.filter(e => e.status === "active").length)

  const onLeaveTodayCount = $derived((() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allLeaves.filter(l => {
      if (l.status !== "approved") return false
      const start = new Date(l.start_date)
      const end = new Date(l.end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      return start <= today && today <= end
    }).length
  })())
</script>

<!-- ─── Manager: stat cards ─────────────────────────────────────────── -->
<p class="text-sm text-base-content/70 mb-4">
  แผนก: {currentManagerEmployee?.departments?.name ?? "—"}
</p>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="พนักงานในระบบ" value={activeEmployeeCount} subtitle="Active" />
  <StatCard label="รออนุมัติ" value={pendingLeaves.length} subtitle="คำร้อง" valueClass="text-warning" />
  <StatCard label="ลาวันนี้" value={onLeaveTodayCount} subtitle="พนักงาน" valueClass="text-error" />
  <StatCard label="อนุมัติเดือนนี้" value={allLeaves.filter(l => {
    if (l.status !== "approved") return false
    const d = new Date(l.start_date)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length} subtitle="คำร้อง" valueClass="text-primary" />
</div>

<!-- ─── Manager: employee list + pending requests ──────────────────── -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

  <div class="card bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-base">รายชื่อพนักงาน</h3>
        <a href="/employees" class="text-xs text-primary hover:underline">{employees.length} คน · ดูทั้งหมด</a>
      </div>
      {#if employees.length === 0}
        <p class="text-base-content/50 text-sm py-6 text-center">ไม่มีพนักงานในแผนก</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>แผนก</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each employees.slice(0, 8) as emp (emp.id)}
                <tr class="hover">
                  <td class="text-sm font-medium">
                    {emp.first_name} {emp.last_name}
                    {#if !emp.employee_code}
                      <span class="badge badge-warning badge-xs ml-1">ไม่มีรหัส</span>
                    {/if}
                  </td>
                  <td class="text-sm text-base-content/70">{emp.departments?.name ?? "—"}</td>
                  <td>
                    {#if emp.status === "active"}
                      <span class="badge badge-success badge-sm">Active</span>
                    {:else}
                      <span class="badge badge-error badge-sm">Disabled</span>
                    {/if}
                  </td>
                  <td>
                    <a href="/employees/{emp.id}/edit" class="btn btn-ghost btn-xs">แก้ไข</a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {#if employees.length > 8}
          <div class="text-center pt-1">
            <a href="/employees" class="btn btn-ghost btn-sm w-full">
              ดูพนักงานทั้งหมด {employees.length} คน
            </a>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="card bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-base">คำร้องรออนุมัติ</h3>
        <span class="text-sm text-base-content/50">{pendingLeaves.length} รายการ</span>
      </div>
      {#if pendingLeaves.length === 0}
        <p class="text-base-content/50 text-sm py-6 text-center">ไม่มีคำร้องรออนุมัติ</p>
      {:else}
        <div class="space-y-3">
          {#each pendingLeaves as leave (leave.id)}
            <div class="border border-base-200 rounded-lg p-3 space-y-2">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="badge badge-outline badge-sm">
                    {leaveTypeLabel[leave.leave_type] ?? leave.leave_type}
                  </span>
                  <span class="text-sm font-medium">
                    {leave.employee?.first_name} {leave.employee?.last_name}
                  </span>
                </div>
                <p class="text-xs text-base-content/60">
                  {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                  <span class="ml-1">({calcDays(leave.start_date, leave.end_date)} วัน)</span>
                </p>
                {#if leave.reason}
                  <p class="text-xs text-base-content/50 truncate max-w-xs">{leave.reason}</p>
                {/if}
              </div>
              <div class="flex gap-2 justify-end">
                <form method="POST" action="?/approve" use:enhance>
                  <input type="hidden" name="id" value={leave.id} />
                  <button type="submit" class="btn btn-success btn-xs">อนุมัติ</button>
                </form>
                <form method="POST" action="?/reject" use:enhance>
                  <input type="hidden" name="id" value={leave.id} />
                  <button type="submit" class="btn btn-error btn-xs">ไม่อนุมัติ</button>
                </form>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

</div>
