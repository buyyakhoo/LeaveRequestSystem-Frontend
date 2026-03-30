<script lang="ts">
  import { enhance, applyAction } from '$app/forms'
  import type { ActionData, PageData } from './$types'
  import { validatePassword } from '$lib/auth'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Alert from '$lib/components/Alert.svelte'
  import PasswordInput from '$lib/components/PasswordInput.svelte'

  let { form, data }: { form: ActionData; data: PageData } = $props()

  const user = $derived(data.user!)
  const department = $derived(data.department)

  // ─── Form state ────────────────────────────────────────────────────────────
  let firstName = $state('')
  let lastName = $state('')
  let email = $state('')
  let employeeCode = $state('')
  let password = $state('')
  let isLoading = $state(false)

  $effect(() => {
    if (form && !form.success) {
      firstName = form.firstName ?? ''
      lastName = form.lastName ?? ''
      email = form.email ?? ''
      employeeCode = form.employeeCode ?? ''
    }
  })

  const pwResult = $derived(password ? validatePassword(password) : null)
</script>

<svelte:head>
  <title>เพิ่มพนักงาน — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="เพิ่มพนักงาน">
  <div class="max-w-2xl mx-auto space-y-4">

        <!-- Info: department is auto-assigned -->
        <Alert type="info">พนักงานที่เพิ่มจะถูกจัดอยู่ในแผนกของคุณโดยอัตโนมัติ และได้รับสิทธิ์เป็น <strong>Employee</strong></Alert>

        {#if form?.success}
          <Alert type="success">เพิ่มพนักงานเรียบร้อยแล้ว</Alert>
        {/if}

        {#if form?.error}
          <Alert type="error">
            <p>{form.error}</p>
            {#if form.details}
              <ul class="list-disc list-inside mt-1">
                {#each form.details as detail}
                  <li>{detail}</li>
                {/each}
              </ul>
            {/if}
          </Alert>
        {/if}

        <!-- Form -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body gap-5">
            <h2 class="font-semibold text-base">ข้อมูลพนักงานใหม่</h2>

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
                    placeholder="สมชาย"
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
                  placeholder="somchai@kmitl.ac.th"
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
                  <legend class="fieldset-legend">รหัสพนักงาน <span class="text-base-content/40 font-normal text-xs">(ไม่บังคับ)</span></legend>
                  <input
                    class="input input-bordered w-full font-mono"
                    type="text"
                    name="employeeCode"
                    bind:value={employeeCode}
                    placeholder="EMP001"
                    disabled={isLoading}
                  />
                </fieldset>

                <fieldset class="fieldset">
                  <legend class="fieldset-legend">แผนก</legend>
                  <input
                    class="input input-bordered w-full"
                    type="text"
                    value={department?.name ?? 'ไม่ทราบ'}
                    disabled
                  />
                  <span class="fieldset-label text-base-content/50">จัดอยู่ในแผนกนี้โดยอัตโนมัติ</span>
                </fieldset>
              </div>

              <!-- รหัสผ่าน -->
              <PasswordInput bind:value={password} disabled={isLoading} />

              <!-- Actions -->
              <div class="flex justify-end gap-2 pt-2">
                <a href="/" class="btn btn-ghost" class:pointer-events-none={isLoading}>
                  ยกเลิก
                </a>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={isLoading || !firstName || !lastName || !email || !password || (pwResult !== null && !pwResult.valid)}
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
