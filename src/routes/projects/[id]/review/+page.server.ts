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

		const reviewItems = detail.summary.reviewItems;
		const values = extractChecklistFormValues(await request.formData());
		const { errors, updates } = validateChecklistForm(values, reviewItems);

		if (!updates) {
			return fail(400, {
				message: 'Ret de markerede reviewfelter, før status gemmes.',
				values,
				errors
			} satisfies ChecklistFormState);
		}

		const result = await updateChecklistItems(params.id, updates, 'review_updated');

		return {
			success: true,
			message:
				result && result.changedCount > 0
					? `${result.changedCount} reviewpunkt(er) blev opdateret.`
					: 'Ingen ændringer at gemme.',
			values
		} satisfies ChecklistFormState;
	}
};
