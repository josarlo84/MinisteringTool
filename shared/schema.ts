import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // "Elders Quorum", "High Priests"
});

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  companionshipId: integer("companionship_id"),
});

export const companionships = pgTable("companionships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  seniorCompanionId: integer("senior_companion_id").notNull(),
  juniorCompanionId: integer("junior_companion_id"),
  isProposed: boolean("is_proposed").default(false),
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
});

export const insertCompanionshipSchema = createInsertSchema(companionships).omit({
  id: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

export type InsertCompanionship = z.infer<typeof insertCompanionshipSchema>;
export type Companionship = typeof companionships.$inferSelect;

// Extended types for frontend use
export type CompanionshipWithMembers = Companionship & {
  seniorCompanion: Member;
  juniorCompanion?: Member;
  assignedFamilies: Family[];
};
