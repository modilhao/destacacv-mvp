import {
  users,
  type User,
  type InsertUser,
  cvData,
  InsertCvData,
  CvData,
  payments,
  InsertPayment,
  Payment,
} from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createCvData(insertCvData: InsertCvData): Promise<CvData>;
  getCvData(id: number): Promise<CvData | undefined>;
  updateCvData(id: number, data: Partial<CvData>): Promise<CvData>;
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  updateCvDataPaymentStatus(id: number, status: string): Promise<CvData>;
}

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createCvData(insertCvData: InsertCvData): Promise<CvData> {
    const [newCv] = await db.insert(cvData).values(insertCvData).returning();
    return newCv;
  }

  async getCvData(id: number): Promise<CvData | undefined> {
    const [foundCv] = await db.select().from(cvData).where(eq(cvData.id, id));
    return foundCv || undefined;
  }

  async updateCvData(id: number, data: Partial<CvData>): Promise<CvData> {
    const [updatedCv] = await db
      .update(cvData)
      .set(data)
      .where(eq(cvData.id, id))
      .returning();
    return updatedCv;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async updateCvDataPaymentStatus(id: number, status: string): Promise<CvData> {
    const [cv] = await db
      .update(cvData)
      .set({ paymentStatus: status })
      .where(eq(cvData.id, id))
      .returning();
    return cv;
  }
}

export const storage = new DatabaseStorage();