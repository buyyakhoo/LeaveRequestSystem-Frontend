<script lang="ts">
  import type { PageData, ActionData } from './$types'
  import { enhance } from '$app/forms'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import { leaveTypeLabel, formatDate, calcDays } from '$lib/utils'
  import type { LeaveRequest } from '$lib/types'

  let { data, form }: { data: PageData; form?: ActionData } = $props()

  const user = $derived(data.user!)
  const pendingLeaves = $derived((data.pendingLeaves ?? []) as LeaveRequest[])
</script>

<svelte:head>
  <title>จัดการคำร้องอนุมัติ — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="จัดการคำร้องอนุมัติ">
  <div class="flex flex-col flex-1 min-h-0">
    {#if pendingLeaves.length === 0}
      <div class="card bg-base-100 shadow-sm flex-1 flex items-center justify-center">
        <p class="text-base-content/50 text-sm">ไม่มีคำร้องรออนุมัติ</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each pendingLeaves as leave (leave.id)}
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body gap-4">
              <!-- Header -->
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="badge badge-outline">
                      {leaveTypeLabel[leave.leave_type] ?? leave.leave_type}
                    </span>
                    <h3 class="font-semibold text-lg">
                      {leave.employee?.first_name} {leave.employee?.last_name}
                    </h3>
                  </div>
                  <p class="text-sm text-base-content/60">
                    {leave.employee?.email}
                  </p>
                </div>
              </div>

              <div class="divider my-0"></div>

              <!-- Details -->
              <div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div class="space-y-1">
                  <p class="text-xs text-base-content/50 font-medium">วันเริ่มต้น</p>
                  <p class="text-sm font-medium">{formatDate(leave.start_date)}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-base-content/50 font-medium">วันสิ้นสุด</p>
                  <p class="text-sm font-medium">{formatDate(leave.end_date)}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-base-content/50 font-medium">จำนวนวัน</p>
                  <p class="text-sm font-medium">{calcDays(leave.start_date, leave.end_date)} วัน</p>
                </div>
              </div>

              {#if leave.delegate_name}
                <div class="space-y-1">
                  <p class="text-xs text-base-content/50 font-medium">ผู้รักษาการแทน</p>
                  <p class="text-sm">{leave.delegate_name}</p>
                </div>
              {/if}

              {#if leave.reason}
                <div class="space-y-1">
                  <p class="text-xs text-base-content/50 font-medium">เหตุผล</p>
                  <p class="text-sm whitespace-pre-wrap break-words">{leave.reason}</p>
                </div>
              {/if}

              <div class="divider my-0"></div>

              <div class="flex gap-3 justify-end">
                <form method="POST" action="?/approve" use:enhance class="flex-1">
                  <input type="hidden" name="id" value={leave.id} />
                  <button type="submit" class="btn btn-success btn-sm w-full">
                    อนุมัติ
                  </button>
                </form>
                <form method="POST" action="?/reject" use:enhance class="flex-1">
                  <input type="hidden" name="id" value={leave.id} />
                  <button type="submit" class="btn btn-error btn-sm w-full">
                    ไม่อนุมัติ
                  </button>
                </form>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</AppLayout>
