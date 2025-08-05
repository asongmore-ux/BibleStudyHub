import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, and, desc, asc, like, ilike } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { users, mains, classes, lessons, userProgress } from "@shared/schema";
import type { 
  User, InsertUser, 
  Main, InsertMain, 
  Class, InsertClass, 
  ClassWithLessons, 
  Lesson, InsertLesson, 
  UserProgress, InsertUserProgress, 
  MainWithClasses, 
  LessonWithProgress 
} from "@shared/schema";
import type { IStorage } from "./storage";

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  // Helper aliases for route compatibility
  getUser = this.getUserById;
  getMain = this.getMainById;
  getClass = this.getClassById;
  getLesson = this.getLessonById;

  async getUserCompletedLessons(userId: string): Promise<LessonWithProgress[]> {
    const completedProgress = await db.select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)))
      .orderBy(desc(userProgress.completedAt));

    return Promise.all(
      completedProgress.map(async (progress) => {
        const lesson = await db.select().from(lessons).where(eq(lessons.id, progress.lessonId)).limit(1);
        return { ...lesson[0]!, progress };
      })
    );
  }
  // User methods
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      isAdmin: insertUser.isAdmin || false,
    }).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Main methods
  async getMainById(id: string): Promise<MainWithClasses | undefined> {
    const main = await db.select().from(mains).where(eq(mains.id, id)).limit(1);
    if (!main[0]) return undefined;

    const mainClasses = await this.getClasses(id);
    const classesWithLessons = await Promise.all(
      mainClasses.map(async (cls) => {
        const classLessons = await this.getLessons(cls.id);
        const subClasses = await this.getSubClasses(cls.id);
        return {
          ...cls,
          lessons: classLessons,
          subClasses: subClasses.length > 0 ? subClasses : undefined,
        };
      })
    );

    return {
      ...main[0],
      classes: classesWithLessons,
    };
  }

  async getMains(): Promise<MainWithClasses[]> {
    const allMains = await db.select().from(mains).orderBy(asc(mains.order));
    
    return Promise.all(
      allMains.map(async (main) => {
        const mainClasses = await this.getClasses(main.id);
        const classesWithLessons = await Promise.all(
          mainClasses.map(async (cls) => {
            const classLessons = await this.getLessons(cls.id);
            const subClasses = await this.getSubClasses(cls.id);
            return {
              ...cls,
              lessons: classLessons,
              subClasses: subClasses.length > 0 ? subClasses : undefined,
            };
          })
        );

        return {
          ...main,
          classes: classesWithLessons,
        };
      })
    );
  }

  async createMain(insertMain: InsertMain): Promise<Main> {
    const result = await db.insert(mains).values({
      ...insertMain,
      order: insertMain.order || 0,
      description: insertMain.description || null,
      icon: insertMain.icon || null,
    }).returning();
    return result[0];
  }

  async updateMain(id: string, updates: Partial<InsertMain>): Promise<Main | undefined> {
    const result = await db.update(mains).set(updates).where(eq(mains.id, id)).returning();
    return result[0];
  }

  async deleteMain(id: string): Promise<boolean> {
    const result = await db.delete(mains).where(eq(mains.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Class methods
  async getClassById(id: string): Promise<ClassWithLessons | undefined> {
    const cls = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
    if (!cls[0]) return undefined;

    const classLessons = await this.getLessons(id);
    const subClasses = await this.getSubClasses(id);

    return {
      ...cls[0],
      lessons: classLessons,
      subClasses: subClasses.length > 0 ? subClasses : undefined,
    };
  }

  async getClasses(mainId: string): Promise<Class[]> {
    return db.select()
      .from(classes)
      .where(eq(classes.mainId, mainId))
      .orderBy(asc(classes.order));
  }

  private async getSubClasses(parentClassId: string): Promise<Class[]> {
    return db.select()
      .from(classes)
      .where(eq(classes.parentClassId, parentClassId))
      .orderBy(asc(classes.order));
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const result = await db.insert(classes).values({
      ...insertClass,
      order: insertClass.order || 0,
      description: insertClass.description || null,
      parentClassId: insertClass.parentClassId || null,
    }).returning();
    return result[0];
  }

  async updateClass(id: string, updates: Partial<InsertClass>): Promise<Class | undefined> {
    const result = await db.update(classes).set(updates).where(eq(classes.id, id)).returning();
    return result[0];
  }

  async deleteClass(id: string): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Lesson methods
  async getLessonById(id: string, userId?: string): Promise<LessonWithProgress | undefined> {
    const lesson = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!lesson[0]) return undefined;

    const progress = userId ? await this.getUserProgress(userId, id) : undefined;
    return { ...lesson[0], progress };
  }

  async getLessons(classId: string, userId?: string): Promise<LessonWithProgress[]> {
    const classLessons = await db.select()
      .from(lessons)
      .where(eq(lessons.classId, classId))
      .orderBy(asc(lessons.order));

    if (!userId) {
      return classLessons.map(lesson => ({ ...lesson, progress: undefined }));
    }

    return Promise.all(
      classLessons.map(async (lesson) => {
        const progress = await this.getUserProgress(userId, lesson.id);
        return { ...lesson, progress };
      })
    );
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values({
      ...insertLesson,
      order: insertLesson.order || 0,
      duration: insertLesson.duration || null,
      excerpt: insertLesson.excerpt || null,
      bibleReference: insertLesson.bibleReference || null,
      imageUrl: insertLesson.imageUrl || null,
      audioUrl: insertLesson.audioUrl || null,
      isPublished: insertLesson.isPublished || false,
    }).returning();
    return result[0];
  }

  async updateLesson(id: string, updates: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const result = await db.update(lessons).set(updates).where(eq(lessons.id, id)).returning();
    return result[0];
  }

  async deleteLesson(id: string): Promise<boolean> {
    const result = await db.delete(lessons).where(eq(lessons.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchLessons(query: string, userId?: string): Promise<LessonWithProgress[]> {
    const searchResults = await db.select()
      .from(lessons)
      .where(
        and(
          eq(lessons.isPublished, true),
          ilike(lessons.content, `%${query}%`)
        )
      )
      .orderBy(desc(lessons.createdAt));

    if (!userId) {
      return searchResults.map(lesson => ({ ...lesson, progress: undefined }));
    }

    return Promise.all(
      searchResults.map(async (lesson) => {
        const progress = await this.getUserProgress(userId, lesson.id);
        return { ...lesson, progress };
      })
    );
  }

  // User progress methods
  async getUserProgress(userId: string, lessonId: string): Promise<UserProgress | undefined> {
    const result = await db.select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
      .limit(1);
    return result[0];
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgress(insertProgress.userId, insertProgress.lessonId);
    
    if (existing) {
      const result = await db.update(userProgress)
        .set({
          ...insertProgress,
          completed: insertProgress.completed || false,
          bookmarked: insertProgress.bookmarked || false,
          studyTime: insertProgress.studyTime || null,
          notes: insertProgress.notes || null,
          completedAt: insertProgress.completed ? new Date() : existing.completedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(userProgress.userId, insertProgress.userId), eq(userProgress.lessonId, insertProgress.lessonId)))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userProgress).values({
        ...insertProgress,
        completed: insertProgress.completed || false,
        bookmarked: insertProgress.bookmarked || false,
        studyTime: insertProgress.studyTime || null,
        notes: insertProgress.notes || null,
        completedAt: insertProgress.completed ? new Date() : null,
      }).returning();
      return result[0];
    }
  }

  async getUserBookmarks(userId: string): Promise<LessonWithProgress[]> {
    const bookmarkedProgress = await db.select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.bookmarked, true)))
      .orderBy(desc(userProgress.updatedAt));

    return Promise.all(
      bookmarkedProgress.map(async (progress) => {
        const lesson = await db.select().from(lessons).where(eq(lessons.id, progress.lessonId)).limit(1);
        return { ...lesson[0]!, progress };
      })
    );
  }
}