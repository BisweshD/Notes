import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { patientService } from '@/lib/services/patient.service';
import { getDb } from '@/lib/db';
import { encounters } from '@/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Plus,
  Phone,
  Mail,
  Calendar,
  User,
  Globe,
  FileText,
} from 'lucide-react';

export default async function PatientChartPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  await requireAuth();
  const { patientId } = await params;

  let patient;
  try {
    patient = patientService.getPatient(patientId);
  } catch {
    notFound();
  }

  const db = getDb();
  const patientEncounters = db
    .select()
    .from(encounters)
    .where(and(eq(encounters.patientId, patientId), isNull(encounters.deletedAt)))
    .orderBy(desc(encounters.createdAt))
    .all();

  const statusVariant = patient.status === 'active'
    ? 'default'
    : patient.status === 'discharged'
      ? 'outline'
      : 'secondary';

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function calculateAge(dob: string) {
    const today = new Date();
    const birth = new Date(dob + 'T00:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  const encounterTypeLabels: Record<string, string> = {
    initial_evaluation: 'Initial Evaluation',
    follow_up: 'Follow-Up',
    med_management: 'Medication Management',
    therapy: 'Psychotherapy',
    urgent: 'Urgent Visit',
    telehealth: 'Telehealth',
  };

  const encounterStatusStyles: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    recording: 'bg-red-50 text-red-700 border-red-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    review: 'bg-orange-50 text-orange-700 border-orange-200',
    signed: 'bg-green-50 text-green-700 border-green-200',
    amended: 'bg-teal-50 text-teal-700 border-teal-200',
    cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`${patient.firstName} ${patient.lastName}`}
          description={patient.preferredName ? `Goes by "${patient.preferredName}"` : undefined}
        >
          <Badge variant={statusVariant}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </Badge>
        </PageHeader>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="encounters">
            Encounters ({patientEncounters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    {formatDate(patient.dateOfBirth)} (Age {calculateAge(patient.dateOfBirth)})
                  </span>
                </div>
                {patient.sex && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>
                      {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
                      {patient.pronouns && ` · ${patient.pronouns}`}
                    </span>
                  </div>
                )}
                {patient.primaryLanguage && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{patient.primaryLanguage}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.phone ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No phone on file</p>
                )}
                {patient.email ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{patient.email}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No email on file</p>
                )}
              </CardContent>
            </Card>

            {patient.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="encounters">
          <div className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Link href={`/patients/${patient.id}/encounters/new`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Encounter
                </Button>
              </Link>
            </div>

            {patientEncounters.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-medium">No encounters yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create a new encounter to begin documenting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {patientEncounters.map((enc) => (
                  <Link
                    key={enc.id}
                    href={`/patients/${patient.id}/encounters/${enc.id}`}
                    className="block"
                  >
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-medium">
                            {encounterTypeLabels[enc.encounterType] || enc.encounterType}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {enc.chiefConcern || 'No chief concern'}
                            {' · '}
                            {enc.scheduledAt
                              ? new Date(enc.scheduledAt).toLocaleDateString()
                              : new Date(enc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${encounterStatusStyles[enc.status] || ''}`}
                        >
                          {enc.status.charAt(0).toUpperCase() +
                            enc.status.slice(1).replace('_', ' ')}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
