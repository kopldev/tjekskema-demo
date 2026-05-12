import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ProjectFormState } from '$lib/types';
import { createProject } from '$lib/server/database';
import { extractProjectFormValues, validateProjectForm } from '$lib/server/forms';
import { getCurrentUser } from '$lib/server/current-user';

export const load: PageServerLoad = async () => {
	return {
		currentUser: getCurrentUser()
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const values = extractProjectFormValues(await request.formData());
		const { errors, input } = validateProjectForm(values);

		if (!input) {
			return fail(400, {
				message: 'Ret de markerede felter, før projektet oprettes.',
				values,
				errors
			} satisfies ProjectFormState);
		}

		const project = await createProject(input);
		throw redirect(303, `/projects/${project.id}`);
	}
};
