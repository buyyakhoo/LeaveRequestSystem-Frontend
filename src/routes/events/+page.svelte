<script lang="ts">
  import type { PageData } from './$types'
  import type { EventLog } from './+page.server'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import TopBar from '$lib/components/TopBar.svelte'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)
  const logs = $derived(data.logs as EventLog[])

  const actionLabel: Record<string, string> = {
    ADD_USER:       'เพิ่มพนักงาน',
    DISABLE_USER:   'ปิดบัญชีพนักงาน',
    UPDATE_PROFILE: 'แก้ไขโปรไฟล์',
    LEAVE_REQUEST:  'แจ้งลา',
    LEAVE_APPROVE:  'อนุมัติการลา',
    LEAVE_REJECT:   'ปฏิเสธการลา',
  }

  function formatTimestamp(ts: string) {
    const d = new Date(ts)
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + '\n'
      + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  function getTarget(log: EventLog): string {
    if (log.detail && typeof log.detail === 'object' && 'email' in log.detail) {
      return log.detail.email as string
    }
    if (log.target_id) return log.target_id.slice(0, 8) + '…'
    return '—'
  }
</script>

<svelte:head>
  <title>Event Log — Leave Request System</title>
</svelte:head>

<div class="flex h-screen overflow-hidden">

  <Sidebar {user} />

  <div class="flex-1 flex flex-col min-w-0 bg-base-200">
    <TopBar title="Event Log" />

    <main class="flex-1 p-6 overflow-y-auto">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body gap-4">

          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-base">Event Log ทั้งหมด</h2>
            <span class="text-sm text-base-content/50">{logs.length} รายการ</span>
          </div>

          {#if logs.length === 0}
            <p class="text-base-content/50 text-sm py-8 text-center">ไม่มีข้อมูล</p>
          {:else}
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>USER</th>
                    <th>ACTION</th>
                    <th>TARGET</th>
                    <th>RESULT</th>
                  </tr>
                </thead>
                <tbody>
                  {#each logs as log (log.id)}
                    <tr class="hover">
                      <td class="whitespace-pre text-xs text-base-content/70 font-mono">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td class="text-sm">
                        {log.actor?.email ?? '—'}
                      </td>
                      <td class="text-sm">
                        {actionLabel[log.action] ?? log.action}
                      </td>
                      <td class="text-sm text-base-content/70">
                        {getTarget(log)}
                      </td>
                      <td>
                        {#if log.result === 'success'}
                          <span class="badge badge-success badge-sm">SUCCESS</span>
                        {:else}
                          <span class="badge badge-error badge-sm">{log.result.toUpperCase()}</span>
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
    </main>
  </div>

</div>
