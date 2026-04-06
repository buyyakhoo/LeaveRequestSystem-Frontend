<script lang="ts">
  import { Eye, EyeOff, CircleAlert, CircleCheck } from 'lucide-svelte'
  import { validatePassword } from '$lib/auth'

  let { value = $bindable(''), disabled = false, name = 'password' }: {
    value?: string
    disabled?: boolean
    name?: string
  } = $props()

  let showPassword = $state(false)
  const pwResult = $derived(value ? validatePassword(value) : null)
</script>

<fieldset class="fieldset">
  <legend class="fieldset-legend">รหัสผ่าน <span class="text-error">*</span></legend>
  <label class="input input-bordered w-full">
    <input
      type={showPassword ? 'text' : 'password'}
      {name}
      bind:value
      placeholder="••••••••"
      autocomplete="new-password"
      required
      {disabled}
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
    <div class="mt-2 flex items-center gap-2">
      <div
        class="h-2 rounded-full flex-grow"
        class:bg-error={pwResult.strength === 'weak'}
        class:bg-warning={pwResult.strength === 'moderate'}
        class:bg-success={pwResult.strength === 'strong'}
        class:bg-info={pwResult.strength === 'passphrase'}
      ></div>
      <span
        class="text-xs font-semibold"
        class:text-error={pwResult.strength === 'weak'}
        class:text-warning={pwResult.strength === 'moderate'}
        class:text-success={pwResult.strength === 'strong'}
        class:text-info={pwResult.strength === 'passphrase'}
      >
        {pwResult.strength === 'weak' ? 'อ่อน' : ''}
        {pwResult.strength === 'moderate' ? 'ปานกลาง' : ''}
        {pwResult.strength === 'strong' ? 'แข็งแรง' : ''}
        {pwResult.strength === 'passphrase' ? 'ปลอดภัยมาก' : ''}
      </span>
    </div>
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
