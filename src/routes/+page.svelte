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
			Hvert projekt samler status, konflikter, begrænsninger, handlinger og historik ét sted. Teamet kan
			følge op senere uden at miste konteksten fra opstarten.
		</p>
		<div class="hero__actions">
			<a class="button" href="/projects/new">Opret nyt projektafklaringsskema</a>
			<a class="button-secondary" href="#project-list">Gå til alle projekter</a>
		</div>
	</div>

	<div class="card">
		<div class="card-header card-header--stacked">
			<div>
				<span class="eyebrow">Hvorfor det virker</span>
				<h2>De vigtigste signaler er altid synlige</h2>
			</div>
			<p>
				Røde og gule forhold bliver automatisk samlet til rapport og review. Åbne handlinger og seneste ændringer
				følger projektet videre i forløbet.
			</p>
		</div>
		<div class="stack">
			<div class="meta-row">
				<span>Projekter i demo</span>
				<strong>{data.projects.length}</strong>
			</div>
			<div class="meta-row">
				<span>Senest opdateret</span>
				<strong>{data.projects[0] ? formatDateTime(data.projects[0].project.updatedAt) : 'Ingen data endnu'}</strong>
			</div>
			<div class="meta-row">
				<span>Næste review i porteføljen</span>
				<strong>{data.projects[0] ? formatDate(data.projects[0].project.nextReviewDate) : 'Ikke planlagt'}</strong>
			</div>
		</div>
	</div>
</section>

<section class="grid grid--metrics">
	<MetricCard label="Projekter" value={data.projects.length} hint="Alle aktive demoprojekter." tone="info" />
	<MetricCard label="Konflikter" value={data.totals.conflicts} hint="Røde forhold på tværs af projekter." tone="danger" />
	<MetricCard label="Begrænsninger" value={data.totals.constraints} hint="Gule forhold der kræver styring." tone="warning" />
	<MetricCard label="Åbne handlinger" value={data.totals.openActions} hint="Handlinger der stadig mangler opfølgning." tone="success" />
</section>

<section class="card" id="project-list">
	<div class="card-header">
		<div>
			<span class="eyebrow">Portefølje</span>
			<h2>Projektoversigt</h2>
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
				<span>Begrænsninger</span>
				<span>Åbne handlinger</span>
				<span>Næste review</span>
			</div>
		</div>
		<ul class="table-like">
			{#each data.projects as entry}
				<li>
					<div>
						<a class="project-link" href={`/projects/${entry.project.id}`}>
							{entry.project.caseNumber} · {entry.project.title}
							<small>{entry.project.area} · {entry.project.customer} · {entry.project.projectManager}</small>
						</a>
					</div>
					<div>
						<strong>{entry.summary.conflictCount}</strong>
						<div class="small muted">Sidst ændret {formatDateTime(entry.project.updatedAt)}</div>
					</div>
					<div>
						<strong>{entry.summary.constraintCount}</strong>
						<div class="small muted">{entry.project.municipality}</div>
					</div>
					<div>
						<strong>{entry.summary.openActionsCount}</strong>
						<div class="small muted">{entry.summary.unresolvedAttentionCount} til review</div>
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
