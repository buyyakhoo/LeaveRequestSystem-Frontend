<script lang="ts">
  let { status }: { status: string } = $props()
</script>

{#if status === 'approved'}
  <span class="badge badge-success badge-sm">อนุมัติ</span>
{:else if status === 'rejected'}
  <span class="badge badge-error badge-sm">ไม่อนุมัติ</span>
{:else}
  <span class="badge badge-warning badge-sm">รออนุมัติ</span>
{/if}
