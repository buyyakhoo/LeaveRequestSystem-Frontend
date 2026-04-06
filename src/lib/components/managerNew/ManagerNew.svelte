<script lang="ts">
  import { enhance, applyAction } from "$app/forms";
  import { validatePassword } from "$lib/auth";
  import Alert from "$lib/components/Alert.svelte";
  import PasswordInput from "$lib/components/PasswordInput.svelte";
  import type { ManagerFormActionData } from "$lib/types";

  let {
    form,
    departments,
  }: { form: ManagerFormActionData | null; departments: any[] } = $props();

  let firstName = $state("");
  let lastName = $state("");
  let email = $state("");
  let employeeCode = $state("");
  let departmentId = $state("");
  let password = $state("");
  let isLoading = $state(false);

  $effect(() => {
    if (form && !form.success && "firstName" in form) {
      firstName = form.firstName ?? "";
      lastName = form.lastName ?? "";
      email = form.email ?? "";
      employeeCode = form.employeeCode ?? "";
      departmentId = form.departmentId ?? "";
    }
  });

  const pwResult = $derived(password ? validatePassword(password) : null);

  const canSubmit = $derived(
    !!firstName &&
      !!lastName &&
      !!email &&
      !!departmentId &&
      !!password &&
      (pwResult === null || pwResult.valid) &&
      !isLoading,
  );
</script>

<div class="max-w-2xl mx-auto space-y-4">
  <Alert type="info"
    >Manager ที่เพิ่มจะได้รับสิทธิ์ดูแลแผนกที่เลือก
    และสามารถอนุมัติการลาของพนักงานในแผนกนั้น</Alert
  >

  {#if form?.success}
    <Alert type="success">เพิ่ม Manager เรียบร้อยแล้ว</Alert>
  {/if}

  {#if form && !form.success && form.error}
    <Alert type="error">{form.error}</Alert>
  {/if}

  <div class="card bg-base-100 shadow-sm">
    <div class="card-body gap-5">
      <h2 class="font-semibold text-base">ข้อมูล Manager ใหม่</h2>

      <form
        method="POST"
        use:enhance={() => {
          isLoading = true;
          return async ({ result }) => {
            isLoading = false;
            if (result.type === "success") {
              firstName = "";
              lastName = "";
              email = "";
              employeeCode = "";
              departmentId = "";
              password = "";
            }
            await applyAction(result);
          };
        }}
        class="flex flex-col gap-4"
        novalidate
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend"
              >ชื่อ <span class="text-error">*</span></legend
            >
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
            <legend class="fieldset-legend"
              >นามสกุล <span class="text-error">*</span></legend
            >
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

        <fieldset class="fieldset">
          <legend class="fieldset-legend"
            >อีเมล <span class="text-error">*</span></legend
          >
          <input
            class="input input-bordered w-full {email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              ? 'input-error'
              : ''}"
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend"
              >แผนกที่ดูแล <span class="text-error">*</span></legend
            >
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
            <legend class="fieldset-legend"
              >รหัสพนักงาน <span
                class="text-base-content/40 font-normal text-xs"
                >(ไม่บังคับ)</span
              ></legend
            >
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

        <PasswordInput bind:value={password} disabled={isLoading} />

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-2">
          <a
            href="/"
            class="btn btn-ghost"
            class:pointer-events-none={isLoading}
          >
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
