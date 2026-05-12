<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>KOPL Tjekskema</title>
</svelte:head>

<div class="app-shell">
	<header class="app-topbar">
		<div class="app-topbar__inner">
			<a class="brand" href="/">
				<span class="brand__mark">K</span>
				<span>
					<span class="brand__eyebrow">KOPL MVP</span>
					<span class="brand__title">Levende projektafklaringsskema</span>
				</span>
			</a>

			<nav class="topnav" aria-label="Global navigation">
				<a href="/" class:active={page.url.pathname === '/'}>Projekter</a>
				<a href="/projects/new" class:active={page.url.pathname === '/projects/new'}>Nyt skema</a>
			</nav>
		</div>
	</header>

	<main class="page">
		{@render children()}
	</main>
</div>
