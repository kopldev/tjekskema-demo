<script lang="ts">
	import Badge from '$lib/components/Badge.svelte';
	import { answerLabels, answerOptions, assessmentLabels, assessmentOptions, assessmentTones, statusLabels, statusOptions } from '$lib/constants';
	import type { ChecklistField, ChecklistFormState, ChecklistItem } from '$lib/types';
	import { formatDate, toInputDate } from '$lib/format';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const checklistForm = $derived(form as ChecklistFormState | undefined);

	function value(item: ChecklistItem, field: ChecklistField) {
		const submittedValue = checklistForm?.values?.[item.id]?.[field];

		if (submittedValue !== undefined) {
			return submittedValue;
		}

		if (field === 'deadline') {
			return toInputDate(item.deadline);
		}

		const currentValue = item[field];
		return typeof currentValue === 'string' ? currentValue : '';
	}

	function error(itemId: string, field: ChecklistField) {
		return checklistForm?.errors?.[itemId]?.[field];
	}

	function topicCounts(items: ChecklistItem[]) {
		return {
			conflicts: items.filter((item) => item.assessment === 'conflict').length,
			constraints: items.filter((item) => item.assessment === 'constraint').length,
			open: items.filter((item) => item.status !== 'resolved' && item.action.trim().length > 0).length
		};
	}

	function tone(item: ChecklistItem) {
		const submitted = checklistForm?.values?.[item.id]?.assessment as ChecklistItem['assessment'] | undefined;
		return assessmentTones[submitted ?? item.assessment];
	}

	function requiresFollowUp(item: ChecklistItem) {
		const submitted = checklistForm?.values?.[item.id]?.assessment as ChecklistItem['assessment'] | undefined;
		const assessment = submitted ?? item.assessment;
		return assessment === 'conflict' || assessment === 'constraint';
	}
</script>

<svelte:head>
	<title>{data.project.title} | Checkliste</title>
</svelte:head>

<section class="card">
	<div class="card-header">
		<div>
			<span class="eyebrow">Checklisteeditor</span>
			<h2>Udfyld og vedligehold projektafklaringen</h2>
		</div>
		<Badge label={`Mock bruger ${data.currentUser.initials}`} tone="neutral" />
	</div>

	<div class="notice">
		Ved <strong>Konflikt</strong> eller <strong>Begrænsning</strong> er både konsekvens og påkrævet handling obligatoriske.
	</div>

	{#if checklistForm?.message}
		<div class={checklistForm.success ? 'success-banner' : 'notice'}>{checklistForm.message}</div>
	{/if}

	<form method="POST" class="stack">
		<div class="inline-actions">
			<button class="button" type="submit">Gem hele checklisten</button>
			<a class="button-secondary" href={`/projects/${data.project.id}/report`}>Se genereret rapport</a>
		</div>

		{#each data.topicGroups as group, index}
			{@const counts = topicCounts(group.items)}
			<details class="topic-card" open={index < 2}>
				<summary>
					<div class="stack">
						<strong>{group.topic.name}</strong>
						<p class="small">{group.topic.description}</p>
					</div>
					<div class="topic-summary__badges">
						<Badge label={`${counts.conflicts} konflikter`} tone="danger" />
						<Badge label={`${counts.constraints} begrænsninger`} tone="warning" />
						<Badge label={`${counts.open} åbne handlinger`} tone="info" />
					</div>
				</summary>

				<div class="topic-card__body">
					{#each group.items as item}
						<div class={`item-card tone-${tone(item)}`}>
							<div class="item-card__header">
								<div>
									<div class="item-card__question">{item.question}</div>
									<p class="small">
										Senest opdateret {formatDate(item.updatedAt)} · Punktet følger projektet videre i rapport og review.
									</p>
								</div>
								<div class="chip-row">
									<Badge label={answerLabels[item.answer]} tone="info" />
									<Badge label={assessmentLabels[item.assessment]} tone={assessmentTones[item.assessment] as 'danger' | 'warning' | 'success' | 'neutral'} />
									<Badge label={statusLabels[item.status]} tone="neutral" />
								</div>
							</div>

							<div class="item-card__grid">
								<div class={`field ${error(item.id, 'answer') ? 'has-error' : ''}`}>
									<label for={`${item.id}-answer`}>Svar</label>
									<select id={`${item.id}-answer`} name={`${item.id}::answer`} value={value(item, 'answer')}>
										{#each answerOptions as option}
											<option value={option.value}>{option.label}</option>
										{/each}
									</select>
								</div>

								<div class={`field ${error(item.id, 'assessment') ? 'has-error' : ''}`}>
									<label for={`${item.id}-assessment`}>Vurdering</label>
									<select id={`${item.id}-assessment`} name={`${item.id}::assessment`} value={value(item, 'assessment')}>
										{#each assessmentOptions as option}
											<option value={option.value}>{option.label}</option>
										{/each}
									</select>
								</div>

								<div class={`field field--full ${error(item.id, 'consequence') ? 'has-error' : ''}`}>
									<label for={`${item.id}-consequence`}>Konsekvens</label>
									<textarea
										id={`${item.id}-consequence`}
										name={`${item.id}::consequence`}
										required={requiresFollowUp(item)}
									>{value(item, 'consequence')}</textarea>
									{#if error(item.id, 'consequence')}<div class="field-error">{error(item.id, 'consequence')}</div>{/if}
								</div>

								<div class={`field field--full ${error(item.id, 'action') ? 'has-error' : ''}`}>
									<label for={`${item.id}-action`}>Påkrævet handling</label>
									<textarea
										id={`${item.id}-action`}
										name={`${item.id}::action`}
										required={requiresFollowUp(item)}
									>{value(item, 'action')}</textarea>
									{#if error(item.id, 'action')}<div class="field-error">{error(item.id, 'action')}</div>{/if}
								</div>

								<div class="field">
									<label for={`${item.id}-responsible`}>Ansvarlig</label>
									<input id={`${item.id}-responsible`} name={`${item.id}::responsible`} value={value(item, 'responsible')} />
								</div>

								<div class="field">
									<label for={`${item.id}-deadline`}>Deadline</label>
									<input id={`${item.id}-deadline`} name={`${item.id}::deadline`} type="date" value={value(item, 'deadline')} />
								</div>

								<div class="field">
									<label for={`${item.id}-status`}>Status</label>
									<select id={`${item.id}-status`} name={`${item.id}::status`} value={value(item, 'status')}>
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
										value={value(item, 'documentationUrl')}
									/>
									{#if error(item.id, 'documentationUrl')}<div class="field-error">{error(item.id, 'documentationUrl')}</div>{/if}
								</div>

								<div class="field field--full">
									<label for={`${item.id}-notes`}>Interne noter</label>
									<textarea id={`${item.id}-notes`} name={`${item.id}::notes`}>{value(item, 'notes')}</textarea>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</details>
		{/each}

		<div class="inline-actions">
			<button class="button" type="submit">Gem hele checklisten</button>
		</div>
	</form>
</section>
