<script lang="ts">
  import type { PageData } from './$types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import AdminDashboard from '$lib/components/dashboards/AdminDashboard.svelte'
  import ManagerDashboard from '$lib/components/dashboards/ManagerDashboard.svelte'
  import UserDashboard from '$lib/components/dashboards/UserDashboard.svelte'
  import type { AuthUser } from '$lib/auth'
  import type { Employee, LeaveRequest, LeaveSummary, EventLog } from '$lib/types'

  let { data }: { data: PageData } = $props()

  const user: AuthUser = $derived(data.user!)
  const allEmployees: Employee[] = $derived((data.allEmployees ?? []) as Employee[])
  const recentLogs: EventLog[] = $derived((data.recentLogs ?? []) as EventLog[])
  const employees: Employee[] = $derived((data.employees ?? []) as Employee[])
  const pendingLeaves: LeaveRequest[] = $derived((data.pendingLeaves ?? []) as LeaveRequest[])
  const allLeaves: LeaveRequest[] = $derived((data.allLeaves ?? []) as LeaveRequest[])
  const summary: LeaveSummary | undefined = $derived(data.summary as LeaveSummary | undefined)
  const myLeaves: LeaveRequest[] = $derived((data.myLeaves ?? []) as LeaveRequest[])
  const currentUserEmployee: Employee | null | undefined = $derived(data.currentUserEmployee as Employee | null | undefined)
  const currentManagerEmployee: Employee | null | undefined = $derived(data.currentManagerEmployee as Employee | null | undefined) // Added

</script>

<svelte:head>
  <title>Dashboard — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="Dashboard">
  <div class="space-y-6">
    {#if user.role === 'admin'}
      <AdminDashboard {user} {allEmployees} {recentLogs} />
    {:else if user.role === 'manager'}
      <ManagerDashboard {user} {employees} {pendingLeaves} {allLeaves} {currentManagerEmployee} />
    {:else if user.role === 'user' && summary}
      <UserDashboard {user} {summary} {myLeaves} {currentUserEmployee} />
    {/if}
  </div>
</AppLayout>
