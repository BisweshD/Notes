import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { patients, encounters } from '@/lib/db/schema';
import { eq, and, isNull, desc, count } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await auth();
  const db = getDb();

  const userId = session?.user?.id;
  const orgId = session?.user?.organizationId as string;

  // Get patient count
  const patientCount = db
    .select({ count: count() })
    .from(patients)
    .where(and(eq(patients.organizationId, orgId), isNull(patients.deletedAt)))
    .get();

  // Get recent encounters
  const recentEncounters = db
    .select({
      id: encounters.id,
      status: encounters.status,
      encounterType: encounters.encounterType,
      scheduledAt: encounters.scheduledAt,
      chiefConcern: encounters.chiefConcern,
      patientId: encounters.patientId,
    })
    .from(encounters)
    .where(and(eq(encounters.clinicianId, userId!), isNull(encounters.deletedAt)))
    .orderBy(desc(encounters.createdAt))
    .limit(5)
    .all();

  // Get unsigned encounters count
  const unsignedCount = db
    .select({ count: count() })
    .from(encounters)
    .where(
      and(
        eq(encounters.clinicianId, userId!),
        eq(encounters.status, 'review'),
        isNull(encounters.deletedAt),
      ),
    )
    .get();

  const firstName = session?.user?.name?.split(' ')[0] || 'Doctor';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${getGreeting()}, ${firstName}`}
        description="Here's your clinical workspace overview."
      >
        <Link href="/patients">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCount?.count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notes to Review
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unsignedCount?.count ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Encounters
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEncounters.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Encounters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Encounters</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEncounters.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No encounters yet. Start by creating a patient.
            </p>
          ) : (
            <div className="space-y-3">
              {recentEncounters.map((encounter) => (
                <Link
                  key={encounter.id}
                  href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {encounter.chiefConcern || 'No chief concern'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatEncounterType(encounter.encounterType)} •{' '}
                      {encounter.scheduledAt
                        ? new Date(encounter.scheduledAt).toLocaleDateString()
                        : 'Unscheduled'}
                    </p>
                  </div>
                  <EncounterStatusBadge status={encounter.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatEncounterType(type: string): string {
  const labels: Record<string, string> = {
    initial_evaluation: 'Initial Evaluation',
    follow_up: 'Follow-Up',
    med_management: 'Medication Management',
    therapy: 'Psychotherapy',
    urgent: 'Urgent Visit',
    telehealth: 'Telehealth',
  };
  return labels[type] || type;
}

function EncounterStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    recording: 'bg-red-50 text-red-700 border-red-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    review: 'bg-orange-50 text-orange-700 border-orange-200',
    signed: 'bg-green-50 text-green-700 border-green-200',
    amended: 'bg-teal-50 text-teal-700 border-teal-200',
    cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  const labels: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    recording: 'Recording',
    processing: 'Processing',
    review: 'Review',
    signed: 'Signed',
    amended: 'Amended',
    cancelled: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] || styles.scheduled}`}
    >
      {labels[status] || status}
    </span>
  );
}
