import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Placeholder table so Drizzle Kit can run; replace as the app schema grows. */
export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value'),
});
