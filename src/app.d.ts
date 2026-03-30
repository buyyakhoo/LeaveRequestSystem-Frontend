// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/auth').AuthUser | null
			tokenExp: number | null
			token: string | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
