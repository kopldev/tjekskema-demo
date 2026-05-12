<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { changeTypeLabels } from '$lib/constants';
	import { formatDate, formatDateTime, presentText } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.project.title} | Rapport</title>
</svelte:head>

<section class="report-grid">
	<article class="report-section">
		<div class="card-header card-header--stacked">
			<div>
				<span class="eyebrow">Genereret opstartsrapport</span>
				<h2>Projektresumé</h2>
			</div>
			<p>{presentText(data.project.summary, 'Projektresumé er ikke udfyldt endnu.')}</p>
		</div>

		<div class="stack">
			<div class="meta-row"><span>Sagsnummer</span><strong>{data.project.caseNumber}</strong></div>
			<div class="meta-row"><span>Område</span><strong>{data.project.area}</strong></div>
			<div class="meta-row"><span>Kunde</span><strong>{data.project.customer}</strong></div>
			<div class="meta-row"><span>Kommune</span><strong>{data.project.municipality}</strong></div>
			<div class="meta-row"><span>Projektleder</span><strong>{data.project.projectManager}</strong></div>
			<div class="meta-row"><span>Næste review</span><strong>{formatDate(data.project.nextReviewDate)}</strong></div>
		</div>
	</article>

	<article class="report-section">
		<div class="card-header card-header--stacked">
			<div>
				<span class="eyebrow">Status</span>
				<h2>Hovedtal</h2>
			</div>
		</div>
		<div class="stack">
			<div class="meta-row"><span>Konflikter</span><strong>{data.summary.conflictCount}</strong></div>
			<div class="meta-row"><span>Begrænsninger</span><strong>{data.summary.constraintCount}</strong></div>
			<div class="meta-row"><span>Åbne handlinger</span><strong>{data.summary.openActionsCount}</strong></div>
			<div class="meta-row"><span>Seneste ændring</span><strong>{formatDateTime(data.summary.latestChangeAt)}</strong></div>
		</div>
	</article>
</section>

<section class="two-column-callout">
	<article class="report-section">
		<div class="card-header">
			<div>
				<span class="eyebrow">Topfokus</span>
				<h2>Vigtigste opmærksomhedspunkter</h2>
			</div>
		</div>

		{#if data.summary.topAttentionItems.length === 0}
			<EmptyState
				title="Ingen åbne opmærksomhedspunkter"
				description="Når røde eller gule forhold bliver registreret og endnu ikke er løst, samles de automatisk her."
			/>
		{:else}
			<ul class="report-list">
				{#each data.summary.topAttentionItems as item}
					<li>
						<strong>{item.question}</strong>
						<div class="chip-row">
							<Badge label={item.assessment === 'conflict' ? 'Konflikt' : 'Begrænsning'} tone={item.assessment === 'conflict' ? 'danger' : 'warning'} />
							{#if item.deadline}<Badge label={`Deadline ${formatDate(item.deadline)}`} tone="info" />{/if}
							{#if item.responsible}<Badge label={`Ansvarlig ${item.responsible}`} tone="neutral" />{/if}
						</div>
						<p>{presentText(item.consequence)}</p>
						<p><span class="muted">Handling:</span> {presentText(item.action)}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</article>

	<article class="report-section">
		<div class="card-header">
			<div>
				<span class="eyebrow">Åbne handlinger</span>
				<h2>Hvad teamet skal følge op på</h2>
			</div>
		</div>

		{#if data.summary.openActionItems.length === 0}
			<EmptyState
				title="Ingen åbne handlinger"
				description="Handlinger optræder her, så snart et checklistpunkt får en opfølgning og endnu ikke er markeret som løst."
			/>
		{:else}
			<ul class="report-list">
				{#each data.summary.openActionItems as item}
					<li>
						<strong>{item.question}</strong>
						<p>{item.action}</p>
						<div class="chip-row">
							{#if item.responsible}<Badge label={item.responsible} tone="neutral" />{/if}
							{#if item.deadline}<Badge label={formatDate(item.deadline)} tone="info" />{/if}
							<Badge label={item.status === 'in_progress' ? 'I gang' : item.status === 'parked' ? 'Parkeret' : 'Ikke startet'} tone="warning" />
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</article>
</section>

<section class="report-grid">
	<article class="report-section">
		<div class="card-header">
			<div>
				<span class="eyebrow">Røde forhold</span>
				<h2>Alle konflikter</h2>
			</div>
		</div>
		{#if data.summary.conflictItems.length === 0}
			<EmptyState title="Ingen konflikter" description="Der er endnu ingen røde forhold registreret i projektet." />
		{:else}
			<ul class="report-list">
				{#each data.summary.conflictItems as item}
					<li>
						<strong>{item.question}</strong>
						<p>{presentText(item.consequence)}</p>
						<p><span class="muted">Handling:</span> {presentText(item.action)}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</article>

	<article class="report-section">
		<div class="card-header">
			<div>
				<span class="eyebrow">Gule forhold</span>
				<h2>Alle begrænsninger</h2>
			</div>
		</div>
		{#if data.summary.constraintItems.length === 0}
			<EmptyState title="Ingen begrænsninger" description="Der er endnu ingen gule forhold registreret i projektet." />
		{:else}
			<ul class="report-list">
				{#each data.summary.constraintItems as item}
					<li>
						<strong>{item.question}</strong>
						<p>{presentText(item.consequence)}</p>
						<p><span class="muted">Handling:</span> {presentText(item.action)}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</article>
</section>

<section class="report-section">
	<div class="card-header">
		<div>
			<span class="eyebrow">Seneste ændringer</span>
			<h2>Revisionsspor i rapporten</h2>
		</div>
	</div>
	{#if data.summary.latestChanges.length === 0}
		<EmptyState title="Ingen ændringer endnu" description="Når projektet bliver opdateret, vises ændringerne automatisk her." />
	{:else}
		<ul class="timeline">
			{#each data.summary.latestChanges as entry}
				<li class="timeline-entry">
					<div class="timeline-entry__meta">
						<Badge label={changeTypeLabels[entry.changeType] ?? entry.changeType} tone="info" />
						<span class="small muted">{entry.userInitials} · {formatDateTime(entry.timestamp)}</span>
					</div>
					<strong>{entry.description}</strong>
					{#if entry.afterValue}<p>{entry.afterValue}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
