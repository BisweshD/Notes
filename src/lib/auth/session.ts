import { auth } from '@/lib/auth';
import { AuthenticationError } from '@/lib/errors';

/**
 * Session user type with extended properties
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  title?: string;
}

/**
 * Get the current session user or throw AuthenticationError.
 * Use in server components and server actions.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthenticationError();
  }

  return {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: (session.user as Record<string, unknown>).role as string,
    organizationId: (session.user as Record<string, unknown>).organizationId as string,
    title: (session.user as Record<string, unknown>).title as string | undefined,
  };
}

/**
 * Get the current session user or null.
 * Use when auth is optional.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}
