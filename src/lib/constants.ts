import type { Answer, Assessment, ChecklistField, ItemStatus, ProjectField } from '$lib/types';

export const answerOptions: Array<{ value: Answer; label: string }> = [
	{ value: 'yes', label: 'Ja' },
	{ value: 'no', label: 'Nej' },
	{ value: 'not_relevant', label: 'Ikke relevant' },
	{ value: 'pending', label: 'Afventer' }
];

export const assessmentOptions: Array<{ value: Assessment; label: string }> = [
	{ value: 'conflict', label: 'Konflikt' },
	{ value: 'constraint', label: 'Begrænsning' },
	{ value: 'no_conflict', label: 'Ingen konflikt eller begrænsning' },
	{ value: 'not_assessed', label: 'Ikke vurderet' }
];

export const statusOptions: Array<{ value: ItemStatus; label: string }> = [
	{ value: 'not_started', label: 'Ikke startet' },
	{ value: 'in_progress', label: 'I gang' },
	{ value: 'resolved', label: 'Løst' },
	{ value: 'parked', label: 'Parkeret' }
];

export const answerLabels: Record<Answer, string> = Object.fromEntries(
	answerOptions.map((option) => [option.value, option.label])
) as Record<Answer, string>;

export const assessmentLabels: Record<Assessment, string> = Object.fromEntries(
	assessmentOptions.map((option) => [option.value, option.label])
) as Record<Assessment, string>;

export const statusLabels: Record<ItemStatus, string> = Object.fromEntries(
	statusOptions.map((option) => [option.value, option.label])
) as Record<ItemStatus, string>;

export const assessmentTones: Record<Assessment, string> = {
	conflict: 'danger',
	constraint: 'warning',
	no_conflict: 'success',
	not_assessed: 'neutral'
};

export const statusTones: Record<ItemStatus, string> = {
	not_started: 'neutral',
	in_progress: 'info',
	resolved: 'success',
	parked: 'warning'
};

export const changeTypeLabels: Record<string, string> = {
	project_created: 'Projekt oprettet',
	project_updated: 'Projekt opdateret',
	item_updated: 'Checklist opdateret',
	review_updated: 'Review opdateret'
};

export const projectFieldLabels: Record<ProjectField, string> = {
	caseNumber: 'Sagsnummer',
	title: 'Projektnavn',
	area: 'Område',
	customer: 'Kunde',
	municipality: 'Kommune',
	projectManager: 'Projektleder',
	nextReviewDate: 'Næste review',
	summary: 'Kort projektresume'
};

export const checklistFieldLabels: Record<ChecklistField, string> = {
	answer: 'Svar',
	assessment: 'Vurdering',
	consequence: 'Konsekvens',
	action: 'Påkrævet handling',
	responsible: 'Ansvarlig',
	deadline: 'Deadline',
	status: 'Status',
	documentationUrl: 'Dokumentationslink',
	notes: 'Interne noter'
};
