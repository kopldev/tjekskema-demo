import type {
	Answer,
	Assessment,
	ChecklistField,
	ChecklistFormErrorMap,
	ChecklistFormValueMap,
	ChecklistItem,
	ChecklistItemUpdateInput,
	FieldErrors,
	ItemStatus,
	ProjectField,
	ProjectFormValues,
	ProjectInput
} from '$lib/types';

const projectFields: ProjectField[] = [
	'caseNumber',
	'title',
	'area',
	'customer',
	'municipality',
	'projectManager',
	'nextReviewDate',
	'summary'
];

const checklistFields: ChecklistField[] = [
	'answer',
	'assessment',
	'consequence',
	'action',
	'responsible',
	'deadline',
	'status',
	'documentationUrl',
	'notes'
];

const answers: Answer[] = ['yes', 'no', 'not_relevant', 'pending'];
const assessments: Assessment[] = ['conflict', 'constraint', 'no_conflict', 'not_assessed'];
const statuses: ItemStatus[] = ['not_started', 'in_progress', 'resolved', 'parked'];

function readText(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === 'string' ? value.trim() : '';
}

function isUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

export function extractProjectFormValues(formData: FormData): ProjectFormValues {
	return Object.fromEntries(projectFields.map((field) => [field, readText(formData, field)])) as ProjectFormValues;
}

export function validateProjectForm(values: ProjectFormValues): {
	errors: FieldErrors<ProjectField>;
	input?: ProjectInput;
} {
	const errors: FieldErrors<ProjectField> = {};

	if (!values.caseNumber) errors.caseNumber = 'Sagsnummer er påkrævet.';
	if (!values.title) errors.title = 'Projektnavn er påkrævet.';
	if (!values.area) errors.area = 'Område er påkrævet.';
	if (!values.customer) errors.customer = 'Kunde er påkrævet.';
	if (!values.municipality) errors.municipality = 'Kommune er påkrævet.';
	if (!values.projectManager) errors.projectManager = 'Projektleder er påkrævet.';

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return {
		errors,
		input: {
			caseNumber: values.caseNumber,
			title: values.title,
			area: values.area,
			customer: values.customer,
			municipality: values.municipality,
			projectManager: values.projectManager,
			nextReviewDate: values.nextReviewDate || null,
			summary: values.summary
		}
	};
}

export function extractChecklistFormValues(formData: FormData): ChecklistFormValueMap {
	const values: ChecklistFormValueMap = {};

	for (const [key, rawValue] of formData.entries()) {
		if (typeof rawValue !== 'string') {
			continue;
		}

		const [itemId, field] = key.split('::');

		if (!itemId || !field || !checklistFields.includes(field as ChecklistField)) {
			continue;
		}

		values[itemId] ??= {};
		values[itemId][field as ChecklistField] = rawValue.trim();
	}

	return values;
}

export function validateChecklistForm(
	values: ChecklistFormValueMap,
	currentItems: ChecklistItem[]
): {
	errors: ChecklistFormErrorMap;
	updates?: ChecklistItemUpdateInput[];
} {
	const errors: ChecklistFormErrorMap = {};
	const updates: ChecklistItemUpdateInput[] = [];
	const currentItemsById = new Map(currentItems.map((item) => [item.id, item]));

	for (const item of currentItems) {
		const submitted = values[item.id] ?? {};
		const answer = submitted.answer && answers.includes(submitted.answer as Answer) ? (submitted.answer as Answer) : item.answer;
		const assessment =
			submitted.assessment && assessments.includes(submitted.assessment as Assessment)
				? (submitted.assessment as Assessment)
				: item.assessment;
		const status =
			submitted.status && statuses.includes(submitted.status as ItemStatus)
				? (submitted.status as ItemStatus)
				: item.status;
		const consequence = submitted.consequence ?? item.consequence;
		const action = submitted.action ?? item.action;
		const responsible = submitted.responsible ?? item.responsible;
		const deadline = submitted.deadline ? submitted.deadline : null;
		const documentationUrl = submitted.documentationUrl ?? item.documentationUrl;
		const notes = submitted.notes ?? item.notes;

		const itemErrors: Partial<Record<ChecklistField, string>> = {};

		if ((assessment === 'conflict' || assessment === 'constraint') && consequence.trim().length === 0) {
			itemErrors.consequence = 'Konsekvens er påkrævet ved konflikt eller begrænsning.';
		}

		if ((assessment === 'conflict' || assessment === 'constraint') && action.trim().length === 0) {
			itemErrors.action = 'Handling er påkrævet ved konflikt eller begrænsning.';
		}

		if (documentationUrl.trim().length > 0 && !isUrl(documentationUrl)) {
			itemErrors.documentationUrl = 'Dokumentationslink skal være en gyldig http(s)-URL.';
		}

		if (Object.keys(itemErrors).length > 0) {
			errors[item.id] = itemErrors;
		}

		if (!currentItemsById.has(item.id)) {
			errors[item.id] = { notes: 'Checklistpunktet blev ikke fundet.' };
			continue;
		}

		updates.push({
			id: item.id,
			answer,
			assessment,
			consequence: consequence.trim(),
			action: action.trim(),
			responsible: responsible.trim(),
			deadline,
			status,
			documentationUrl: documentationUrl.trim(),
			notes: notes.trim()
		});
	}

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return { errors, updates };
}
