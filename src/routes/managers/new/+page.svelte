<script lang="ts">
  import type { ActionData, PageData } from './$types'
  import type { ManagerFormActionData } from '$lib/types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import ManagerNew from '$lib/components/managerNew/ManagerNew.svelte'

  let { form, data }: { form: ActionData | ManagerFormActionData | null; data: PageData } = $props()

  const user = $derived(data.user!)
  const departments = $derived(data.departments ?? [])
</script>

<svelte:head>
  <title>เพิ่ม Manager — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="เพิ่ม Manager">
  <ManagerNew form={form ? (form as ManagerFormActionData) : null} {departments} />
</AppLayout>