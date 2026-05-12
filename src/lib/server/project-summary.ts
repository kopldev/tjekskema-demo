import type { ChecklistItem, ChecklistTopic, HistoryEntry, Project, ProjectSummary, TopicGroup } from '$lib/types';

function sortByDeadline(items: ChecklistItem[]) {
	return [...items].sort((left, right) => {
		const leftPriority = left.assessment === 'conflict' ? 0 : 1;
		const rightPriority = right.assessment === 'conflict' ? 0 : 1;

		if (leftPriority !== rightPriority) {
			return leftPriority - rightPriority;
		}

		if (left.deadline && right.deadline) {
			return left.deadline.localeCompare(right.deadline);
		}

		if (left.deadline) {
			return -1;
		}

		if (right.deadline) {
			return 1;
		}

		return left.sortOrder - right.sortOrder;
	});
}

export function isAttentionItem(item: ChecklistItem) {
	return (
		(item.assessment === 'conflict' || item.assessment === 'constraint') &&
		item.status !== 'resolved'
	);
}

export function isOpenAction(item: ChecklistItem) {
	return item.action.trim().length > 0 && item.status !== 'resolved';
}

export function createProjectSummary(
	project: Project,
	items: ChecklistItem[],
	historyEntries: HistoryEntry[]
): ProjectSummary {
	const conflictItems = items.filter((item) => item.assessment === 'conflict');
	const constraintItems = items.filter((item) => item.assessment === 'constraint');
	const reviewItems = sortByDeadline(items.filter(isAttentionItem));
	const openActionItems = sortByDeadline(items.filter(isOpenAction));
	const latestChanges = [...historyEntries]
		.sort((left, right) => right.timestamp.localeCompare(left.timestamp))
		.slice(0, 8);

	return {
		conflictCount: conflictItems.length,
		constraintCount: constraintItems.length,
		openActionsCount: openActionItems.length,
		unresolvedAttentionCount: reviewItems.length,
		nextReviewDate: project.nextReviewDate,
		latestChangeAt: latestChanges[0]?.timestamp ?? project.updatedAt,
		topAttentionItems: reviewItems.slice(0, 5),
		conflictItems: sortByDeadline(conflictItems),
		constraintItems: sortByDeadline(constraintItems),
		openActionItems: openActionItems.slice(0, 8),
		latestChanges,
		reviewItems
	};
}

export function groupItemsByTopic(topics: ChecklistTopic[], items: ChecklistItem[]): TopicGroup[] {
	const itemsByTopic = new Map<string, ChecklistItem[]>();

	for (const item of items) {
		const existing = itemsByTopic.get(item.topicId) ?? [];
		existing.push(item);
		itemsByTopic.set(item.topicId, existing);
	}

	return [...topics]
		.sort((left, right) => left.sortOrder - right.sortOrder)
		.map((topic) => ({
			topic,
			items: (itemsByTopic.get(topic.id) ?? []).sort((left, right) => left.sortOrder - right.sortOrder)
		}))
		.filter((group) => group.items.length > 0);
}
