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
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  User,
  Globe,
} from 'lucide-react';
import { PatientEncountersTab } from '@/components/patients/patient-encounters-tab';

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
          <PatientEncountersTab
            patientId={patient.id}
            encounters={patientEncounters.map((enc) => ({
              id: enc.id,
              encounterType: enc.encounterType,
              status: enc.status,
              chiefConcern: enc.chiefConcern,
              scheduledAt: enc.scheduledAt,
              createdAt: enc.createdAt,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
