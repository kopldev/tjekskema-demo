import type { PageServerLoad } from './$types';
import { getDashboardProjects } from '$lib/server/database';

export const load: PageServerLoad = async () => {
	const projects = await getDashboardProjects();
	const totals = projects.reduce(
		(accumulator, entry) => {
			accumulator.conflicts += entry.summary.conflictCount;
			return accumulator;
		},
		{ conflicts: 0 }
	);

	return {
		projects,
		totals
	};
};
