import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const gadgets = pgTable("gadgets", {
  id: uuid("id").primaryKey().defaultRandom(), // UUID as primary key
  name: varchar("name", { length: 255 }).notNull(), // String with a max length
  status: varchar("status", { length: 20 })
    .$type<"Available" | "Deployed" | "Destroyed" | "Decommissioned">()
    .notNull(),
});
