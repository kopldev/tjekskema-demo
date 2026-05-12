import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { answerLabels, assessmentLabels, checklistFieldLabels, projectFieldLabels, statusLabels } from '$lib/constants';
import type {
	ChecklistField,
	ChecklistItem,
	ChecklistItemUpdateInput,
	Database,
	DashboardProject,
	HistoryEntry,
	Project,
	ProjectDetail,
	ProjectField,
	ProjectInput
} from '$lib/types';
import { getCurrentUser } from '$lib/server/current-user';
import { createProjectSummary, groupItemsByTopic } from '$lib/server/project-summary';
import { createSeedDatabase } from '$lib/server/seed';

const dataFilePath = resolve(process.cwd(), 'data', 'db.json');
// TODO: Swap this file-backed repository for SQLite/Prisma or external systems without changing the route layer.

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

async function ensureDatabaseFile() {
	try {
		await readFile(dataFilePath, 'utf8');
	} catch (error) {
		const nodeError = error as NodeJS.ErrnoException;

		if (nodeError.code !== 'ENOENT') {
			throw error;
		}

		await mkdir(dirname(dataFilePath), { recursive: true });
		await writeFile(dataFilePath, JSON.stringify(createSeedDatabase(), null, 2), 'utf8');
	}
}

async function readDatabase(): Promise<Database> {
	await ensureDatabaseFile();
	const raw = await readFile(dataFilePath, 'utf8');
	return JSON.parse(raw) as Database;
}

async function saveDatabase(database: Database) {
	await writeFile(dataFilePath, JSON.stringify(database, null, 2), 'utf8');
}

function getProjectItems(database: Database, projectId: string) {
	return database.checklistItems.filter((item) => item.projectId === projectId);
}

function getProjectHistory(database: Database, projectId: string) {
	return database.historyEntries
		.filter((entry) => entry.projectId === projectId)
		.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function formatFieldValue(field: ProjectField | ChecklistField, value: string | null | undefined) {
	if (field === 'answer') {
		return value ? answerLabels[value as keyof typeof answerLabels] : 'Ikke angivet';
	}

	if (field === 'assessment') {
		return value ? assessmentLabels[value as keyof typeof assessmentLabels] : 'Ikke angivet';
	}

	if (field === 'status') {
		return value ? statusLabels[value as keyof typeof statusLabels] : 'Ikke angivet';
	}

	return value && value.trim().length > 0 ? value : 'Ikke angivet';
}

function buildChangedFieldSummary<T extends object>(
	beforeValue: T,
	afterValue: T,
	fields: string[],
	labels: Record<string, string>
) {
	const beforeRecord = beforeValue as Record<string, unknown>;
	const afterRecord = afterValue as Record<string, unknown>;
	const beforeSummary = fields
		.map(
			(field) =>
				`${labels[field]}: ${formatFieldValue(field as ProjectField | ChecklistField, String(beforeRecord[field] ?? ''))}`
		)
		.join(' | ');
	const afterSummary = fields
		.map(
			(field) =>
				`${labels[field]}: ${formatFieldValue(field as ProjectField | ChecklistField, String(afterRecord[field] ?? ''))}`
		)
		.join(' | ');

	return {
		beforeValue: beforeSummary,
		afterValue: afterSummary
	};
}

function markProjectUpdated(project: Project, timestamp: string) {
	project.updatedAt = timestamp;
}

function createHistoryEntry(entry: HistoryEntry): HistoryEntry {
	return entry;
}

export async function getDashboardProjects(): Promise<DashboardProject[]> {
	const database = await readDatabase();

	return database.projects
		.map((project) => {
			const items = getProjectItems(database, project.id);
			const historyEntries = getProjectHistory(database, project.id);
			const summary = createProjectSummary(project, items, historyEntries);

			return { project, summary };
		})
		.sort((left, right) => right.project.updatedAt.localeCompare(left.project.updatedAt));
}

export async function getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
	const database = await readDatabase();
	const project = database.projects.find((entry) => entry.id === projectId);

	if (!project) {
		return null;
	}

	const items = getProjectItems(database, project.id);
	const historyEntries = getProjectHistory(database, project.id);

	return {
		project,
		summary: createProjectSummary(project, items, historyEntries),
		topicGroups: groupItemsByTopic(database.topics, items),
		historyEntries
	};
}

export async function createProject(input: ProjectInput, userInitials = getCurrentUser().initials) {
	const database = await readDatabase();
	const timestamp = new Date().toISOString();

	const project: Project = {
		id: crypto.randomUUID(),
		caseNumber: input.caseNumber,
		title: input.title,
		area: input.area,
		customer: input.customer,
		municipality: input.municipality,
		projectManager: input.projectManager,
		nextReviewDate: input.nextReviewDate,
		summary: input.summary,
		createdAt: timestamp,
		updatedAt: timestamp
	};

	const newItems: ChecklistItem[] = database.templateItems.map((template) => ({
		id: crypto.randomUUID(),
		projectId: project.id,
		topicId: template.topicId,
		question: template.question,
		answer: 'pending',
		assessment: 'not_assessed',
		consequence: '',
		action: '',
		responsible: '',
		deadline: null,
		status: 'not_started',
		documentationUrl: '',
		notes: '',
		sortOrder: template.sortOrder,
		createdAt: timestamp,
		updatedAt: timestamp
	}));
	// TODO: Later this is where EA Tools, LER, or SharePoint bootstrap data can enrich new projects.

	database.projects.unshift(project);
	database.checklistItems.push(...newItems);
	database.historyEntries.unshift(
		createHistoryEntry({
			id: crypto.randomUUID(),
			projectId: project.id,
			timestamp,
			userInitials,
			changeType: 'project_created',
			description: 'Projekt oprettet med standardcheckliste.',
			afterValue: `${newItems.length} checklistpunkter oprettet`
		})
	);

	await saveDatabase(database);

	return project;
}

export async function updateProject(
	projectId: string,
	input: ProjectInput,
	userInitials = getCurrentUser().initials
) {
	const database = await readDatabase();
	const project = database.projects.find((entry) => entry.id === projectId);

	if (!project) {
		return null;
	}

	const beforeValue = clone(project);
	project.caseNumber = input.caseNumber;
	project.title = input.title;
	project.area = input.area;
	project.customer = input.customer;
	project.municipality = input.municipality;
	project.projectManager = input.projectManager;
	project.nextReviewDate = input.nextReviewDate;
	project.summary = input.summary;

	const changedFields = (Object.keys(projectFieldLabels) as ProjectField[]).filter(
		(field) => beforeValue[field] !== project[field]
	);

	if (changedFields.length === 0) {
		return { project, changed: false };
	}

	const timestamp = new Date().toISOString();
	markProjectUpdated(project, timestamp);
	const summary = buildChangedFieldSummary(beforeValue, project, changedFields, projectFieldLabels);

	database.historyEntries.unshift(
		createHistoryEntry({
			id: crypto.randomUUID(),
			projectId,
			timestamp,
			userInitials,
			changeType: 'project_updated',
			description: `Opdaterede projektmetadata: ${changedFields
				.map((field) => projectFieldLabels[field])
				.join(', ')}.`,
			beforeValue: summary.beforeValue,
			afterValue: summary.afterValue
		})
	);

	await saveDatabase(database);

	return { project, changed: true };
}

export async function updateChecklistItems(
	projectId: string,
	updates: ChecklistItemUpdateInput[],
	changeType: 'item_updated' | 'review_updated' = 'item_updated',
	userInitials = getCurrentUser().initials
) {
	const database = await readDatabase();
	const project = database.projects.find((entry) => entry.id === projectId);

	if (!project) {
		return null;
	}

	const updatesById = new Map(updates.map((update) => [update.id, update]));
	const timestamp = new Date().toISOString();
	let changedCount = 0;

	for (const item of database.checklistItems) {
		if (item.projectId !== projectId) {
			continue;
		}

		const update = updatesById.get(item.id);

		if (!update) {
			continue;
		}

		const beforeValue = clone(item);
		item.answer = update.answer;
		item.assessment = update.assessment;
		item.consequence = update.consequence;
		item.action = update.action;
		item.responsible = update.responsible;
		item.deadline = update.deadline;
		item.status = update.status;
		item.documentationUrl = update.documentationUrl;
		item.notes = update.notes;

		const changedFields = (Object.keys(checklistFieldLabels) as ChecklistField[]).filter(
			(field) => beforeValue[field] !== item[field]
		);

		if (changedFields.length === 0) {
			continue;
		}

		item.updatedAt = timestamp;
		changedCount += 1;
		const summary = buildChangedFieldSummary(beforeValue, item, changedFields, checklistFieldLabels);
		database.historyEntries.unshift(
			createHistoryEntry({
				id: crypto.randomUUID(),
				projectId,
				checklistItemId: item.id,
				timestamp,
				userInitials,
				changeType,
				description: `Opdaterede "${item.question}".`,
				beforeValue: summary.beforeValue,
				afterValue: summary.afterValue
			})
		);
	}

	if (changedCount === 0) {
		return { changedCount: 0 };
	}

	markProjectUpdated(project, timestamp);
	await saveDatabase(database);

	return { changedCount };
}
