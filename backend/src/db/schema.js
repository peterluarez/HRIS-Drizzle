import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", { 
  id: uuid("id").primaryKey().defaultRandom(),
  status: varchar("status", { length: 100 }).default("active").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(), 
  email: varchar("email", { length: 255 }).notNull().unique(), 
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).default("employee").notNull(),
  sss: varchar("sss", { length: 100 }),
  philhealth: varchar("philhealth", { length: 100 }),
  pagibig: varchar("pagibig", { length: 100 }),
  tin: varchar("tin", { length: 100 }),
  hmo: varchar("hmo", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});