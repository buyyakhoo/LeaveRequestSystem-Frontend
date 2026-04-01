<script lang="ts">
  import type { PageData } from './$types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import ProfileEmployee from '$lib/components/profile/ProfileEmployee.svelte'

  let { data }: { data: PageData } = $props()

  const user = $derived(data.user!)
  const expiresAt = $derived(
    data.tokenExp ? new Date(data.tokenExp * 1000).toLocaleString() : '—'
  )
</script>

<svelte:head>
  <title>โปรไฟล์ — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="โปรไฟล์">
  <ProfileEmployee {user} {expiresAt} />
</AppLayout>
