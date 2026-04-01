<script lang="ts">
  import type { PageData } from './$types'
  import type { EventLog } from '$lib/types'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import EventAll from '$lib/components/events/EventAll.svelte'

  let { data }: { data: PageData } = $props()
  
  const user = $derived(data.user!)
  const logs: EventLog[] = $derived(data.logs ?? [])
</script>

<svelte:head>
  <title>Event Log — Leave Request System</title>
</svelte:head>

<AppLayout {user} title="Event Log">
  <EventAll {logs} />
</AppLayout>
