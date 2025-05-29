import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role", { enum: ["teacher", "administrator"] }).notNull().default("teacher"),
  subjectAreas: text("subject_areas").array().default([]),
  gradeLevels: text("grade_levels").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aerroStandards = pgTable("aerro_standards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subjectArea: text("subject_area").notNull(),
  gradeLevel: text("grade_level").notNull(),
  category: text("category").notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  subjectArea: text("subject_area").notNull(),
  gradeLevel: text("grade_level").notNull(),
  dateTaught: timestamp("date_taught").notNull(),
  standardsCovered: text("standards_covered").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teacherProgress = pgTable("teacher_progress", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  standardId: integer("standard_id").references(() => aerroStandards.id).notNull(),
  completedAt: timestamp("completed_at").notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertStandardSchema = createInsertSchema(aerroStandards).omit({
  id: true,
});

export const insertProgressSchema = createInsertSchema(teacherProgress).omit({
  id: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type AerroStandard = typeof aerroStandards.$inferSelect;
export type InsertStandard = z.infer<typeof insertStandardSchema>;
export type TeacherProgress = typeof teacherProgress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
