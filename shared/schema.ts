import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cvData = pgTable("cv_data", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  personalData: jsonb("personal_data").notNull(),
  experiences: jsonb("experiences").notNull(),
  skills: jsonb("skills").notNull(),
  education: jsonb("education").notNull().default('[]'),
  languages: jsonb("languages").notNull().default('[]'),
  pdfUrl: text("pdf_url"),
  linkedinSummary: text("linkedin_summary"),
  coverLetter: text("cover_letter"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  cvDataId: integer("cv_data_id").references(() => cvData.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  externalId: text("external_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cvDataRelations = relations(cvData, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  cvData: one(cvData, {
    fields: [payments.cvDataId],
    references: [cvData.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

const skillSchema = z.object({
  technical: z.array(z.string()),
  soft: z.array(z.string()),
})

const educationSchema = z.array(z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
})).default([]);

const languageSchema = z.array(z.object({
  name: z.string(),
  level: z.string(),
})).default([]);

export const insertCvDataSchema = createInsertSchema(cvData, {
  skills: skillSchema,
  education: educationSchema,
  languages: languageSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  pdfUrl: true,
  linkedinSummary: true,
  coverLetter: true,
  paymentStatus: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCvData = z.infer<typeof insertCvDataSchema>;
export type CvData = typeof cvData.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
