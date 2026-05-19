<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { formatProjectDisplayId } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Projektoversigt | KOPL Tjekskema</title>
</svelte:head>

<section class="card" id="project-list">
	<div class="card-header">
		<div>
			<span class="eyebrow">Portefølje</span>
			<h2>Åbne projekter</h2>
		</div>
		<a class="button-secondary" href="/projects/new">Nyt projekt</a>
	</div>

	{#if data.projects.length === 0}
		<EmptyState
			title="Ingen projekter endnu"
			description="Opret det første projektafklaringsskema for at få en oversigt over åbne projekter."
		/>
	{:else}
		<ul class="table-like">
			{#each data.projects as entry}
				<li>
					<a class="project-link" href={`/projects/${entry.project.id}`}>
						<span class="project-link__title">{entry.project.title}</span>
						<span class="project-link__id">
							{formatProjectDisplayId(entry.project.caseNumber, entry.project.createdAt)}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section class="grid grid--metrics grid--metrics-home">
	<MetricCard label="Aktive projekter" value={data.projects.length} hint="Alle projekter behandles som åbne." tone="info" />
	<MetricCard
		label="Samlede konflikter"
		value={data.totals.conflicts}
		hint="Røde forhold på tværs af aktive projekter."
		tone="danger"
	/>
</section>
