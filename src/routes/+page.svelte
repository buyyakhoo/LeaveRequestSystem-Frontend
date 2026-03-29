<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'
  import type { Employee, LeaveRequest, LeaveSummary, EventLogEntry } from './+page.server'
  import AppLayout from '$lib/components/AppLayout.svelte'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)
  const employees = $derived((data.employees ?? []) as Employee[])
  const pendingLeaves = $derived((data.pendingLeaves ?? []) as LeaveRequest[])
  const allLeaves = $derived((data.allLeaves ?? []) as LeaveRequest[])
  const summary = $derived(data.summary as LeaveSummary | undefined)
  const myLeaves = $derived((data.myLeaves ?? []) as LeaveRequest[])

  // ─── Admin data ───────────────────────────────────────────────────────────
  const allEmployees = $derived((data.allEmployees ?? []) as Employee[])
  const recentLogs = $derived((data.recentLogs ?? []) as EventLogEntry[])

  const adminStats = $derived((() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      total: allEmployees.length,
      newThisMonth: allEmployees.filter(e => new Date(e.created_at ?? 0) >= monthStart).length,
      managers: allEmployees.filter(e => e.role === 'manager' && e.status === 'active').length,
      disabled: allEmployees.filter(e => e.status === 'disabled').length,
      logsToday: recentLogs.length,
    }
  })())

  const managers = $derived(allEmployees.filter(e => e.role === 'manager'))
  const latestLogs = $derived(recentLogs.slice(0, 10))

  // ─── Manager stats ────────────────────────────────────────────────────────
  const activeEmployeeCount = $derived(employees.filter(e => e.status === 'active').length)

  const onLeaveTodayCount = $derived((() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return allLeaves.filter(l => {
      if (l.status !== 'approved') return false
      const start = new Date(l.start_date)
      const end = new Date(l.end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      return start <= today && today <= end
    }).length
  })())

  const leaveTypeLabel: Record<string, string> = {
    sick:      'ลาป่วย',
    vacation:  'ลาพักร้อน',
    personal:  'ลากิจ',
    maternity: 'ลาคลอด',
    ordain:    'ลาอุปสมบท',
    other:     'อื่นๆ',
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit',
    })
  }

  function calcDays(start: string, end: string) {
    const diff = new Date(end).getTime() - new Date(start).getTime()
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
  }
</script>

<svelte:head>
  <title>Dashboard — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="Dashboard">
  <div class="space-y-6">

    <!-- ─── Welcome card ──────────────────────────────────────────────────── -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-4">
        <h2 class="text-lg font-semibold">Welcome back, {user.first_name}!</h2>
        <p class="text-base-content/60 text-sm">You are signed in to the Leave Request System.</p>
      </div>
    </div>

    {#if user.role === 'admin'}

      <!-- ─── Admin: stat cards ────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">ผู้ใช้งานทั้งหมด</p>
            <p class="text-3xl font-bold">{adminStats.total}</p>
            <p class="text-xs text-base-content/50">{adminStats.newThisMonth} รายการเพิ่มเดือนนี้</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">HR Officers</p>
            <p class="text-3xl font-bold text-primary">{adminStats.managers}</p>
            <p class="text-xs text-base-content/50">Active</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">Disabled Users</p>
            <p class="text-3xl font-bold text-error">{adminStats.disabled}</p>
            <p class="text-xs text-base-content/50">ลาออกแล้ว</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">Event Log วันนี้</p>
            <p class="text-3xl font-bold">{adminStats.logsToday}</p>
            <p class="text-xs text-base-content/50">entries</p>
          </div>
        </div>
      </div>

      <!-- ─── Admin: two-column tables ─────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- HR Officers list -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body gap-4">
            <h3 class="font-semibold text-base">HR Officers</h3>
            {#if managers.length === 0}
              <p class="text-base-content/50 text-sm py-6 text-center">ไม่มี Manager ในระบบ</p>
            {:else}
              <div class="overflow-x-auto">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>ชื่อ</th>
                      <th>อีเมล</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each managers as mgr (mgr.id)}
                      <tr class="hover">
                        <td class="text-sm font-medium">{mgr.first_name} {mgr.last_name}</td>
                        <td class="text-sm text-base-content/70">{mgr.email}</td>
                        <td>
                          {#if mgr.status === 'active'}
                            <span class="badge badge-success badge-sm">Active</span>
                          {:else}
                            <span class="badge badge-error badge-sm">Disabled</span>
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        </div>

        <!-- Recent event log -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body gap-4">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-base">Event Log ล่าสุด</h3>
              <a href="/events" class="text-xs text-primary hover:underline">ดูทั้งหมด</a>
            </div>
            {#if latestLogs.length === 0}
              <p class="text-base-content/50 text-sm py-6 text-center">ไม่มีข้อมูล</p>
            {:else}
              <div class="overflow-x-auto">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>ROLE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each latestLogs as log (log.id)}
                      <tr class="hover">
                        <td class="text-xs font-mono text-base-content/70">
                          {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td>
                          {#if log.actor_role === 'admin'}
                            <span class="badge badge-sm badge-primary">System Admin</span>
                          {:else if log.actor_role === 'manager'}
                            <span class="badge badge-sm badge-secondary">Manager</span>
                          {:else}
                            <span class="badge badge-sm badge-ghost">User</span>
                          {/if}
                        </td>
                        <td class="text-sm">
                          {leaveTypeLabel[log.action] ?? ({
                            ADD_USER: 'เพิ่มพนักงาน',
                            LEAVE_REQUEST: 'แจ้งลา',
                            LEAVE_APPROVE: 'อนุมัติการลา',
                            LEAVE_REJECT: 'ปฏิเสธการลา',
                            DISABLE_USER: 'ปิดบัญชี',
                            UPDATE_PROFILE: 'แก้ไขโปรไฟล์',
                          } as Record<string,string>)[log.action] ?? log.action}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        </div>

      </div>

    {:else if user.role === 'user' && summary}

      <!-- ─── User: summary cards ──────────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">รออนุมัติ</p>
            <p class="text-3xl font-bold text-warning">{summary.pending_count}</p>
            <p class="text-xs text-base-content/50">คำร้อง</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">ลาแล้วปีนี้</p>
            <p class="text-3xl font-bold text-primary">{summary.total_days_this_year}</p>
            <p class="text-xs text-base-content/50">วัน (approved)</p>
          </div>
        </div>
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

      <!-- ─── User: leave history (preview 6) ────────────────────────────── -->
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
                      <td>
                        {#if leave.status === 'approved'}
                          <span class="badge badge-success badge-sm">อนุมัติ</span>
                        {:else if leave.status === 'rejected'}
                          <span class="badge badge-error badge-sm">ไม่อนุมัติ</span>
                        {:else}
                          <span class="badge badge-warning badge-sm">รออนุมัติ</span>
                        {/if}
                      </td>
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

    {:else if user.role === 'manager'}

      <!-- ─── Manager: stat cards ─────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">พนักงานในระบบ</p>
            <p class="text-3xl font-bold">{activeEmployeeCount}</p>
            <p class="text-xs text-base-content/50">Active</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">รออนุมัติ</p>
            <p class="text-3xl font-bold text-warning">{pendingLeaves.length}</p>
            <p class="text-xs text-base-content/50">คำร้อง</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">ลาวันนี้</p>
            <p class="text-3xl font-bold text-error">{onLeaveTodayCount}</p>
            <p class="text-xs text-base-content/50">พนักงาน</p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body py-4 gap-1">
            <p class="text-xs text-base-content/50 uppercase tracking-wide">อนุมัติเดือนนี้</p>
            <p class="text-3xl font-bold text-primary">{allLeaves.filter(l => {
              if (l.status !== 'approved') return false
              const d = new Date(l.start_date)
              const now = new Date()
              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
            }).length}</p>
            <p class="text-xs text-base-content/50">คำร้อง</p>
          </div>
        </div>
      </div>

      <!-- ─── Manager: employee list + pending requests ──────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body gap-4">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-base">รายชื่อพนักงาน</h3>
              <span class="text-sm text-base-content/50">{employees.length} คน</span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {#each employees as emp (emp.id)}
                      <tr class="hover">
                        <td class="text-sm font-medium">{emp.first_name} {emp.last_name}</td>
                        <td class="text-sm text-base-content/70">{emp.departments?.name ?? '—'}</td>
                        <td>
                          {#if emp.status === 'active'}
                            <span class="badge badge-success badge-sm">Active</span>
                          {:else}
                            <span class="badge badge-error badge-sm">Disabled</span>
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
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

    {/if}

  </div>
</AppLayout>
