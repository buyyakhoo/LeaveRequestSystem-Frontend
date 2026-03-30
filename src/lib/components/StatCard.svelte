<script lang="ts">
  let { label, value, subtitle, valueClass = '' }: {
    label: string
    value: string | number
    subtitle?: string
    valueClass?: string
  } = $props()
</script>

<div class="card bg-base-100 shadow-sm">
  <div class="card-body py-4 gap-1">
    <p class="text-xs text-base-content/50 uppercase tracking-wide">{label}</p>
    <p class="text-3xl font-bold {valueClass}">{value}</p>
    {#if subtitle}
      <p class="text-xs text-base-content/50">{subtitle}</p>
    {/if}
  </div>
</div>
