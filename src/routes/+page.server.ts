import type { PageServerLoad } from './$types';
import { getDashboardProjects } from '$lib/server/database';

export const load: PageServerLoad = async () => {
	const projects = await getDashboardProjects();
	const totals = projects.reduce(
		(accumulator, entry) => {
			accumulator.conflicts += entry.summary.conflictCount;
			accumulator.constraints += entry.summary.constraintCount;
			accumulator.openActions += entry.summary.openActionsCount;
			return accumulator;
		},
		{ conflicts: 0, constraints: 0, openActions: 0 }
	);

	return {
		projects,
		totals
	};
};
