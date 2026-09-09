import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const records=sqliteTable('records',{id:text('id').primaryKey(),module:text('module').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1)});
export const audit=sqliteTable('audit',{id:text('id').primaryKey(),recordId:text('record_id').notNull(),module:text('module').notNull(),action:text('action').notNull(),before:text('before_data').notNull(),after:text('after_data').notNull(),createdAt:text('created_at').notNull()});
