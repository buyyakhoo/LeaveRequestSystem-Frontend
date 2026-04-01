<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import type { AuthUser } from '$lib/auth';
  import type { Employee } from '$lib/types';
  import AppLayout from '$lib/components/AppLayout.svelte';
  import ResignationEmployeeList from '$lib/components/resign/ResignationEmployeeList.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const user: AuthUser = $derived(data.user!);
  const users: Employee[] = $derived((data.users ?? []) as Employee[]);
</script>

<svelte:head>
  <title>บันทึกการลาออก — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="บันทึกการลาออก">
  <ResignationEmployeeList {users} {form} />
</AppLayout>
