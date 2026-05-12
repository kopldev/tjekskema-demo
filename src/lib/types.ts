export type Answer = 'yes' | 'no' | 'not_relevant' | 'pending';

export type Assessment = 'conflict' | 'constraint' | 'no_conflict' | 'not_assessed';

export type ItemStatus = 'not_started' | 'in_progress' | 'resolved' | 'parked';

export interface Project {
	id: string;
	caseNumber: string;
	title: string;
	area: string;
	customer: string;
	municipality: string;
	projectManager: string;
	createdAt: string;
	updatedAt: string;
	nextReviewDate: string | null;
	summary: string;
}

export interface ChecklistTopic {
	id: string;
	name: string;
	description: string;
	sortOrder: number;
}

export interface ChecklistTemplateItem {
	id: string;
	topicId: string;
	question: string;
	sortOrder: number;
}

export interface ChecklistItem {
	id: string;
	projectId: string;
	topicId: string;
	question: string;
	answer: Answer;
	assessment: Assessment;
	consequence: string;
	action: string;
	responsible: string;
	deadline: string | null;
	status: ItemStatus;
	documentationUrl: string;
	notes: string;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface HistoryEntry {
	id: string;
	projectId: string;
	checklistItemId?: string | null;
	timestamp: string;
	userInitials: string;
	changeType: string;
	description: string;
	beforeValue?: string | null;
	afterValue?: string | null;
}

export interface Database {
	topics: ChecklistTopic[];
	templateItems: ChecklistTemplateItem[];
	projects: Project[];
	checklistItems: ChecklistItem[];
	historyEntries: HistoryEntry[];
}

export interface TopicGroup {
	topic: ChecklistTopic;
	items: ChecklistItem[];
}

export interface ProjectSummary {
	conflictCount: number;
	constraintCount: number;
	openActionsCount: number;
	unresolvedAttentionCount: number;
	nextReviewDate: string | null;
	latestChangeAt: string | null;
	topAttentionItems: ChecklistItem[];
	conflictItems: ChecklistItem[];
	constraintItems: ChecklistItem[];
	openActionItems: ChecklistItem[];
	latestChanges: HistoryEntry[];
	reviewItems: ChecklistItem[];
}

export interface DashboardProject {
	project: Project;
	summary: ProjectSummary;
}

export interface ProjectDetail {
	project: Project;
	summary: ProjectSummary;
	topicGroups: TopicGroup[];
	historyEntries: HistoryEntry[];
}

export interface ProjectInput {
	caseNumber: string;
	title: string;
	area: string;
	customer: string;
	municipality: string;
	projectManager: string;
	nextReviewDate: string | null;
	summary: string;
}

export interface ChecklistItemUpdateInput {
	id: string;
	answer: Answer;
	assessment: Assessment;
	consequence: string;
	action: string;
	responsible: string;
	deadline: string | null;
	status: ItemStatus;
	documentationUrl: string;
	notes: string;
}

export type ProjectField =
	| 'caseNumber'
	| 'title'
	| 'area'
	| 'customer'
	| 'municipality'
	| 'projectManager'
	| 'nextReviewDate'
	| 'summary';

export type ChecklistField =
	| 'answer'
	| 'assessment'
	| 'consequence'
	| 'action'
	| 'responsible'
	| 'deadline'
	| 'status'
	| 'documentationUrl'
	| 'notes';

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type ProjectFormValues = Record<ProjectField, string>;

export type ChecklistFormValueMap = Record<string, Partial<Record<ChecklistField, string>>>;

export type ChecklistFormErrorMap = Record<string, Partial<Record<ChecklistField, string>>>;

export interface ProjectFormState {
	success?: boolean;
	message?: string;
	values?: ProjectFormValues;
	errors?: FieldErrors<ProjectField>;
}

export interface ChecklistFormState {
	success?: boolean;
	message?: string;
	values?: ChecklistFormValueMap;
	errors?: ChecklistFormErrorMap;
}
