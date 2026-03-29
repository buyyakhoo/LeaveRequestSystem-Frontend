<script lang="ts">
  import { enhance, applyAction } from '$app/forms'
  import type { ActionData, PageData } from './$types'
  import { Eye, EyeOff, CircleAlert, CircleCheck, Info } from 'lucide-svelte'
  import { validatePassword } from '$lib/auth'
  import AppLayout from '$lib/components/AppLayout.svelte'

  let { form, data }: { form: ActionData; data: PageData } = $props()

  const user = $derived(data.user!)
  const departments = $derived(data.departments ?? [])

  let firstName = $state('')
  let lastName = $state('')
  let email = $state('')
  let employeeCode = $state('')
  let departmentId = $state('')
  let password = $state('')
  let showPassword = $state(false)
  let isLoading = $state(false)

  $effect(() => {
    if (form && !form.success) {
      firstName = form.firstName ?? ''
      lastName = form.lastName ?? ''
      email = form.email ?? ''
      employeeCode = form.employeeCode ?? ''
      departmentId = form.departmentId ?? ''
    }
  })

  const pwResult = $derived(password ? validatePassword(password) : null)

  const canSubmit = $derived(
    !!firstName && !!lastName && !!email && !!departmentId && !!password &&
    (pwResult === null || pwResult.valid) && !isLoading
  )
</script>

<svelte:head>
  <title>เพิ่ม Manager — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="เพิ่ม Manager">
  <div class="max-w-2xl mx-auto space-y-4">

    <div role="alert" class="alert alert-info">
      <Info class="size-5 shrink-0" />
      <span class="text-sm">Manager ที่เพิ่มจะได้รับสิทธิ์ดูแลแผนกที่เลือก และสามารถอนุมัติการลาของพนักงานในแผนกนั้น</span>
    </div>

    {#if form?.success}
      <div role="alert" class="alert alert-success">
        <CircleCheck class="size-5 shrink-0" />
        <span class="text-sm">เพิ่ม Manager เรียบร้อยแล้ว</span>
      </div>
    {/if}

    {#if form && !form.success && form.error}
      <div role="alert" class="alert alert-error">
        <CircleAlert class="size-5 shrink-0" />
        <span class="text-sm">{form.error}</span>
      </div>
    {/if}

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-5">
        <h2 class="font-semibold text-base">ข้อมูล Manager ใหม่</h2>

        <form
          method="POST"
          use:enhance={() => {
            isLoading = true
            return async ({ result }) => {
              isLoading = false
              if (result.type === 'success') {
                firstName = ''
                lastName = ''
                email = ''
                employeeCode = ''
                departmentId = ''
                password = ''
              }
              await applyAction(result)
            }
          }}
          class="flex flex-col gap-4"
          novalidate
        >

          <!-- ชื่อ + นามสกุล -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">ชื่อ <span class="text-error">*</span></legend>
              <input
                class="input input-bordered w-full"
                type="text"
                name="firstName"
                bind:value={firstName}
                placeholder="สมหญิง"
                required
                disabled={isLoading}
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">นามสกุล <span class="text-error">*</span></legend>
              <input
                class="input input-bordered w-full"
                type="text"
                name="lastName"
                bind:value={lastName}
                placeholder="ใจดี"
                required
                disabled={isLoading}
              />
            </fieldset>
          </div>

          <!-- อีเมล -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">อีเมล <span class="text-error">*</span></legend>
            <input
              class="input input-bordered w-full {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'input-error' : ''}"
              type="email"
              name="email"
              bind:value={email}
              placeholder="manager@kmitl.ac.th"
              autocomplete="off"
              required
              disabled={isLoading}
            />
            {#if email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
              <p class="fieldset-label text-error">กรุณาระบุอีเมลที่ถูกต้อง</p>
            {/if}
          </fieldset>

          <!-- แผนก + รหัสพนักงาน -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">แผนกที่ดูแล <span class="text-error">*</span></legend>
              <select
                class="select select-bordered w-full"
                name="departmentId"
                bind:value={departmentId}
                required
                disabled={isLoading}
              >
                <option value="" disabled>เลือกแผนก</option>
                {#each departments as dept}
                  <option value={String(dept.id)}>{dept.name}</option>
                {/each}
              </select>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">รหัสพนักงาน <span class="text-base-content/40 font-normal text-xs">(ไม่บังคับ)</span></legend>
              <input
                class="input input-bordered w-full font-mono"
                type="text"
                name="employeeCode"
                bind:value={employeeCode}
                placeholder="MGR001"
                disabled={isLoading}
              />
            </fieldset>
          </div>

          <!-- รหัสผ่าน -->
          <fieldset class="fieldset">
            <legend class="fieldset-legend">รหัสผ่าน <span class="text-error">*</span></legend>
            <label class="input input-bordered w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                bind:value={password}
                placeholder="••••••••"
                autocomplete="new-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                class="btn btn-ghost btn-xs px-1"
                onclick={() => (showPassword = !showPassword)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {#if showPassword}
                  <EyeOff class="size-4 opacity-60" />
                {:else}
                  <Eye class="size-4 opacity-60" />
                {/if}
              </button>
            </label>

            {#if pwResult}
              <ul class="mt-2 space-y-1">
                {#each pwResult.errors as err}
                  <li class="fieldset-label text-error flex items-center gap-1">
                    <CircleAlert class="size-3 shrink-0" />
                    {err}
                  </li>
                {/each}
                {#if pwResult.valid}
                  <li class="fieldset-label text-success flex items-center gap-1">
                    <CircleCheck class="size-3 shrink-0" />
                    รหัสผ่านผ่านนโยบายความปลอดภัย
                  </li>
                {/if}
              </ul>
            {/if}
          </fieldset>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-2">
            <a href="/" class="btn btn-ghost" class:pointer-events-none={isLoading}>
              ยกเลิก
            </a>
            <button type="submit" class="btn btn-primary" disabled={!canSubmit}>
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
