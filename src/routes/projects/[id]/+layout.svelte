<script lang="ts">
	import { page } from '$app/state';
	import Badge from '$lib/components/Badge.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import { formatDate, formatDateTime } from '$lib/format';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const basePath = $derived(`/projects/${data.project.id}`);
	const tabs = $derived([
		{ href: basePath, label: 'Overblik' },
		{ href: `${basePath}/checklist`, label: 'Checkliste' },
		{ href: `${basePath}/report`, label: 'Rapport' },
		{ href: `${basePath}/review`, label: 'Review' },
		{ href: `${basePath}/history`, label: 'Historik' }
	]);

	function isActive(href: string) {
		return href === basePath ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}
</script>

<section class="hero">
	<div class="stack">
		<div class="chip-row">
			<Badge label={data.project.caseNumber} tone="info" />
			<Badge label={data.project.projectManager} tone="neutral" />
			<Badge label={`Næste review ${formatDate(data.project.nextReviewDate)}`} tone="warning" />
		</div>
		<h1>{data.project.title}</h1>
		<p>{data.project.summary || 'Projektets resume mangler endnu. Brug overblikssiden til at tilføje det.'}</p>
		<div class="kpi-strip">
			<span class="badge tone-neutral">{data.project.area}</span>
			<span class="badge tone-neutral">{data.project.customer}</span>
			<span class="badge tone-neutral">{data.project.municipality}</span>
			<span class="badge tone-neutral">Sidst opdateret {formatDateTime(data.project.updatedAt)}</span>
		</div>
	</div>

	<div class="grid grid--metrics">
		<MetricCard label="Konflikter" value={data.summary.conflictCount} tone="danger" />
		<MetricCard label="Begrænsninger" value={data.summary.constraintCount} tone="warning" />
		<MetricCard label="Åbne handlinger" value={data.summary.openActionsCount} tone="success" />
		<MetricCard label="Til review" value={data.summary.unresolvedAttentionCount} tone="info" />
	</div>
</section>

<nav class="subnav" aria-label="Projektnavigation">
	{#each tabs as tab}
		<a href={tab.href} class:active={isActive(tab.href)}>{tab.label}</a>
	{/each}
</nav>

{@render children()}
