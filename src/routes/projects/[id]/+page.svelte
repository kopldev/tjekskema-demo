<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { ProjectField, ProjectFormState } from '$lib/types';
	import { changeTypeLabels } from '$lib/constants';
	import { formatDate, formatDateTime, toInputDate } from '$lib/format';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const projectForm = $derived(form as ProjectFormState | undefined);

	function value(field: ProjectField) {
		if (projectForm?.values?.[field] !== undefined) {
			return projectForm.values[field];
		}

		if (field === 'nextReviewDate') {
			return toInputDate(data.project.nextReviewDate);
		}

		return data.project[field] ?? '';
	}
</script>

<svelte:head>
	<title>{data.project.title} | Projektoversigt</title>
</svelte:head>

<section class="grid grid--halves">
	<article class="card">
		<div class="card-header">
			<div>
				<span class="eyebrow">Projektmetadata</span>
				<h2>Overblik og ejeroplysninger</h2>
			</div>
			<Badge label={`Mock bruger ${data.currentUser.initials}`} tone="neutral" />
		</div>

		{#if projectForm?.message}
			<div class={projectForm.success ? 'success-banner' : 'notice'}>{projectForm.message}</div>
		{/if}

		<form method="POST" class="stack">
			<div class="form-grid">
				<div class={`field ${projectForm?.errors?.caseNumber ? 'has-error' : ''}`}>
					<label for="caseNumber">Sagsnummer</label>
					<input id="caseNumber" name="caseNumber" value={value('caseNumber')} />
					{#if projectForm?.errors?.caseNumber}<div class="field-error">{projectForm.errors.caseNumber}</div>{/if}
				</div>

				<div class={`field ${projectForm?.errors?.title ? 'has-error' : ''}`}>
					<label for="title">Projektnavn</label>
					<input id="title" name="title" value={value('title')} />
					{#if projectForm?.errors?.title}<div class="field-error">{projectForm.errors.title}</div>{/if}
				</div>

				<div class={`field ${projectForm?.errors?.area ? 'has-error' : ''}`}>
					<label for="area">Område</label>
					<input id="area" name="area" value={value('area')} />
					{#if projectForm?.errors?.area}<div class="field-error">{projectForm.errors.area}</div>{/if}
				</div>

				<div class={`field ${projectForm?.errors?.customer ? 'has-error' : ''}`}>
					<label for="customer">Kunde</label>
					<input id="customer" name="customer" value={value('customer')} />
					{#if projectForm?.errors?.customer}<div class="field-error">{projectForm.errors.customer}</div>{/if}
				</div>

				<div class={`field ${projectForm?.errors?.municipality ? 'has-error' : ''}`}>
					<label for="municipality">Kommune</label>
					<input id="municipality" name="municipality" value={value('municipality')} />
					{#if projectForm?.errors?.municipality}<div class="field-error">{projectForm.errors.municipality}</div>{/if}
				</div>

				<div class={`field ${projectForm?.errors?.projectManager ? 'has-error' : ''}`}>
					<label for="projectManager">Projektleder</label>
					<input id="projectManager" name="projectManager" value={value('projectManager')} />
					{#if projectForm?.errors?.projectManager}<div class="field-error">{projectForm.errors.projectManager}</div>{/if}
				</div>

				<div class="field">
					<label for="nextReviewDate">Næste review</label>
					<input id="nextReviewDate" name="nextReviewDate" type="date" value={value('nextReviewDate')} />
				</div>

				<div class="field field--full">
					<label for="summary">Kort projektresume</label>
					<textarea id="summary" name="summary">{value('summary')}</textarea>
				</div>
			</div>

			<div class="inline-actions">
				<button class="button" type="submit">Gem metadata</button>
				<a class="button-secondary" href={`/projects/${data.project.id}/checklist`}>Åbn checkliste</a>
			</div>
		</form>
	</article>

	<article class="card">
		<div class="card-header">
			<div>
				<span class="eyebrow">Statusbillede</span>
				<h2>Hvad kræver opmærksomhed nu?</h2>
			</div>
		</div>

		{#if data.summary.topAttentionItems.length === 0}
			<EmptyState
				title="Ingen åbne røde eller gule forhold"
				description="Når konflikter eller begrænsninger registreres, vises de automatisk her som de vigtigste opmærksomhedspunkter."
			/>
		{:else}
			<ul class="attention-list">
				{#each data.summary.topAttentionItems as item}
					<li>
						<strong>{item.question}</strong>
						<div class="chip-row">
							<Badge
								label={item.assessment === 'conflict' ? 'Konflikt' : 'Begrænsning'}
								tone={item.assessment === 'conflict' ? 'danger' : 'warning'}
							/>
							<Badge label={item.status === 'in_progress' ? 'I gang' : item.status === 'resolved' ? 'Løst' : item.status === 'parked' ? 'Parkeret' : 'Ikke startet'} tone="neutral" />
							{#if item.deadline}<Badge label={`Deadline ${formatDate(item.deadline)}`} tone="info" />{/if}
						</div>
						<p>{item.action || item.consequence}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</article>
</section>

<section class="two-column-callout">
	<article class="card">
		<div class="card-header">
			<div>
				<span class="eyebrow">Seneste ændringer</span>
				<h2>Historik i stedet for versionskaos</h2>
			</div>
			<a class="button-ghost" href={`/projects/${data.project.id}/history`}>Se fuld historik</a>
		</div>

		{#if data.historyEntries.length === 0}
			<EmptyState
				title="Ingen historik endnu"
				description="Så snart projektet eller checklisten opdateres, fremgår det her med før/efter og initialer."
			/>
		{:else}
			<ul class="timeline">
				{#each data.historyEntries.slice(0, 4) as entry}
					<li class="timeline-entry">
						<div class="timeline-entry__meta">
							<Badge label={changeTypeLabels[entry.changeType] ?? entry.changeType} tone="info" />
							<span class="small muted">{entry.userInitials} · {formatDateTime(entry.timestamp)}</span>
						</div>
						<strong>{entry.description}</strong>
						{#if entry.afterValue}
							<p>{entry.afterValue}</p>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</article>

	<article class="card">
		<div class="card-header">
			<div>
				<span class="eyebrow">Automatisk rapport</span>
				<h2>Første udsnit af rapportvisningen</h2>
			</div>
			<a class="button-ghost" href={`/projects/${data.project.id}/report`}>Åbn rapport</a>
		</div>
		<div class="stack">
			<div class="meta-row">
				<span>Konflikter</span>
				<strong>{data.summary.conflictCount}</strong>
			</div>
			<div class="meta-row">
				<span>Begrænsninger</span>
				<strong>{data.summary.constraintCount}</strong>
			</div>
			<div class="meta-row">
				<span>Åbne handlinger</span>
				<strong>{data.summary.openActionsCount}</strong>
			</div>
			<div class="meta-row">
				<span>Seneste ændring</span>
				<strong>{formatDateTime(data.summary.latestChangeAt)}</strong>
			</div>
		</div>
	</article>
</section>
