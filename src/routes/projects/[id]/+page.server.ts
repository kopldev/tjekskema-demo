import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { ProjectFormState } from '$lib/types';
import { updateProject } from '$lib/server/database';
import { extractProjectFormValues, validateProjectForm } from '$lib/server/forms';

export const actions: Actions = {
	default: async ({ params, request }) => {
		const values = extractProjectFormValues(await request.formData());
		const { errors, input } = validateProjectForm(values);

		if (!input) {
			return fail(400, {
				message: 'Ret de markerede felter, før projektet gemmes.',
				values,
				errors
			} satisfies ProjectFormState);
		}

		const result = await updateProject(params.id, input);

		if (!result) {
			return fail(404, {
				message: 'Projektet blev ikke fundet.'
			} satisfies ProjectFormState);
		}

		return {
			success: true,
			message: result.changed ? 'Projektmetadata er gemt.' : 'Ingen ændringer at gemme.'
		} satisfies ProjectFormState;
	}
};
