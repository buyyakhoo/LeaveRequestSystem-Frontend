<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'
  import { Building2, Mail, Lock, Eye, EyeOff, CircleAlert } from 'lucide-svelte'

  let { form }: { form: ActionData } = $props()

  let email = $state(form?.email ?? '')
  let password = $state('')
  let showPassword = $state(false)
  let isLoading = $state(false)
</script>

<svelte:head>
  <title>Sign In — Leave Request System</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
  <div class="card bg-base-100 shadow-xl w-full max-w-md">
    <div class="card-body gap-6">

      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center mb-3">
          <div class="bg-primary/10 p-4 rounded-full">
            <Building2 class="size-8 text-primary" strokeWidth={1.75} />
          </div>
        </div>
        <h1 class="text-2xl font-bold">Leave Request System</h1>
        <p class="text-base-content/60 text-sm mt-1">Sign in to your account</p>
      </div>

      <!-- Server error alert -->
      {#if form?.error}
        <div role="alert" class="alert alert-error">
          <CircleAlert class="size-5 shrink-0" />
          <span class="text-sm">{form.error}</span>
        </div>
      {/if}

      <!-- Form — POSTs to the default action in +page.server.ts -->
      <form
        method="POST"
        use:enhance={() => {
          isLoading = true
          return async ({ update }) => {
            isLoading = false
            await update()
          }
        }}
        class="flex flex-col gap-4"
        novalidate
      >

        <!-- Email -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <label class="input w-full {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'input-error' : ''}">
            <Mail class="size-4 opacity-50" />
            <input
              type="email"
              name="email"
              bind:value={email}
              placeholder="you@kmitl.ac.th"
              autocomplete="email"
              required
              disabled={isLoading}
            />
          </label>
          {#if email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            <p class="fieldset-label text-error">Please enter a valid email address</p>
          {/if}
        </fieldset>

        <!-- Password -->
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Password</legend>
          <label class="input w-full">
            <Lock class="size-4 opacity-50" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              bind:value={password}
              placeholder="••••••••"
              autocomplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              class="btn btn-ghost btn-xs px-1"
              onclick={() => (showPassword = !showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <EyeOff class="size-4 opacity-60" />
              {:else}
                <Eye class="size-4 opacity-60" />
              {/if}
            </button>
          </label>
        </fieldset>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn-primary w-full mt-2"
          disabled={isLoading || !email || !password}
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-sm"></span>
            Signing in…
          {:else}
            Sign In
          {/if}
        </button>

      </form>

    </div>
  </div>
</div>
