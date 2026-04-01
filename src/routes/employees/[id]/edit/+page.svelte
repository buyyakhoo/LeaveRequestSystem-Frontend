<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Alert from '$lib/components/Alert.svelte'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const user = $derived(data.user!)
  const emp = $derived(data.employee)
  const isDisabled = $derived(emp.status === 'DISABLED')
  const departments = $derived(data.departments)

  let employeeCode = $state('')
  let departmentId = $state(String(emp.departments?.id ?? ''))
  let isLoading = $state(false)
  
  $effect(() => {
    if (form) {
      employeeCode = form.employeeCode ?? ''
      departmentId = form.departmentId ?? String(emp.departments?.id ?? '')
    }
  })
</script>

<svelte:head>
  <title>แก้ไขข้อมูลพนักงาน — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="แก้ไขข้อมูลพนักงาน">
  <div class="max-w-xl mx-auto space-y-4">

    {#if form?.error}
      <Alert type="error">{form.error}</Alert>
    {/if}

    <!-- Employee info card -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body py-4 gap-1">
        <p class="font-semibold">{emp.first_name} {emp.last_name}</p>
        <a href="mailto:{emp.email}" class="text-sm text-primary hover:underline">{emp.email ?? '—'}</a>
        <p class="text-xs text-base-content/40">
          แผนกปัจจุบัน: {emp.departments?.name ?? '—'}
          · รหัสพนักงาน: {emp.employee_code ?? 'ยังไม่ได้ตั้ง'}
        </p>
      </div>
    </div>

    {#if isDisabled}
      <Alert type="info">ไม่สามารถแก้ไขข้อมูลพนักงานที่ถูกปิดการใช้งานได้</Alert>
    {/if}

    <!-- Edit form -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-5">
        <h2 class="font-semibold text-base">แก้ไขข้อมูล</h2>

        <form
          method="POST"
          use:enhance={() => {
            isLoading = true
            return async ({ update }) => {
              isLoading = false
              await update()
            }
          }}
          class="flex flex-col gap-4"
        >

          <!-- รหัสพนักงาน (แสดงเฉพาะตอน null) -->
          {#if emp.employee_code === null}
            <fieldset class="fieldset">
              <legend class="fieldset-legend">รหัสพนักงาน</legend>
              <input
                class="input input-bordered w-full font-mono"
                type="text"
                name="employeeCode"
                bind:value={employeeCode}
                placeholder="EMP001"
                disabled={isLoading || isDisabled}
              />
              <span class="fieldset-label text-base-content/50">ตั้งได้ครั้งเดียว ไม่สามารถแก้ไขภายหลัง</span>
            </fieldset>
          {:else}
            <div class="fieldset">
              <legend class="fieldset-legend text-base-content/40">รหัสพนักงาน</legend>
              <input class="input input-bordered w-full font-mono" value={emp.employee_code} disabled />
              <span class="fieldset-label text-base-content/40">ตั้งไว้แล้ว ไม่สามารถแก้ไขได้</span>
            </div>
          {/if}

          <!-- เปลี่ยนแผนก -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">แผนก</legend>
            <select
              class="select select-bordered w-full"
              name="departmentId"
              bind:value={departmentId}
              disabled={isLoading || isDisabled}
            >
              <option value="">— ไม่เปลี่ยนแปลง —</option>
              {#each departments as dept}
                <option value={String(dept.id)}>{dept.name}</option>
              {/each}
            </select>
          </fieldset>

          <div class="flex justify-end gap-2 pt-2">
            <a href="/" class="btn btn-ghost" class:pointer-events-none={isLoading}>ยกเลิก</a>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={isLoading || isDisabled || (emp.employee_code !== null && !departmentId)}
            >
              {#if isLoading}
                <span class="loading loading-spinner loading-sm"></span>
                กำลังบันทึก…
              {:else}
                บันทึก
              {/if}
            </button>
          </div>

        </form>
      </div>
    </div>

  </div>
</AppLayout>
