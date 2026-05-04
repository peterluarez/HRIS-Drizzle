import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", { 
  id: uuid("id").primaryKey().defaultRandom(),  
  fullName: varchar("full_name", { length: 255 }).notNull(), 
  email: varchar("email", { length: 255 }).notNull().unique(), 
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  password: text("password").notNull(), 
  role: varchar("role", { length: 50 }).default("employee").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});