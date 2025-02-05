import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  tg_id: int().notNull().unique(), // telegram id
});

export const addresses = sqliteTable("addresses", {
  id: int().primaryKey({ autoIncrement: true }),
  user_id: int().notNull().references(() => users.id),
  address: text().notNull(), // tron address on hexadecimal format but without 0x and lowercase
  label: text().notNull(), // address label
}, (table) => [
  index("address_idx").on(table.address),
]);
