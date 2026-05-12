export const mockCurrentUser = {
	initials: 'JHK',
	displayName: 'Jens Kristian H.'
};

// TODO: Replace this mock with Microsoft Entra ID claims and role mapping.
export function getCurrentUser() {
	return mockCurrentUser;
}
