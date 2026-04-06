<script lang="ts">
  import StatCard from "$lib/components/StatCard.svelte"
  import { actionLabel } from "$lib/utils"
  import type { AuthUser } from "$lib/auth"
  import type { Employee, EventLog } from "$lib/types"

  let { user, allEmployees, recentLogs }: {
    user: AuthUser
    allEmployees: Employee[]
    recentLogs: EventLog[]
  } = $props()

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
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="ผู้ใช้งานทั้งหมด" value={adminStats.total} subtitle="{adminStats.newThisMonth} รายการเพิ่มเดือนนี้" />
  <StatCard label="Manager" value={adminStats.managers} subtitle="Active" valueClass="text-primary" />
  <StatCard label="Disabled Users" value={adminStats.disabled} subtitle="ลาออกแล้ว" valueClass="text-error" />
  <StatCard label="Event Log วันนี้" value={adminStats.logsToday} subtitle="entries" />
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

  <div class="card bg-base-100 shadow-sm">
    <div class="card-body gap-4">
      <h3 class="font-semibold text-base">Manager</h3>
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
                  <td class="text-sm">{actionLabel[log.action] ?? log.action}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>

</div>
