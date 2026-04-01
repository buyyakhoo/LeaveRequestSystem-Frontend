<script lang="ts">
    import { roleLabel } from '$lib/utils'
    
    let { user, expiresAt }: { user: any; expiresAt: string } = $props()
</script>

<div class="max-w-2xl mx-auto space-y-4">
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body gap-5">
      <h2 class="font-semibold text-base">ข้อมูลบัญชี</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="space-y-1">
          <p class="text-base-content/50 uppercase text-xs tracking-wide">
            ชื่อ
          </p>
          <p class="font-medium">{user.first_name}</p>
        </div>
        <div class="space-y-1">
          <p class="text-base-content/50 uppercase text-xs tracking-wide">
            นามสกุล
          </p>
          <p class="font-medium">{user.last_name}</p>
        </div>
        <div class="space-y-1">
          <p class="text-base-content/50 uppercase text-xs tracking-wide">
            อีเมล
          </p>
          <p class="font-medium">{user.email}</p>
        </div>
        <div class="space-y-1">
          <p class="text-base-content/50 uppercase text-xs tracking-wide">
            รหัสพนักงาน
          </p>
          <p class="font-medium font-mono">{user.employee_code}</p>
        </div>
        <div class="space-y-1">
          <p class="text-base-content/50 uppercase text-xs tracking-wide">
            ตำแหน่ง
          </p>
          <span class="badge badge-primary badge-outline">
            {roleLabel[user.role] ?? user.role}
          </span>
        </div>
        {#if user.departments}
          <div class="space-y-1">
            <p class="text-base-content/50 uppercase text-xs tracking-wide">
              แผนก
            </p>
            <p class="font-medium">{user.departments.name}</p>
          </div>
        {/if}
        <div class="space-y-1 sm:col-span-2">
          <p class="text-base-content/50 uppercase text-xs tracking-wide">
            Session หมดอายุ
          </p>
          <p class="font-medium text-base-content/70">{expiresAt}</p>
        </div>
      </div>
    </div>
  </div>
</div>
