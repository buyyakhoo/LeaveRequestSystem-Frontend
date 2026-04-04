<script lang="ts">
  import { enhance, applyAction } from '$app/forms'
  import type { ActionData, PageData } from './$types'
  import { Building2, Mail, Lock, Eye, EyeOff, CircleAlert } from 'lucide-svelte'

  let { form, data }: { form: ActionData; data: PageData } = $props()

  let email = $state('')
  $effect(() => { email = form?.email ?? '' })
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

      <!-- Error alerts -->
      {#if data.oauthError}
        <div role="alert" class="alert alert-error">
          <CircleAlert class="size-5 shrink-0" />
          <span class="text-sm">{data.oauthError}</span>
        </div>
      {/if}
      {#if form?.error}
        <div role="alert" class="alert alert-error">
          <CircleAlert class="size-5 shrink-0" />
          <span class="text-sm">{form.error}</span>
        </div>
      {/if}

      <!-- Google SSO -->
      <a href="/auth/google" class="btn btn-outline w-full gap-2">
        <!-- Google G logo -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </a>

      <div class="divider text-xs text-base-content/40">or sign in with email</div>

      <!-- Email / Password form -->
      <form
        method="POST"
        use:enhance={() => {
          isLoading = true
          return async ({ result }) => {
            isLoading = false
            await applyAction(result)
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
