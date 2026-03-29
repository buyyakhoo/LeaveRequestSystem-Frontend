<script lang="ts">
  import type { PageData } from './$types'
  import type { EventLog } from './+page.server'
  import AppLayout from '$lib/components/AppLayout.svelte'

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

  // ─── Filter state ──────────────────────────────────────────────────────────
  let filterAction = $state('')
  let filterFrom = $state('')
  let filterTo = $state('')

  const filtered = $derived(logs.filter(log => {
    if (filterAction && log.action !== filterAction) return false
    if (filterFrom && new Date(log.timestamp) < new Date(filterFrom)) return false
    if (filterTo) {
      const toEnd = new Date(filterTo)
      toEnd.setHours(23, 59, 59, 999)
      if (new Date(log.timestamp) > toEnd) return false
    }
    return true
  }))

  function formatTimestamp(ts: string) {
    const d = new Date(ts)
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + '\n'
      + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  function getTarget(log: EventLog): string {
    if (log.target_email) return log.target_email
    if (log.detail && typeof log.detail === 'object' && 'email' in log.detail) {
      return log.detail.email as string
    }
    if (log.target_id) return log.target_id.slice(0, 8) + '…'
    return '—'
  }

  function clearFilters() {
    filterAction = ''
    filterFrom = ''
    filterTo = ''
  }

  const hasFilter = $derived(!!filterAction || !!filterFrom || !!filterTo)
</script>

<svelte:head>
  <title>Event Log — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="Event Log">
  <div class="flex flex-col flex-1 min-h-0 card bg-base-100 shadow-sm">

    <!-- Header + filters -->
    <div class="px-6 pt-5 pb-4 shrink-0 space-y-3 border-b border-base-200">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-base">Event Log ทั้งหมด</h2>
        <span class="text-sm text-base-content/50">
          {filtered.length}/{logs.length} รายการ
        </span>
      </div>

      <div class="flex flex-wrap gap-2 items-end">
        <!-- Action filter -->
        <div class="flex flex-col gap-1">
          <span class="text-xs text-base-content/50">Action</span>
          <select
            class="select select-sm select-bordered w-44"
            bind:value={filterAction}
          >
            <option value="">ทั้งหมด</option>
            {#each Object.entries(actionLabel) as [key, label]}
              <option value={key}>{label}</option>
            {/each}
          </select>
        </div>

        <!-- From date -->
        <div class="flex flex-col gap-1">
          <span class="text-xs text-base-content/50">ตั้งแต่วันที่</span>
          <input
            type="date"
            class="input input-sm input-bordered"
            bind:value={filterFrom}
          />
        </div>

        <!-- To date -->
        <div class="flex flex-col gap-1">
          <span class="text-xs text-base-content/50">ถึงวันที่</span>
          <input
            type="date"
            class="input input-sm input-bordered"
            bind:value={filterTo}
            min={filterFrom}
          />
        </div>

        {#if hasFilter}
          <button class="btn btn-ghost btn-sm self-end" onclick={clearFilters}>
            ล้าง filter
          </button>
        {/if}
      </div>
    </div>

    {#if filtered.length === 0}
      <p class="text-base-content/50 text-sm py-16 text-center">ไม่มีข้อมูลที่ตรงกับ filter</p>
    {:else}
      <div class="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
        <table class="table table-sm">
          <thead class="sticky top-0 bg-base-100 z-10">
            <tr>
              <th>TIMESTAMP</th>
              <th>USER</th>
              <th>ACTION</th>
              <th>TARGET</th>
              <th>RESULT</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as log (log.id)}
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
</AppLayout>
