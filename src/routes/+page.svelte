<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { formatDate, formatDateTime } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Projektoversigt | KOPL Tjekskema</title>
</svelte:head>

<section class="hero">
	<div class="stack">
		<span class="eyebrow">Dashboard</span>
		<h1>Projektopstart som et levende overblik i stedet for et dødt Word-dokument.</h1>
		<p>
			Forsiden viser de aktive projekter og de konflikter, der stadig kræver opmærksomhed. Det giver et
			hurtigt overblik over, hvor der skal følges op.
		</p>
		<div class="hero__actions">
			<a class="button" href="/projects/new">Opret nyt projektafklaringsskema</a>
			<a class="button-secondary" href="#project-list">Gå til aktive projekter</a>
		</div>
	</div>
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
			description="Opret det første projektafklaringsskema for at demonstrere dashboard, rapport og review-flow."
		/>
	{:else}
		<div class="table-like__header" aria-hidden="true">
			<div class="table-like__header-row">
				<span>Projekt</span>
				<span>Konflikter</span>
				<span>Næste review</span>
			</div>
		</div>
		<ul class="table-like">
			{#each data.projects as entry}
				<li>
					<div>
						<a class="project-link" href={`/projects/${entry.project.id}`}>
							{entry.project.caseNumber} · {entry.project.title}
							<small>
								{entry.project.area} · {entry.project.customer} · {entry.project.municipality} · {entry.project.projectManager}
							</small>
						</a>
					</div>
					<div>
						<strong>{entry.summary.conflictCount}</strong>
						<div class="small muted">Sidst ændret {formatDateTime(entry.project.updatedAt)}</div>
					</div>
					<div>
						<strong>{formatDate(entry.project.nextReviewDate)}</strong>
						<div class="small muted">Seneste ændring {formatDate(entry.summary.latestChangeAt)}</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
