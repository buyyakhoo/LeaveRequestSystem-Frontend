<script lang="ts">
  import type { ActionData, PageData } from './$types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import PromoteUserList from '$lib/components/promote/PromoteUserList.svelte'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const user = $derived(data.user!)
</script>

<svelte:head>
  <title>เลื่อนยศพนักงาน — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="เลื่อนยศเป็น Manager">
  <PromoteUserList users={data.users ?? []} {form} />
</AppLayout>
