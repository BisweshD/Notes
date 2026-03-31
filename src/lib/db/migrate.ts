import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb } from './index';

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    const db = getDb();
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
