<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { ChecklistField, ChecklistFormState } from '$lib/types';
	import { assessmentTones, statusOptions } from '$lib/constants';
	import { formatDate, toInputDate } from '$lib/format';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const reviewForm = $derived(form as ChecklistFormState | undefined);

	function value(itemId: string, field: ChecklistField, fallback: string) {
		return reviewForm?.values?.[itemId]?.[field] ?? fallback;
	}

	function error(itemId: string, field: ChecklistField) {
		return reviewForm?.errors?.[itemId]?.[field];
	}
</script>

<svelte:head>
	<title>{data.project.title} | Review</title>
</svelte:head>

<section class="card">
	<div class="card-header">
		<div>
			<span class="eyebrow">Review-mode</span>
			<h2>Følg kun op på åbne røde og gule forhold</h2>
		</div>
	</div>

	<div class="notice">
		Denne visning filtrerer checklisten ned til uløste konflikter og begrænsninger, så reviewmødet kan fokusere på
		status, ansvar og næste skridt.
	</div>

	{#if reviewForm?.message}
		<div class={reviewForm.success ? 'success-banner' : 'notice'}>{reviewForm.message}</div>
	{/if}

	{#if data.summary.reviewItems.length === 0}
		<EmptyState
			title="Intet åbent review"
			description="Alle røde og gule forhold er løst eller der er endnu ikke registreret nogen vurderinger, der kræver review."
		/>
	{:else}
		<form method="POST" class="stack">
			<div class="inline-actions">
				<button class="button" type="submit">Gem reviewopdateringer</button>
				<a class="button-secondary" href={`/projects/${data.project.id}/checklist`}>Tilbage til fuld checkliste</a>
			</div>

			<ul class="review-list">
				{#each data.summary.reviewItems as item}
					<li class={`item-card tone-${assessmentTones[item.assessment]}`}>
						<div class="item-card__header">
							<div>
								<div class="item-card__question">{item.question}</div>
								<p class="small">{item.consequence}</p>
							</div>
							<div class="chip-row">
								<Badge label={item.assessment === 'conflict' ? 'Konflikt' : 'Begrænsning'} tone={item.assessment === 'conflict' ? 'danger' : 'warning'} />
								{#if item.deadline}<Badge label={`Deadline ${formatDate(item.deadline)}`} tone="info" />{/if}
							</div>
						</div>

						<div class="item-card__grid">
							<div class={`field field--full ${error(item.id, 'action') ? 'has-error' : ''}`}>
								<label for={`${item.id}-action`}>Handling</label>
								<textarea id={`${item.id}-action`} name={`${item.id}::action`}>{value(item.id, 'action', item.action)}</textarea>
								{#if error(item.id, 'action')}<div class="field-error">{error(item.id, 'action')}</div>{/if}
							</div>

							<div class={`field field--full ${error(item.id, 'consequence') ? 'has-error' : ''}`}>
								<label for={`${item.id}-consequence`}>Konsekvens</label>
								<textarea id={`${item.id}-consequence`} name={`${item.id}::consequence`}>{value(item.id, 'consequence', item.consequence)}</textarea>
								{#if error(item.id, 'consequence')}<div class="field-error">{error(item.id, 'consequence')}</div>{/if}
							</div>

							<div class="field">
								<label for={`${item.id}-responsible`}>Ansvarlig</label>
								<input id={`${item.id}-responsible`} name={`${item.id}::responsible`} value={value(item.id, 'responsible', item.responsible)} />
							</div>

							<div class="field">
								<label for={`${item.id}-deadline`}>Deadline</label>
								<input id={`${item.id}-deadline`} name={`${item.id}::deadline`} type="date" value={value(item.id, 'deadline', toInputDate(item.deadline))} />
							</div>

							<div class="field">
								<label for={`${item.id}-status`}>Status</label>
								<select id={`${item.id}-status`} name={`${item.id}::status`} value={value(item.id, 'status', item.status)}>
									{#each statusOptions as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>

							<div class={`field ${error(item.id, 'documentationUrl') ? 'has-error' : ''}`}>
								<label for={`${item.id}-documentationUrl`}>Dokumentationslink</label>
								<input
									id={`${item.id}-documentationUrl`}
									name={`${item.id}::documentationUrl`}
									placeholder="https://..."
									value={value(item.id, 'documentationUrl', item.documentationUrl)}
								/>
								{#if error(item.id, 'documentationUrl')}<div class="field-error">{error(item.id, 'documentationUrl')}</div>{/if}
							</div>

							<div class="field field--full">
								<label for={`${item.id}-notes`}>Reviewnoter</label>
								<textarea id={`${item.id}-notes`} name={`${item.id}::notes`}>{value(item.id, 'notes', item.notes)}</textarea>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</form>
	{/if}
</section>
