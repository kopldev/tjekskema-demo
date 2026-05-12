import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getProjectDetail } from '$lib/server/database';
import { getCurrentUser } from '$lib/server/current-user';

export const load: LayoutServerLoad = async ({ params }) => {
	const detail = await getProjectDetail(params.id);

	if (!detail) {
		error(404, 'Projektet blev ikke fundet.');
	}

	return {
		...detail,
		currentUser: getCurrentUser()
	};
};
