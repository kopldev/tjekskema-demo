<script lang="ts">
	import type { ProjectField, ProjectFormState } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const projectForm = $derived(form as ProjectFormState | undefined);

	function value(field: ProjectField) {
		return projectForm?.values?.[field] ?? '';
	}
</script>

<svelte:head>
	<title>Nyt projekt | KOPL Tjekskema</title>
</svelte:head>

<section class="hero">
	<div class="stack">
		<span class="eyebrow">Nyt projekt</span>
		<h1>Opret en ny levende projektafklaringsrapport.</h1>
		<p>
			Projektet starter med metadata og en fast standardskabelon. Checklisten bliver automatisk oprettet, så teamet
			kan gå direkte videre til vurdering, handlinger og review.
		</p>
	</div>

	<div class="card">
		<div class="card-header card-header--stacked">
			<div>
				<span class="eyebrow">MVP-standard</span>
				<h2>Hvad der oprettes automatisk</h2>
			</div>
			<p>Alle nye projekter får den samme emnestruktur og de samme seedede startspørgsmål.</p>
		</div>
		<div class="stack">
			<div class="meta-row"><span>Skabelontyper</span><strong>Ejendom, plan, miljø, natur, trafik m.fl.</strong></div>
			<div class="meta-row"><span>Historik</span><strong>Første entry oprettes automatisk</strong></div>
			<div class="meta-row"><span>Mock bruger</span><strong>{data.currentUser.initials}</strong></div>
		</div>
	</div>
</section>

<section class="card">
	<div class="card-header">
		<div>
			<span class="eyebrow">Projektmetadata</span>
			<h2>Grundoplysninger</h2>
		</div>
	</div>

	{#if projectForm?.message}
		<div class="notice">{projectForm.message}</div>
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
				<div class="field-hint">Dette bruges direkte i den automatiske rapportvisning.</div>
			</div>
		</div>

		<div class="inline-actions">
			<button class="button" type="submit">Opret projekt og checkliste</button>
			<a class="button-ghost" href="/">Tilbage til oversigten</a>
		</div>
	</form>
</section>
