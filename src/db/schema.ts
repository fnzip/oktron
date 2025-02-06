import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  tg_id: int().notNull().unique(), // telegram id
  is_active: int().notNull().default(1), // boolean represented as integer (0 or 1)
  created_at: int().notNull().default(Math.floor(Date.now() / 1000)), // Unix timestamp
});

export const addresses = sqliteTable("addresses", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: int().notNull().references(() => users.id),
  address: text().notNull(), // tron address on hexadecimal format but without 0x and lowercase
  label: text().notNull(), // address label
  created_at: int().notNull().default(Math.floor(Date.now() / 1000)), // Unix timestamp
}, (table) => [
  index("address_idx").on(table.address),
]);
