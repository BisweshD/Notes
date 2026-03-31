import { requireAuth } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences."
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
            {user.title && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Title</p>
                  <p className="text-sm text-muted-foreground">{user.title}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional settings and preferences will be available in future updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
