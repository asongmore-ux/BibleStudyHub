import { type User, type InsertUser, type Main, type InsertMain, type Class, type InsertClass, type Lesson, type InsertLesson, type UserProgress, type InsertUserProgress, type MainWithClasses, type ClassWithLessons, type LessonWithProgress } from "../shared/schema.js";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Main methods
  getMains(): Promise<MainWithClasses[]>;
  getMain(id: string): Promise<MainWithClasses | undefined>;
  createMain(main: InsertMain): Promise<Main>;
  updateMain(id: string, updates: Partial<Main>): Promise<Main | undefined>;
  deleteMain(id: string): Promise<boolean>;

  // Class methods
  getClasses(mainId: string): Promise<ClassWithLessons[]>;
  getClass(id: string): Promise<ClassWithLessons | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;

  // Lesson methods
  getLessons(classId: string, userId?: string): Promise<LessonWithProgress[]>;
  getLesson(id: string, userId?: string): Promise<LessonWithProgress | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<boolean>;
  searchLessons(query: string, userId?: string): Promise<LessonWithProgress[]>;

  // User progress methods
  getUserProgress(userId: string, lessonId: string): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserBookmarks(userId: string): Promise<LessonWithProgress[]>;
  getUserCompletedLessons(userId: string): Promise<LessonWithProgress[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private mains: Map<string, Main> = new Map();
  private classes: Map<string, Class> = new Map();
  private lessons: Map<string, Lesson> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      email: "admin@biblestudyhub.com",
      fullName: "Bible Study Admin",
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample main topic
    const mainTopic: Main = {
      id: randomUUID(),
      title: "People of God in the Bible",
      description: "Explore the lives and characteristics of various people mentioned in Biblical history.",
      icon: "fas fa-users",
      order: 1,
      createdBy: adminUser.id,
      createdAt: new Date(),
    };
    this.mains.set(mainTopic.id, mainTopic);

    // Create sample classes
    const righteousClass: Class = {
      id: randomUUID(),
      title: "Righteous People",
      description: "Learn from the faith and obedience of righteous individuals throughout Biblical history.",
      mainId: mainTopic.id,
      parentClassId: null,
      order: 1,
      createdBy: adminUser.id,
      createdAt: new Date(),
    };
    this.classes.set(righteousClass.id, righteousClass);

    const wickedClass: Class = {
      id: randomUUID(),
      title: "Wicked People",
      description: "Understand the consequences of turning away from God through Biblical examples.",
      mainId: mainTopic.id,
      parentClassId: null,
      order: 2,
      createdBy: adminUser.id,
      createdAt: new Date(),
    };
    this.classes.set(wickedClass.id, wickedClass);

    // Create sample lessons
    const abrahamLesson: Lesson = {
      id: randomUUID(),
      title: "Abraham: The Father of Faith",
      content: "<h2>Abraham's Journey of Faith</h2><p>Abraham's story begins in Genesis 12, where God calls him to leave his homeland and journey to a land that God would show him. This act of obedience demonstrates the essence of faith - trusting God even when we cannot see the full picture.</p><h3>Key Lessons from Abraham's Life:</h3><ul><li><strong>Obedience to God's Call:</strong> When God called Abraham to leave Ur of the Chaldeans, he obeyed without hesitation (Genesis 12:1-4).</li><li><strong>Faith in God's Promises:</strong> Despite being childless at an advanced age, Abraham believed God's promise to make him the father of many nations (Romans 4:16-21).</li><li><strong>Willingness to Sacrifice:</strong> Abraham's willingness to sacrifice Isaac shows his complete trust in God's character and promises (Genesis 22:1-19).</li></ul><p>Abraham's life teaches us that faith is not merely intellectual belief, but active trust that results in obedience to God's will.</p>",
      excerpt: "Discover how Abraham's unwavering faith and obedience to God's call made him the father of many nations.",
      bibleReference: "Genesis 12-22",
      imageUrl: "https://images.unsplash.com/photo-1544967919-6e89ec2cb57b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      audioUrl: null,
      duration: 15,
      classId: righteousClass.id,
      order: 1,
      isPublished: true,
      createdBy: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.set(abrahamLesson.id, abrahamLesson);

    const mosesLesson: Lesson = {
      id: randomUUID(),
      title: "Moses: The Great Lawgiver",
      content: "<h2>Moses: Leader, Prophet, and Lawgiver</h2><p>Moses stands as one of the most significant figures in Biblical history. Chosen by God to lead the Israelites out of Egyptian bondage, Moses' life demonstrates God's power working through willing servants.</p><h3>Moses' Journey:</h3><ul><li><strong>The Burning Bush:</strong> God's call to Moses at the burning bush (Exodus 3:1-17)</li><li><strong>The Ten Plagues:</strong> God's power demonstrated through Moses (Exodus 7-12)</li><li><strong>The Exodus:</strong> Leading God's people out of slavery (Exodus 12-15)</li><li><strong>Receiving the Law:</strong> The Ten Commandments and the Mosaic Law (Exodus 19-24)</li></ul><p>Moses' story teaches us about God's faithfulness, the importance of obedience, and how God can use anyone for His purposes regardless of their perceived limitations.</p>",
      excerpt: "Learn about Moses' role as leader, prophet, and lawgiver who brought God's people out of Egypt.",
      bibleReference: "Exodus 1-40",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      audioUrl: null,
      duration: 22,
      classId: righteousClass.id,
      order: 2,
      isPublished: true,
      createdBy: adminUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.set(mosesLesson.id, mosesLesson);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Main methods
  async getMains(): Promise<MainWithClasses[]> {
    const mains = Array.from(this.mains.values()).sort((a, b) => a.order - b.order);
    const result: MainWithClasses[] = [];

    for (const main of mains) {
      const classes = await this.getClasses(main.id);
      result.push({ ...main, classes });
    }

    return result;
  }

  async getMain(id: string): Promise<MainWithClasses | undefined> {
    const main = this.mains.get(id);
    if (!main) return undefined;
    const classes = await this.getClasses(id);
    return { ...main, classes };
  }

  async createMain(insertMain: InsertMain): Promise<Main> {
    const id = randomUUID();
    const main: Main = {
      ...insertMain,
      id,
      order: insertMain.order || 0,
      description: insertMain.description || null,
      icon: insertMain.icon || null,
      createdAt: new Date(),
    };
    this.mains.set(id, main);
    return main;
  }

  async updateMain(id: string, updates: Partial<Main>): Promise<Main | undefined> {
    const main = this.mains.get(id);
    if (!main) return undefined;
    const updatedMain = { ...main, ...updates };
    this.mains.set(id, updatedMain);
    return updatedMain;
  }

  async deleteMain(id: string): Promise<boolean> {
    return this.mains.delete(id);
  }

  // Class methods
  async getClasses(mainId: string): Promise<ClassWithLessons[]> {
    const classes = Array.from(this.classes.values())
      .filter(c => c.mainId === mainId && !c.parentClassId)
      .sort((a, b) => a.order - b.order);
    
    const result: ClassWithLessons[] = [];

    for (const classItem of classes) {
      const lessons = await this.getLessons(classItem.id);
      const subClasses = Array.from(this.classes.values())
        .filter(c => c.parentClassId === classItem.id)
        .sort((a, b) => a.order - b.order);
      
      result.push({ 
        ...classItem, 
        lessons,
        subClasses: subClasses.length > 0 ? subClasses : undefined
      });
    }

    return result;
  }

  async getClass(id: string): Promise<ClassWithLessons | undefined> {
    const classItem = this.classes.get(id);
    if (!classItem) return undefined;
    const lessons = await this.getLessons(id);
    const subClasses = Array.from(this.classes.values())
      .filter(c => c.parentClassId === id)
      .sort((a, b) => a.order - b.order);
    
    return { 
      ...classItem, 
      lessons,
      subClasses: subClasses.length > 0 ? subClasses : undefined
    };
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = randomUUID();
    const classItem: Class = {
      ...insertClass,
      id,
      order: insertClass.order ?? 0,
      description: insertClass.description ?? null,
      parentClassId: insertClass.parentClassId ?? null,
      createdAt: new Date(),
    };
    this.classes.set(id, classItem);
    return classItem;
  }

  async updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined> {
    const classItem = this.classes.get(id);
    if (!classItem) return undefined;
    const updatedClass = { ...classItem, ...updates };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Lesson methods
  async getLessons(classId: string, userId?: string): Promise<LessonWithProgress[]> {
    const lessons = Array.from(this.lessons.values())
      .filter(l => l.classId === classId && l.isPublished)
      .sort((a, b) => a.order - b.order);

    if (!userId) {
      return lessons.map(lesson => ({ ...lesson, progress: undefined }));
    }

    const result: LessonWithProgress[] = [];
    for (const lesson of lessons) {
      const progress = await this.getUserProgress(userId, lesson.id);
      result.push({ ...lesson, progress });
    }

    return result;
  }

  async getLesson(id: string, userId?: string): Promise<LessonWithProgress | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;

    const progress = userId ? await this.getUserProgress(userId, id) : undefined;
    return { ...lesson, progress };
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      ...insertLesson,
      id,
      order: insertLesson.order || 0,
      duration: insertLesson.duration || null,
      excerpt: insertLesson.excerpt || null,
      bibleReference: insertLesson.bibleReference || null,
      imageUrl: insertLesson.imageUrl || null,
      audioUrl: insertLesson.audioUrl || null,
      isPublished: insertLesson.isPublished || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    const updatedLesson = { ...lesson, ...updates, updatedAt: new Date() };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<boolean> {
    return this.lessons.delete(id);
  }

  async searchLessons(query: string, userId?: string): Promise<LessonWithProgress[]> {
    const lowercaseQuery = query.toLowerCase();
    const lessons = Array.from(this.lessons.values())
      .filter(lesson => 
        lesson.isPublished && (
          lesson.title.toLowerCase().includes(lowercaseQuery) ||
          lesson.content.toLowerCase().includes(lowercaseQuery) ||
          lesson.excerpt?.toLowerCase().includes(lowercaseQuery) ||
          lesson.bibleReference?.toLowerCase().includes(lowercaseQuery)
        )
      );

    if (!userId) {
      return lessons.map(lesson => ({ ...lesson, progress: undefined }));
    }

    const result: LessonWithProgress[] = [];
    for (const lesson of lessons) {
      const progress = await this.getUserProgress(userId, lesson.id);
      result.push({ ...lesson, progress });
    }

    return result;
  }

  // User progress methods
  async getUserProgress(userId: string, lessonId: string): Promise<UserProgress | undefined> {
    const key = `${userId}-${lessonId}`;
    return this.userProgress.get(key);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const key = `${insertProgress.userId}-${insertProgress.lessonId}`;
    const existing = this.userProgress.get(key);
    
    const progress: UserProgress = {
      id: existing?.id || randomUUID(),
      ...insertProgress,
      completed: insertProgress.completed || false,
      bookmarked: insertProgress.bookmarked || false,
      studyTime: insertProgress.studyTime || null,
      notes: insertProgress.notes || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      completedAt: insertProgress.completed ? new Date() : existing?.completedAt || null,
    };
    
    this.userProgress.set(key, progress);
    return progress;
  }

  async getUserBookmarks(userId: string): Promise<LessonWithProgress[]> {
    const bookmarkedProgress = Array.from(this.userProgress.values())
      .filter(p => p.userId === userId && p.bookmarked);
    
    const result: LessonWithProgress[] = [];
    for (const progress of bookmarkedProgress) {
      const lesson = this.lessons.get(progress.lessonId);
      if (lesson && lesson.isPublished) {
        result.push({ ...lesson, progress });
      }
    }

    return result;
  }

  async getUserCompletedLessons(userId: string): Promise<LessonWithProgress[]> {
    const completedProgress = Array.from(this.userProgress.values())
      .filter(p => p.userId === userId && p.completed);
    
    const result: LessonWithProgress[] = [];
    for (const progress of completedProgress) {
      const lesson = this.lessons.get(progress.lessonId);
      if (lesson && lesson.isPublished) {
        result.push({ ...lesson, progress });
      }
    }

    return result;
  }
}

export const storage = new MemStorage();
