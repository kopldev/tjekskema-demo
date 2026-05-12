import type {
	Assessment,
	ChecklistItem,
	ChecklistTemplateItem,
	ChecklistTopic,
	Database,
	HistoryEntry,
	ItemStatus,
	Project
} from '$lib/types';

type TopicDefinition = {
	id: string;
	name: string;
	description: string;
	items: Array<{ id: string; question: string }>;
};

const topicDefinitions: TopicDefinition[] = [
	// TODO: Move these seeded templates to an admin-maintained source when template management is introduced.
	{
		id: 'property',
		name: 'Ejendom',
		description: 'Ejerskab, mandat, skel og rådighed over arealet.',
		items: [
			{ id: 'property-mandate', question: 'Er der mandat eller anden accept fra lodsejere til at planlægge for området?' },
			{ id: 'property-access', question: 'Er vej- og adgangsforhold til området afklaret?' },
			{ id: 'property-boundaries', question: 'Er skel og øvrige grænseforhold undersøgt?' },
			{ id: 'property-survey', question: 'Er området opmålt af landinspektør?' }
		]
	},
	{
		id: 'planning',
		name: 'Planforhold',
		description: 'Planmæssige bindinger og behov for planlægning.',
		items: [
			{ id: 'planning-framework', question: 'Er projektet i overensstemmelse med kommuneplanrammen?' },
			{ id: 'planning-local-plan', question: 'Kræver projektet lokalplan?' },
			{ id: 'planning-amendment', question: 'Kræver projektet kommuneplantillæg?' }
		]
	},
	{
		id: 'ownership',
		name: 'Ejerskab og mandat',
		description: 'Beslutningskompetence og interne aftaler.',
		items: [
			{ id: 'ownership-decision', question: 'Er beslutningskompetence og mandat internt afklaret?' },
			{ id: 'ownership-partners', question: 'Er der behov for aftaler med medejere eller andre rettighedshavere?' }
		]
	},
	{
		id: 'easements',
		name: 'Servitutter og rettigheder',
		description: 'Rettigheder og tinglyste forhold på ejendommen.',
		items: [
			{ id: 'easements-review', question: 'Er servitutgennemgang gennemført?' },
			{ id: 'easements-limitations', question: 'Indeholder eksisterende rettigheder begrænsninger for projektet?' }
		]
	},
	{
		id: 'roads',
		name: 'Veje og adgang',
		description: 'Adgang, byggelinjer og vejmyndighedsforhold.',
		items: [
			{ id: 'roads-building-lines', question: 'Er der vejbyggelinjer eller andre vejreservationer i området?' },
			{ id: 'roads-authority', question: 'Er dialog med vejmyndighed nødvendig eller igangsat?' },
			{ id: 'roads-construction', question: 'Kræver projektet ændringer af eksisterende vejforløb eller adgang?' }
		]
	},
	{
		id: 'utilities',
		name: 'Forsyning og LER',
		description: 'Forsyningslinjer, ledningsoplysninger og koordinering.',
		items: [
			{ id: 'utilities-lines', question: 'Er der registrerede forsyningsledninger i området?' },
			{ id: 'utilities-ler', question: 'Er LER-oplysninger eller oplysninger fra ledningsejere indhentet?' },
			{ id: 'utilities-capacity', question: 'Er kapacitet og tilslutningsmuligheder afklaret?' }
		]
	},
	{
		id: 'environment',
		name: 'Miljøforhold',
		description: 'Forurening, jord og miljømæssige bindinger.',
		items: [
			{ id: 'environment-contamination', question: 'Er der kendte forureningsforhold eller jordhåndteringskrav?' },
			{ id: 'environment-permits', question: 'Kræver projektet miljøtilladelser eller andre myndighedsgodkendelser?' },
			{ id: 'environment-climate', question: 'Er der oversvømmelses- eller klimatilpasningsforhold, som påvirker projektet?' }
		]
	},
	{
		id: 'nature',
		name: 'Natur og beskyttelse',
		description: 'Naturbeskyttelse, arter og habitater.',
		items: [
			{ id: 'nature-protected', question: 'Er der beskyttet natur eller naturinteresser tæt på området?' },
			{ id: 'nature-species', question: 'Er der kendte beskyttede arter eller habitater?' },
			{ id: 'nature-forest', question: 'Er der skovbyggelinjer eller andre naturbeskyttelseslinjer?' }
		]
	},
	{
		id: 'heritage',
		name: 'Kulturarv',
		description: 'Fortidsminder, kulturmiljø og museumshensyn.',
		items: [
			{ id: 'heritage-museum', question: 'Er museum eller kulturarvsmyndighed relevant at inddrage?' },
			{ id: 'heritage-sites', question: 'Er der kendte fortidsminder eller kulturmiljøinteresser i området?' }
		]
	},
	{
		id: 'noise',
		name: 'Støj',
		description: 'Støjkilder, grænseværdier og afværge.',
		items: [
			{ id: 'noise-existing', question: 'Er der eksisterende støjkilder, som begrænser projektet?' },
			{ id: 'noise-project', question: 'Skaber projektet selv støjpåvirkninger, som skal håndteres?' }
		]
	},
	{
		id: 'traffic',
		name: 'Trafik',
		description: 'Trafikale konsekvenser, adgang og parkering.',
		items: [
			{ id: 'traffic-access', question: 'Er den eksisterende adgangsvej kapacitetsmæssigt tilstrækkelig?' },
			{ id: 'traffic-impact', question: 'Forventes der væsentlige trafikale påvirkninger?' },
			{ id: 'traffic-parking', question: 'Er parkeringskrav og behov afklaret?' }
		]
	},
	{
		id: 'stakeholders',
		name: 'Interessenter',
		description: 'Naboer, myndigheder og øvrige interessenter.',
		items: [
			{ id: 'stakeholders-neighbours', question: 'Er der naboer eller andre interessenter med forventede indsigelser?' },
			{ id: 'stakeholders-authorities', question: 'Er relevante myndigheder identificeret og kontaktstrategi afklaret?' }
		]
	},
	{
		id: 'economy',
		name: 'Økonomi og tid',
		description: 'Budget, usikkerheder og tidsmæssige bindinger.',
		items: [
			{ id: 'economy-budget', question: 'Er de væsentligste økonomiske usikkerheder identificeret?' },
			{ id: 'economy-schedule', question: 'Er der tidskritiske afhængigheder eller deadlines, der udfordrer projektet?' },
			{ id: 'economy-phasing', question: 'Kræver projektet etapeopdeling eller særlige milepæle?' }
		]
	},
	{
		id: 'other',
		name: 'Andre begrænsninger',
		description: 'Øvrige forhold der ikke passer i de øvrige emner.',
		items: [
			{ id: 'other-risk', question: 'Er der andre væsentlige begrænsninger eller konflikter, som skal belyses?' },
			{ id: 'other-documentation', question: 'Mangler der dokumentation eller analyser, før projektet kan kvalificeres videre?' }
		]
	}
];

function nowAt(date: string) {
	return new Date(date).toISOString();
}

function createTopics(): ChecklistTopic[] {
	return topicDefinitions.map((definition, index) => ({
		id: definition.id,
		name: definition.name,
		description: definition.description,
		sortOrder: index + 1
	}));
}

function createTemplateItems(): ChecklistTemplateItem[] {
	return topicDefinitions.flatMap((definition, topicIndex) =>
		definition.items.map((item, itemIndex) => ({
			id: item.id,
			topicId: definition.id,
			question: item.question,
			sortOrder: topicIndex * 100 + itemIndex + 1
		}))
	);
}

function createProject(project: Omit<Project, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }): Project {
	return project;
}

function applyAssessmentDefaults(
	assessment: Assessment,
	status: ItemStatus = 'not_started'
): Pick<ChecklistItem, 'assessment' | 'status'> {
	return { assessment, status };
}

function instantiateChecklistItems(
	projectId: string,
	templateItems: ChecklistTemplateItem[],
	createdAt: string,
	overrides: Record<string, Partial<ChecklistItem>>
): ChecklistItem[] {
	return templateItems.map((template) => {
		const override = overrides[template.id] ?? {};

		return {
			id: `${projectId}-${template.id}`,
			projectId,
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
			createdAt,
			updatedAt: override.updatedAt ?? createdAt,
			...override
		};
	});
}

function createHistoryEntry(entry: HistoryEntry): HistoryEntry {
	return entry;
}

export function createSeedDatabase(): Database {
	const topics = createTopics();
	const templateItems = createTemplateItems();

	const projectAlpha = createProject({
		id: 'project-solbakken-syd',
		caseNumber: 'KOPL-2026-014',
		title: 'Solbakken Syd',
		area: 'Udvidelse af boligområde mod syd',
		customer: 'KOPL',
		municipality: 'Vejle Kommune',
		projectManager: 'Anne E.',
		nextReviewDate: '2026-05-22',
		summary:
			'Projektet omfatter opstart af nyt boligområde på tidligere landbrugsjord. Fokus er særligt på lodsejermandat, forurening og forsyningsafklaringer.',
		createdAt: nowAt('2026-05-01T08:15:00'),
		updatedAt: nowAt('2026-05-10T14:10:00')
	});

	const projectBeta = createProject({
		id: 'project-stationsnaer',
		caseNumber: 'KOPL-2026-009',
		title: 'Stationsnær Byudvikling',
		area: 'Blandet byudvikling omkring stationsforplads',
		customer: 'KOPL',
		municipality: 'Aarhus Kommune',
		projectManager: 'Jens Kristian H.',
		nextReviewDate: '2026-05-18',
		summary:
			'Projektet er i hovedtræk afklaret planmæssigt, men trafikafvikling og servitutforhold følges fortsat tæt i den næste fase.',
		createdAt: nowAt('2026-04-18T09:00:00'),
		updatedAt: nowAt('2026-05-09T11:30:00')
	});

	const projectGamma = createProject({
		id: 'project-nordmarken',
		caseNumber: 'KOPL-2026-021',
		title: 'Nordmarkens Erhvervspark',
		area: 'Nyt erhvervsområde ved ringvejen',
		customer: 'KOPL',
		municipality: 'Odense Kommune',
		projectManager: 'Maria S.',
		nextReviewDate: '2026-05-28',
		summary:
			'Erhvervsprojekt med høj afhængighed af LER-data, adgangsforhold og afklaring af naturbeskyttelseslinjer. Flere punkter er stadig under undersøgelse.',
		createdAt: nowAt('2026-05-04T10:30:00'),
		updatedAt: nowAt('2026-05-11T08:20:00')
	});

	const checklistItems = [
		...instantiateChecklistItems(projectAlpha.id, templateItems, projectAlpha.createdAt, {
			'property-mandate': {
				answer: 'no',
				...applyAssessmentDefaults('conflict', 'in_progress'),
				consequence: 'Projektet kan ikke kvalificeres til næste fase uden skriftligt mandat fra alle berørte lodsejere.',
				action: 'Indhent skriftlige fuldmagter og accept fra de sidste to lodsejere.',
				responsible: 'AES',
				deadline: '2026-05-20',
				notes: 'To lodsejere har anmodet om yderligere materiale før accept.',
				updatedAt: nowAt('2026-05-10T14:10:00')
			},
			'roads-building-lines': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'in_progress'),
				consequence: 'Byggelinjer reducerer disponibelt byggefelt mod vest.',
				action: 'Afklar dispensation og opdater dispositionsskitse.',
				responsible: 'JHK',
				deadline: '2026-05-24',
				updatedAt: nowAt('2026-05-09T09:45:00')
			},
			'utilities-ler': {
				answer: 'pending',
				...applyAssessmentDefaults('constraint', 'not_started'),
				consequence: 'Manglende LER-data giver usikkerhed om ledningsomlægninger og anlægsøkonomi.',
				action: 'Bestil LER-udtræk og koordinér med forsyningsejere.',
				responsible: 'AES',
				deadline: '2026-05-16',
				updatedAt: nowAt('2026-05-08T08:10:00')
			},
			'environment-contamination': {
				answer: 'yes',
				...applyAssessmentDefaults('conflict', 'in_progress'),
				consequence: 'Potentiel jordforurening kan påvirke disponering, økonomi og tidsplan.',
				action: 'Afvent miljøscreening og beslut prøvetagningsomfang.',
				responsible: 'MHS',
				deadline: '2026-05-19',
				notes: 'Historisk registrering peger på tidligere værkstedsdrift.',
				updatedAt: nowAt('2026-05-10T13:20:00')
			},
			'nature-protected': {
				answer: 'no',
				...applyAssessmentDefaults('no_conflict', 'resolved'),
				notes: 'Ingen registrerede §3-områder inden for det aktuelle afgrænsede projektareal.',
				updatedAt: nowAt('2026-05-07T12:00:00')
			},
			'traffic-impact': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'not_started'),
				consequence: 'Øget myldretidstrafik kan kræve signaloptimering og ny svingbane.',
				action: 'Bestil trafikal screening.',
				responsible: 'JHK',
				deadline: '2026-05-23',
				updatedAt: nowAt('2026-05-09T07:50:00')
			}
		}),
		...instantiateChecklistItems(projectBeta.id, templateItems, projectBeta.createdAt, {
			'planning-framework': {
				answer: 'yes',
				...applyAssessmentDefaults('no_conflict', 'resolved'),
				notes: 'Projektet ligger inden for gældende stationsnær ramme.',
				updatedAt: nowAt('2026-05-02T10:00:00')
			},
			'planning-local-plan': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'in_progress'),
				consequence: 'Lokalplanproces styrer tidsplanen for projektopstart.',
				action: 'Koordinér lokalplanleverancer med planteamet.',
				responsible: 'JHK',
				deadline: '2026-05-21',
				updatedAt: nowAt('2026-05-06T15:20:00')
			},
			'easements-limitations': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'resolved'),
				consequence: 'Eksisterende servitut begrænser facadehøjde mod øst.',
				action: 'Servitut indarbejdet i dispositionsgrundlag.',
				responsible: 'AES',
				deadline: '2026-05-05',
				updatedAt: nowAt('2026-05-05T11:10:00')
			},
			'traffic-access': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'in_progress'),
				consequence: 'Adgangsløsningen kræver justering af afleveringszoner.',
				action: 'Afklar nyt trafikdiagram med rådgiver.',
				responsible: 'AES',
				deadline: '2026-05-17',
				updatedAt: nowAt('2026-05-08T09:10:00')
			},
			'stakeholders-neighbours': {
				answer: 'yes',
				...applyAssessmentDefaults('no_conflict', 'resolved'),
				notes: 'Nabodialog gennemført uden kritiske indsigelser i opstartsfasen.',
				updatedAt: nowAt('2026-05-01T16:00:00')
			}
		}),
		...instantiateChecklistItems(projectGamma.id, templateItems, projectGamma.createdAt, {
			'property-access': {
				answer: 'pending',
				...applyAssessmentDefaults('constraint', 'in_progress'),
				consequence: 'Endelig adgangsløsning afhænger af aftale med vejmyndighed og naboareal.',
				action: 'Planlæg myndighedsmøde og alternativ adgangsskitse.',
				responsible: 'MHS',
				deadline: '2026-05-26',
				updatedAt: nowAt('2026-05-11T08:20:00')
			},
			'utilities-lines': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'in_progress'),
				consequence: 'Hovedledning gennem området kan påvirke byggemodning og placering af regnvandsløsning.',
				action: 'Indarbejd ledningskorridor i situationsplan.',
				responsible: 'JHK',
				deadline: '2026-05-27',
				updatedAt: nowAt('2026-05-10T12:15:00')
			},
			'nature-forest': {
				answer: 'yes',
				...applyAssessmentDefaults('constraint', 'not_started'),
				consequence: 'Skovbyggelinje begrænser det vestlige delområde.',
				action: 'Afklar præcis linjeføring og justér bebyggelsesfelt.',
				responsible: 'AES',
				deadline: '2026-05-30',
				updatedAt: nowAt('2026-05-10T10:00:00')
			},
			'other-documentation': {
				answer: 'yes',
				...applyAssessmentDefaults('conflict', 'not_started'),
				consequence: 'Manglende geotekniske forundersøgelser blokerer dispositionsniveau og økonomivurdering.',
				action: 'Bestil geoteknisk forundersøgelse med hasteprioritet.',
				responsible: 'MHS',
				deadline: '2026-05-22',
				notes: 'Skal koordineres med forsyningsspor og adgangsforhold.',
				updatedAt: nowAt('2026-05-11T07:45:00')
			}
		})
	];

	const historyEntries: HistoryEntry[] = [
		createHistoryEntry({
			id: 'history-alpha-1',
			projectId: projectAlpha.id,
			timestamp: nowAt('2026-05-01T08:15:00'),
			userInitials: 'AES',
			changeType: 'project_created',
			description: 'Projekt oprettet med standardcheckliste.',
			afterValue: '37 checklistpunkter oprettet'
		}),
		createHistoryEntry({
			id: 'history-alpha-2',
			projectId: projectAlpha.id,
			checklistItemId: `${projectAlpha.id}-property-mandate`,
			timestamp: nowAt('2026-05-10T14:10:00'),
			userInitials: 'AES',
			changeType: 'item_updated',
			description: 'Opdaterede lodsejermandat og registrerede konflikt.',
			beforeValue: 'Ikke vurderet / Ikke startet',
			afterValue: 'Konflikt / I gang'
		}),
		createHistoryEntry({
			id: 'history-alpha-3',
			projectId: projectAlpha.id,
			checklistItemId: `${projectAlpha.id}-environment-contamination`,
			timestamp: nowAt('2026-05-10T13:20:00'),
			userInitials: 'MHS',
			changeType: 'item_updated',
			description: 'Tilføjede miljøscreening som opfølgende handling.',
			beforeValue: 'Ikke vurderet / Ikke startet',
			afterValue: 'Konflikt / I gang'
		}),
		createHistoryEntry({
			id: 'history-beta-1',
			projectId: projectBeta.id,
			timestamp: nowAt('2026-04-18T09:00:00'),
			userInitials: 'JHK',
			changeType: 'project_created',
			description: 'Projekt oprettet med standardcheckliste.',
			afterValue: '37 checklistpunkter oprettet'
		}),
		createHistoryEntry({
			id: 'history-beta-2',
			projectId: projectBeta.id,
			checklistItemId: `${projectBeta.id}-easements-limitations`,
			timestamp: nowAt('2026-05-05T11:10:00'),
			userInitials: 'AES',
			changeType: 'review_updated',
			description: 'Servitutforhold markeret som håndteret i dispositionsgrundlaget.',
			beforeValue: 'Begrænsning / I gang',
			afterValue: 'Begrænsning / Løst'
		}),
		createHistoryEntry({
			id: 'history-gamma-1',
			projectId: projectGamma.id,
			timestamp: nowAt('2026-05-04T10:30:00'),
			userInitials: 'MHS',
			changeType: 'project_created',
			description: 'Projekt oprettet med standardcheckliste.',
			afterValue: '37 checklistpunkter oprettet'
		}),
		createHistoryEntry({
			id: 'history-gamma-2',
			projectId: projectGamma.id,
			checklistItemId: `${projectGamma.id}-other-documentation`,
			timestamp: nowAt('2026-05-11T07:45:00'),
			userInitials: 'MHS',
			changeType: 'item_updated',
			description: 'Markerede manglende geoteknik som kritisk konflikt.',
			beforeValue: 'Ikke vurderet / Ikke startet',
			afterValue: 'Konflikt / Ikke startet'
		})
	].sort((left, right) => right.timestamp.localeCompare(left.timestamp));

	return {
		topics,
		templateItems,
		projects: [projectAlpha, projectBeta, projectGamma].sort((left, right) =>
			right.updatedAt.localeCompare(left.updatedAt)
		),
		checklistItems,
		historyEntries
	};
}
