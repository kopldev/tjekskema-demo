import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { ChecklistFormState } from '$lib/types';
import { getProjectDetail, updateChecklistItems } from '$lib/server/database';
import { extractChecklistFormValues, validateChecklistForm } from '$lib/server/forms';

export const actions: Actions = {
	default: async ({ params, request }) => {
		const detail = await getProjectDetail(params.id);

		if (!detail) {
			return fail(404, {
				message: 'Projektet blev ikke fundet.'
			} satisfies ChecklistFormState);
		}

		const values = extractChecklistFormValues(await request.formData());
		const allItems = detail.topicGroups.flatMap((group) => group.items);
		const { errors, updates } = validateChecklistForm(values, allItems);

		if (!updates) {
			return fail(400, {
				message: 'Ret de markerede felter, før checklisten gemmes.',
				values,
				errors
			} satisfies ChecklistFormState);
		}

		const result = await updateChecklistItems(params.id, updates, 'item_updated');

		return {
			success: true,
			message:
				result && result.changedCount > 0
					? `${result.changedCount} checklistpunkt(er) blev gemt.`
					: 'Ingen ændringer at gemme.',
			values
		} satisfies ChecklistFormState;
	}
};
