import { eq, and, desc } from 'drizzle-orm';
import { db } from './database.js';
import { users, mains, classes, lessons, userProgress } from '../shared/schema.js';
import { 
  type User, 
  type InsertUser, 
  type Main, 
  type InsertMain, 
  type Class, 
  type InsertClass, 
  type Lesson, 
  type InsertLesson, 
  type UserProgress, 
  type InsertUserProgress, 
  type MainWithClasses, 
  type ClassWithLessons, 
  type LessonWithProgress 
} from "../shared/schema.js";
import { IStorage } from "./storage.js";

export class SupabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Main methods
  async getMains(): Promise<MainWithClasses[]> {
    // Get all mains with their classes and lessons
    const mainsData = await db.select().from(mains).orderBy(mains.order);
    const classesData = await db.select().from(classes).orderBy(classes.order);
    const lessonsData = await db.select().from(lessons).orderBy(lessons.order);

    // Build hierarchical structure
    return mainsData.map(main => ({
      ...main,
      classes: classesData
        .filter(cls => cls.mainId === main.id)
        .map(cls => ({
          ...cls,
          lessons: lessonsData.filter(lesson => lesson.classId === cls.id)
        }))
    }));
  }

  async getMain(id: string): Promise<MainWithClasses | undefined> {
    const mainData = await db.select().from(mains).where(eq(mains.id, id)).limit(1);
    if (!mainData[0]) return undefined;

    const classesData = await db.select().from(classes).where(eq(classes.mainId, id)).orderBy(classes.order);
    const lessonsData = await db.select().from(lessons);

    return {
      ...mainData[0],
      classes: classesData.map(cls => ({
        ...cls,
        lessons: lessonsData.filter(lesson => lesson.classId === cls.id)
      }))
    };
  }

  async createMain(main: InsertMain): Promise<Main> {
    const result = await db.insert(mains).values(main).returning();
    return result[0];
  }

  async updateMain(id: string, updates: Partial<Main>): Promise<Main | undefined> {
    const result = await db.update(mains).set(updates).where(eq(mains.id, id)).returning();
    return result[0];
  }

  async deleteMain(id: string): Promise<boolean> {
    const result = await db.delete(mains).where(eq(mains.id, id));
    return (result as any).rowCount > 0;
  }

  // Class methods
  async getClasses(mainId: string): Promise<ClassWithLessons[]> {
    const classesData = await db.select().from(classes).where(eq(classes.mainId, mainId)).orderBy(classes.order);
    const lessonsData = await db.select().from(lessons);

    return classesData.map(cls => ({
      ...cls,
      lessons: lessonsData.filter(lesson => lesson.classId === cls.id)
    }));
  }

  async getClass(id: string): Promise<ClassWithLessons | undefined> {
    const classData = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
    if (!classData[0]) return undefined;

    const lessonsData = await db.select().from(lessons).where(eq(lessons.classId, id)).orderBy(lessons.order);

    return {
      ...classData[0],
      lessons: lessonsData
    };
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const result = await db.insert(classes).values(classData).returning();
    return result[0];
  }

  async updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined> {
    const result = await db.update(classes).set(updates).where(eq(classes.id, id)).returning();
    return result[0];
  }

  async deleteClass(id: string): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id));
    return (result as any).rowCount > 0;
  }

  // Lesson methods
  async getLessons(classId: string, userId?: string): Promise<LessonWithProgress[]> {
    const lessonsData = await db.select().from(lessons).where(eq(lessons.classId, classId)).orderBy(lessons.order);
    
    if (!userId) {
      return lessonsData.map(lesson => ({ ...lesson, progress: undefined }));
    }

    const progressData = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    
    return lessonsData.map(lesson => ({
      ...lesson,
      progress: progressData.find(p => p.lessonId === lesson.id) || undefined
    }));
  }

  async getLesson(id: string, userId?: string): Promise<LessonWithProgress | undefined> {
    const lessonData = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!lessonData[0]) return undefined;

    let progress = undefined;
    if (userId) {
      const progressData = await db.select().from(userProgress)
        .where(and(eq(userProgress.lessonId, id), eq(userProgress.userId, userId)))
        .limit(1);
      progress = progressData[0] || undefined;
    }

    return {
      ...lessonData[0],
      progress
    };
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values(lesson).returning();
    return result[0];
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    const result = await db.update(lessons).set(updates).where(eq(lessons.id, id)).returning();
    return result[0];
  }

  async deleteLesson(id: string): Promise<boolean> {
    const result = await db.delete(lessons).where(eq(lessons.id, id));
    return (result as any).rowCount > 0;
  }

  // User Progress methods
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<UserProgress | undefined> {
    const result = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
      .limit(1);
    return result[0];
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const result = await db.insert(userProgress).values(progress).returning();
    return result[0];
  }

  async updateUserProgress(userId: string, lessonId: string, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const result = await db.update(userProgress)
      .set(updates)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
      .returning();
    return result[0];
  }

  async deleteUserProgress(userId: string, lessonId: string): Promise<boolean> {
    const result = await db.delete(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)));
    return (result as any).rowCount > 0;
  }

  // Search functionality
  async searchLessons(query: string, userId?: string): Promise<LessonWithProgress[]> {
    // Basic search implementation - can be enhanced with full-text search
    const searchResults = await db.select().from(lessons)
      .where(
        // Simple text search in title and content
        // Note: This is a basic implementation, Supabase supports full-text search
        eq(lessons.isPublished, true)
      );

    const filtered = searchResults.filter(lesson =>
      lesson.title.toLowerCase().includes(query.toLowerCase()) ||
      lesson.content.toLowerCase().includes(query.toLowerCase()) ||
      lesson.excerpt?.toLowerCase().includes(query.toLowerCase())
    );

    if (!userId) {
      return filtered.map(lesson => ({ ...lesson, progress: undefined }));
    }

    const progressData = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    
    return filtered.map(lesson => ({
      ...lesson,
      progress: progressData.find(p => p.lessonId === lesson.id) || undefined
    }));
  }
}