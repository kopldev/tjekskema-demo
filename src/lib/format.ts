export function formatDate(value: string | null | undefined): string {
	if (!value) {
		return 'Ikke angivet';
	}

	return new Intl.DateTimeFormat('da-DK', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
	if (!value) {
		return 'Ingen ændringer endnu';
	}

	return new Intl.DateTimeFormat('da-DK', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(value));
}

export function toInputDate(value: string | null | undefined): string {
	if (!value) {
		return '';
	}

	return value.slice(0, 10);
}

export function truncate(value: string, length = 120): string {
	if (value.length <= length) {
		return value;
	}

	return `${value.slice(0, length - 1).trimEnd()}…`;
}

export function isPastDue(value: string | null | undefined): boolean {
	if (!value) {
		return false;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return new Date(value) < today;
}

export function presentText(value: string | null | undefined, fallback = 'Ikke angivet'): string {
	return value && value.trim().length > 0 ? value.trim() : fallback;
}
