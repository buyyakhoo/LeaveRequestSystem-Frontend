<script lang="ts">
  import { enhance, applyAction } from '$app/forms'
  import type { ActionData, PageData } from './$types'
  import { CircleAlert, CircleCheck } from 'lucide-svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'

  let { form, data }: { form: ActionData; data: PageData } = $props()

  const user = $derived(data.user!)

  // ─── Form state ────────────────────────────────────────────────────────────
  let leaveType = $state('')
  let startDate = $state('')
  let endDate = $state('')
  let reason = $state('')
  let delegateName = $state('')
  let isLoading = $state(false)
  let showSuccess = $state(false)

  $effect(() => {
    if (form && !form.success) {
      leaveType = form.leaveType ?? ''
      startDate = form.startDate ?? ''
      endDate = form.endDate ?? ''
      reason = form.reason ?? ''
      delegateName = form.delegateName ?? ''
    }
  })

  const leaveTypes: { value: string; label: string }[] = [
    { value: 'sick',      label: 'ลาป่วย' },
    { value: 'vacation',  label: 'ลาพักร้อน' },
    { value: 'personal',  label: 'ลากิจ' },
    { value: 'maternity', label: 'ลาคลอด' },
    { value: 'ordain',    label: 'ลาอุปสมบท' },
    { value: 'other',     label: 'อื่นๆ' },
  ]

  const today = new Date().toISOString().slice(0, 10)

  const canSubmit = $derived(
    !!leaveType && !!startDate && !!endDate && !!reason.trim() && !isLoading
  )
</script>

<svelte:head>
  <title>ยื่นคำร้องขอลา — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="ยื่นคำร้องขอลา">
  <div class="max-w-2xl mx-auto space-y-4">

    <!-- Success alert -->
    {#if showSuccess}
      <div role="alert" class="alert alert-success">
        <CircleCheck class="size-5 shrink-0" />
        <span class="text-sm">ยื่นคำร้องขอลาเรียบร้อยแล้ว รอการอนุมัติ</span>
      </div>
    {/if}

    <!-- Error alert -->
    {#if form && !form.success && form.error}
      <div role="alert" class="alert alert-error">
        <CircleAlert class="size-5 shrink-0" />
        <span class="text-sm">{form.error}</span>
      </div>
    {/if}

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-5">
        <h2 class="font-semibold text-base">ยื่นคำร้องขอลา</h2>

        <form
          method="POST"
          use:enhance={() => {
            isLoading = true
            showSuccess = false
            return async ({ result }) => {
              isLoading = false
              if (result.type === 'success') {
                leaveType = ''
                startDate = ''
                endDate = ''
                reason = ''
                delegateName = ''
                showSuccess = true
                // ไม่ใช้ applyAction สำหรับ success
                // เพื่อไม่ให้ SvelteKit internal navigation ขัดการ navigate ครั้งถัดไป
                return
              }
              await applyAction(result)
            }
          }}
          class="flex flex-col gap-4"
          novalidate
        >

          <!-- ประเภทการลา -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">ประเภทการลา <span class="text-error">*</span></legend>
            <select
              class="select select-bordered w-full"
              name="leaveType"
              bind:value={leaveType}
              required
              disabled={isLoading}
            >
              <option value="" disabled></option>
              {#each leaveTypes as lt}
                <option value={lt.value}>{lt.label}</option>
              {/each}
            </select>
          </fieldset>

          <!-- วันที่เริ่มลา + วันที่สิ้นสุด -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">วันที่เริ่มลา <span class="text-error">*</span></legend>
              <input
                class="input input-bordered w-full"
                type="date"
                name="startDate"
                bind:value={startDate}
                min={today}
                required
                disabled={isLoading}
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">วันที่สิ้นสุด <span class="text-error">*</span></legend>
              <input
                class="input input-bordered w-full {startDate && endDate && endDate < startDate ? 'input-error' : ''}"
                type="date"
                name="endDate"
                bind:value={endDate}
                min={startDate || today}
                required
                disabled={isLoading}
              />
              {#if startDate && endDate && endDate < startDate}
                <p class="fieldset-label text-error">วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มลา</p>
              {/if}
            </fieldset>
          </div>

          <!-- เหตุผลการลา -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">เหตุผลการลา <span class="text-error">*</span></legend>
            <input
              class="input input-bordered w-full"
              type="text"
              name="reason"
              bind:value={reason}
              placeholder="ระบุเหตุผล"
              required
              disabled={isLoading}
            />
          </fieldset>

          <!-- ผู้ประสานงานแทน -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">ผู้ประสานงานแทน <span class="text-base-content/40 font-normal text-xs">(ถ้ามี)</span></legend>
            <input
              class="input input-bordered w-full"
              type="text"
              name="delegateName"
              bind:value={delegateName}
              placeholder="ชื่อผู้รับงานแทน"
              disabled={isLoading}
            />
          </fieldset>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-2">
            <a href="/" class="btn btn-ghost" class:pointer-events-none={isLoading}>
              ยกเลิก
            </a>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={!canSubmit}
            >
              {#if isLoading}
                <span class="loading loading-spinner loading-sm"></span>
                กำลังส่ง…
              {:else}
                ยื่นคำร้อง
              {/if}
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</AppLayout>
