import { getDb } from './index';
import { v4 as uuidv4 } from 'uuid';
import { hashSync } from 'bcryptjs';
import {
  organizations,
  users,
  patients,
  encounters,
  noteTemplates,
  encounterNotes,
  noteSections,
  measurementTypes,
} from './schema';

const db = getDb();

// Fixed IDs for consistent development experience
const ORG_ID = '00000000-0000-0000-0000-000000000001';
const CLINICIAN_ID = '00000000-0000-0000-0000-000000000010';
const PATIENT_IDS = [
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0001-000000000006',
  '00000000-0000-0000-0001-000000000007',
  '00000000-0000-0000-0001-000000000008',
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Organization
  db.insert(organizations)
    .values({
      id: ORG_ID,
      name: 'Clearview Psychiatric Associates',
      settings: JSON.stringify({
        timezone: 'America/New_York',
        defaultEncounterType: 'follow_up',
      }),
    })
    .run();

  // Clinician user (password: "password123")
  db.insert(users)
    .values({
      id: CLINICIAN_ID,
      email: 'dr.chen@clearview.example.com',
      passwordHash: hashSync('password123', 10),
      firstName: 'Sarah',
      lastName: 'Chen',
      title: 'MD',
      credentials: 'Board Certified Psychiatrist',
      role: 'clinician',
      organizationId: ORG_ID,
      isActive: true,
    })
    .run();

  // Patients with diverse demographics
  const patientData = [
    {
      id: PATIENT_IDS[0],
      firstName: 'James',
      lastName: 'Morrison',
      dateOfBirth: '1985-03-15',
      sex: 'male' as const,
      pronouns: 'he/him',
      phone: '(555) 234-5678',
      email: 'james.m@email.example.com',
      primaryLanguage: 'English',
      status: 'active' as const,
      notes: 'History of MDD, currently on sertraline 100mg. Responds well to CBT techniques.',
    },
    {
      id: PATIENT_IDS[1],
      firstName: 'Maria',
      lastName: 'Santos',
      dateOfBirth: '1978-07-22',
      sex: 'female' as const,
      pronouns: 'she/her',
      phone: '(555) 345-6789',
      primaryLanguage: 'Spanish',
      status: 'active' as const,
      notes: 'Generalized anxiety disorder with panic features. Bilingual - prefers Spanish.',
    },
    {
      id: PATIENT_IDS[2],
      firstName: 'Alex',
      lastName: 'Park',
      preferredName: 'Alex',
      dateOfBirth: '1995-11-03',
      sex: 'other' as const,
      genderIdentity: 'Non-binary',
      pronouns: 'they/them',
      phone: '(555) 456-7890',
      status: 'active' as const,
      notes: 'ADHD combined type, managing with stimulant medication. Also in therapy for social anxiety.',
    },
    {
      id: PATIENT_IDS[3],
      firstName: 'Robert',
      lastName: 'Williams',
      dateOfBirth: '1960-01-10',
      sex: 'male' as const,
      pronouns: 'he/him',
      phone: '(555) 567-8901',
      status: 'active' as const,
      notes: 'Bipolar I disorder, stable on lithium + quetiapine. Last manic episode 2 years ago.',
    },
    {
      id: PATIENT_IDS[4],
      firstName: 'Elena',
      lastName: 'Vasquez',
      dateOfBirth: '1990-09-28',
      sex: 'female' as const,
      pronouns: 'she/her',
      phone: '(555) 678-9012',
      status: 'active' as const,
      notes: 'PTSD from motor vehicle accident. Nightmares improving with prazosin. Engaged in PE therapy.',
    },
    {
      id: PATIENT_IDS[5],
      firstName: 'David',
      lastName: 'Kim',
      dateOfBirth: '1972-04-17',
      sex: 'male' as const,
      pronouns: 'he/him',
      phone: '(555) 789-0123',
      status: 'active' as const,
      notes: 'Treatment-resistant depression. Currently on venlafaxine 225mg + aripiprazole augmentation.',
    },
    {
      id: PATIENT_IDS[6],
      firstName: 'Sophie',
      lastName: 'Dubois',
      dateOfBirth: '2001-12-05',
      sex: 'female' as const,
      pronouns: 'she/her',
      phone: '(555) 890-1234',
      status: 'active' as const,
      notes: 'Bulimia nervosa in partial remission. Taking fluoxetine 60mg. Weekly therapy.',
    },
    {
      id: PATIENT_IDS[7],
      firstName: 'Marcus',
      lastName: 'Thompson',
      dateOfBirth: '1988-06-30',
      sex: 'male' as const,
      pronouns: 'he/him',
      phone: '(555) 901-2345',
      status: 'inactive' as const,
      notes: 'Schizophrenia, paranoid type. On paliperidone LAI monthly. Transferred to another provider.',
    },
  ];

  for (const patient of patientData) {
    db.insert(patients)
      .values({
        ...patient,
        organizationId: ORG_ID,
        createdBy: CLINICIAN_ID,
      })
      .run();
  }

  // Sample encounters
  const encounterData = [
    {
      id: uuidv4(),
      patientId: PATIENT_IDS[0],
      encounterType: 'follow_up' as const,
      status: 'signed' as const,
      scheduledAt: '2026-03-24T10:00:00Z',
      startedAt: '2026-03-24T10:02:00Z',
      endedAt: '2026-03-24T10:45:00Z',
      durationSeconds: 2580,
      chiefConcern: 'Follow-up for depression management',
      location: 'in_person' as const,
    },
    {
      id: uuidv4(),
      patientId: PATIENT_IDS[1],
      encounterType: 'med_management' as const,
      status: 'signed' as const,
      scheduledAt: '2026-03-25T14:00:00Z',
      startedAt: '2026-03-25T14:05:00Z',
      endedAt: '2026-03-25T14:30:00Z',
      durationSeconds: 1500,
      chiefConcern: 'Medication review for anxiety',
      location: 'telehealth' as const,
    },
    {
      id: uuidv4(),
      patientId: PATIENT_IDS[0],
      encounterType: 'follow_up' as const,
      status: 'scheduled' as const,
      scheduledAt: '2026-03-31T10:00:00Z',
      chiefConcern: 'Follow-up depression management',
      location: 'in_person' as const,
    },
  ];

  for (const encounter of encounterData) {
    db.insert(encounters)
      .values({
        ...encounter,
        clinicianId: CLINICIAN_ID,
        organizationId: ORG_ID,
      })
      .run();
  }

  // Default note template for follow-up visits
  const followUpTemplateId = uuidv4();
  db.insert(noteTemplates)
    .values({
      id: followUpTemplateId,
      name: 'Psychiatry Follow-Up',
      encounterType: 'follow_up',
      isDefault: true,
      isActive: true,
      sections: JSON.stringify([
        {
          key: 'chief_concern',
          title: 'Chief Concern',
          description: 'Primary reason for today\'s visit',
          order: 1,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'Identify the main reason the patient is being seen today.',
        },
        {
          key: 'history_present_illness',
          title: 'History of Present Illness',
          description: 'Interval history since last visit',
          order: 2,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'Summarize changes in symptoms and functioning since the last visit.',
        },
        {
          key: 'subjective',
          title: 'Subjective',
          description: 'Patient-reported symptoms and concerns',
          order: 3,
          isRequired: false,
          defaultContent: '',
          aiPromptHint: 'Capture patient-reported mood, sleep, appetite, energy, concentration, anxiety, and any other symptoms.',
        },
        {
          key: 'mental_status_exam',
          title: 'Mental Status Exam',
          description: 'Observed mental status findings',
          order: 4,
          isRequired: true,
          defaultContent: 'Appearance: \nBehavior: \nSpeech: \nMood: \nAffect: \nThought Process: \nThought Content: \nPerceptions: \nCognition: \nInsight: \nJudgment: ',
          aiPromptHint: 'Generate a structured mental status exam based on observations noted in the transcript.',
        },
        {
          key: 'risk_assessment',
          title: 'Risk Assessment',
          description: 'Suicide, self-harm, and violence risk evaluation',
          order: 5,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'Summarize any risk factors, protective factors, and current risk level discussed.',
        },
        {
          key: 'medications',
          title: 'Medications & Adherence',
          description: 'Current medications, adherence, side effects, changes',
          order: 6,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'List current medications, adherence, reported side effects, and any changes made.',
        },
        {
          key: 'diagnoses',
          title: 'Diagnoses',
          description: 'Active diagnoses and diagnostic impressions',
          order: 7,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'List active diagnoses with ICD-10 codes if discussed.',
        },
        {
          key: 'assessment',
          title: 'Assessment',
          description: 'Clinical assessment and formulation',
          order: 8,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'Provide a brief clinical assessment integrating subjective and objective findings.',
        },
        {
          key: 'plan',
          title: 'Plan',
          description: 'Treatment plan and next steps',
          order: 9,
          isRequired: true,
          defaultContent: '',
          aiPromptHint: 'Outline the treatment plan including medication changes, therapy recommendations, referrals, and follow-up.',
        },
        {
          key: 'follow_up',
          title: 'Follow-Up',
          description: 'Next appointment and pending items',
          order: 10,
          isRequired: false,
          defaultContent: '',
          aiPromptHint: 'Note the planned follow-up interval and any pending tasks.',
        },
      ]),
    })
    .run();

  // Initial evaluation template
  db.insert(noteTemplates)
    .values({
      id: uuidv4(),
      name: 'Initial Psychiatric Evaluation',
      encounterType: 'initial_evaluation',
      isDefault: true,
      isActive: true,
      sections: JSON.stringify([
        { key: 'chief_concern', title: 'Chief Concern', order: 1, isRequired: true },
        { key: 'history_present_illness', title: 'History of Present Illness', order: 2, isRequired: true },
        { key: 'psychiatric_history', title: 'Past Psychiatric History', order: 3, isRequired: true },
        { key: 'medical_history', title: 'Medical History', order: 4, isRequired: false },
        { key: 'family_history', title: 'Family History', order: 5, isRequired: false },
        { key: 'social_history', title: 'Social History', order: 6, isRequired: true },
        { key: 'substance_use', title: 'Substance Use History', order: 7, isRequired: true },
        { key: 'mental_status_exam', title: 'Mental Status Exam', order: 8, isRequired: true },
        { key: 'risk_assessment', title: 'Risk Assessment', order: 9, isRequired: true },
        { key: 'diagnoses', title: 'Diagnoses', order: 10, isRequired: true },
        { key: 'assessment', title: 'Assessment & Formulation', order: 11, isRequired: true },
        { key: 'plan', title: 'Plan', order: 12, isRequired: true },
      ]),
    })
    .run();

  // Measurement types
  db.insert(measurementTypes)
    .values({
      id: uuidv4(),
      name: 'PHQ-9',
      description: 'Patient Health Questionnaire - 9 item depression scale',
      category: 'depression',
      scoringInfo: JSON.stringify({
        min: 0,
        max: 27,
        ranges: [
          { label: 'Minimal', min: 0, max: 4 },
          { label: 'Mild', min: 5, max: 9 },
          { label: 'Moderate', min: 10, max: 14 },
          { label: 'Moderately Severe', min: 15, max: 19 },
          { label: 'Severe', min: 20, max: 27 },
        ],
      }),
      isActive: true,
    })
    .run();

  db.insert(measurementTypes)
    .values({
      id: uuidv4(),
      name: 'GAD-7',
      description: 'Generalized Anxiety Disorder - 7 item scale',
      category: 'anxiety',
      scoringInfo: JSON.stringify({
        min: 0,
        max: 21,
        ranges: [
          { label: 'Minimal', min: 0, max: 4 },
          { label: 'Mild', min: 5, max: 9 },
          { label: 'Moderate', min: 10, max: 14 },
          { label: 'Severe', min: 15, max: 21 },
        ],
      }),
      isActive: true,
    })
    .run();

  console.log('✅ Seed data inserted successfully');
  console.log('   📋 1 organization');
  console.log('   👤 1 clinician (dr.chen@clearview.example.com / password123)');
  console.log('   🏥 8 patients');
  console.log('   📝 3 encounters');
  console.log('   📄 2 note templates');
  console.log('   📊 2 measurement types (PHQ-9, GAD-7)');
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
