<script lang="ts">
  import type { ActionData, PageData } from './$types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import DemoteManagerList from '$lib/components/demote/DemoteManagerList.svelte'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const user = $derived(data.user!)
</script>

<svelte:head>
  <title>ลดระดับ Manager — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="ลดระดับ Manager เป็น User">
  <DemoteManagerList managers={data.managers ?? []} {form} />
</AppLayout>
