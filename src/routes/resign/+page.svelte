<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'
  import type { Employee } from './+page.server'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Alert from '$lib/components/Alert.svelte'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const user = $derived(data.user!)

  let resigned = $state<Set<string>>(new Set())
  const users = $derived(
    ((data.users ?? []) as Employee[]).filter(e => !resigned.has(e.id))
  )

  let search = $state('')

  const filtered = $derived((() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(e =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      (e.email ?? '').toLowerCase().includes(q) ||
      (e.employee_code ?? '').toLowerCase().includes(q)
    )
  })())

  let lastResignedName = $state('')

  $effect(() => {
    if (form && 'success' in form && form.success && form.id) {
      const emp = (data.users as Employee[]).find(e => e.id === form.id)
      if (emp) {
        lastResignedName = `${emp.first_name} ${emp.last_name}`
        resigned.add(form.id)
        resigned = new Set(resigned)
      }
    }
  })
</script>

<svelte:head>
  <title>บันทึกการลาออก — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="บันทึกการลาออก">
  <div class="flex flex-col flex-1 min-h-0 space-y-4">

    {#if form && 'error' in form && form.error}
      <Alert type="error">{form.error}</Alert>
    {/if}

    {#if lastResignedName}
      <Alert type="info">{lastResignedName} ถูกบันทึกว่าลาออกแล้ว (บัญชีถูก Disable)</Alert>
    {/if}

    <div class="card bg-base-100 shadow-sm flex flex-col flex-1 min-h-0">

      <div class="px-6 pt-5 pb-4 shrink-0 space-y-3 border-b border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-base">พนักงานที่ active</h2>
            <p class="text-xs text-base-content/50 mt-0.5">การลาออกจะ Disable บัญชี และไม่สามารถเข้าสู่ระบบได้อีก</p>
          </div>
          <span class="text-sm text-base-content/50">{filtered.length} คน</span>
        </div>

        <label class="input input-bordered flex items-center gap-2 w-full max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            class="grow"
            placeholder="ค้นหาชื่อ, รหัสพนักงาน, อีเมล…"
            bind:value={search}
          />
          {#if search}
            <button class="btn btn-ghost btn-xs px-1" onclick={() => search = ''}>✕</button>
          {/if}
        </label>
      </div>

      {#if filtered.length === 0}
        <p class="text-base-content/50 text-sm py-16 text-center">
          {search ? 'ไม่พบพนักงานที่ตรงกับการค้นหา' : 'ไม่มีพนักงาน Active ในระบบ'}
        </p>
      {:else}
        <div class="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
          <table class="table table-sm">
            <thead class="sticky top-0 bg-base-100 z-10">
              <tr>
                <th>ชื่อ</th>
                <th>รหัสพนักงาน</th>
                <th>อีเมล</th>
                <th>แผนก</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each filtered as emp (emp.id)}
                <tr class="hover">
                  <td class="text-sm font-medium">{emp.first_name} {emp.last_name}</td>
                  <td class="text-sm font-mono">{emp.employee_code ?? '—'}</td>
                  <td class="text-sm text-base-content/70">{emp.email}</td>
                  <td class="text-sm text-base-content/70">{emp.departments?.name ?? '—'}</td>
                  <td>
                    <form method="POST" action="?/resign" use:enhance>
                      <input type="hidden" name="id" value={emp.id} />
                      <button
                        type="submit"
                        class="btn btn-error btn-xs"
                        onclick={(e) => {
                          if (!confirm(`บันทึกการลาออกของ "${emp.first_name} ${emp.last_name}"?\nบัญชีจะถูก Disable ทันที`)) {
                            e.preventDefault()
                          }
                        }}
                      >
                        ลาออก
                      </button>
                    </form>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

    </div>
  </div>
</AppLayout>
