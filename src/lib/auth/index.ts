import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compareSync } from 'bcryptjs';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const db = getDb();
        const user = db.select().from(users).where(eq(users.email, email)).get();

        if (!user || !user.isActive) {
          return null;
        }

        const passwordMatch = compareSync(password, user.passwordHash);
        if (!passwordMatch) {
          return null;
        }

        // Update last login
        db.update(users)
          .set({
            lastLoginAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.id, user.id))
          .run();

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          organizationId: user.organizationId ?? undefined,
          title: user.title ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
        token.organizationId = user.organizationId as string;
        token.title = user.title as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.title = token.title;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
});
