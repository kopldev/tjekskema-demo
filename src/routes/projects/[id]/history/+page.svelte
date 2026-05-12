<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { changeTypeLabels } from '$lib/constants';
	import { formatDateTime } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.project.title} | Historik</title>
</svelte:head>

<section class="card">
	<div class="card-header">
		<div>
			<span class="eyebrow">Revisionshistorik</span>
			<h2>Alle ændringer på projekt og checkliste</h2>
		</div>
	</div>

	{#if data.historyEntries.length === 0}
		<EmptyState
			title="Ingen historik endnu"
			description="Historik oprettes automatisk, når metadata, checklistpunkter eller reviewstatus ændres."
		/>
	{:else}
		<ul class="timeline">
			{#each data.historyEntries as entry}
				<li class="timeline-entry">
					<div class="timeline-entry__meta">
						<Badge label={changeTypeLabels[entry.changeType] ?? entry.changeType} tone="info" />
						<span class="small muted">{entry.userInitials} · {formatDateTime(entry.timestamp)}</span>
					</div>
					<strong>{entry.description}</strong>
					{#if entry.beforeValue}
						<p><span class="muted">Før:</span> {entry.beforeValue}</p>
					{/if}
					{#if entry.afterValue}
						<p><span class="muted">Efter:</span> {entry.afterValue}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
