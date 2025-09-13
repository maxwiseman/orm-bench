import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";

export const benchItems = pgTable(
  "bench_items",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    name: text("name").notNull(),
    value: integer("value").notNull(),
    payload: text("payload").notNull(),
  },
  (table) => {
    return {
      createdIdx: index("idx_bench_items_created_at").on(table.createdAt),
      updatedIdx: index("idx_bench_items_updated_at").on(table.updatedAt),
    };
  }
);
