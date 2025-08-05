import type { Express } from "express";
import { createServer, type Server } from "http";
import { MemStorage } from "./storage";
import { insertUserSchema, insertMainSchema, insertClassSchema, insertLessonSchema, insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";

// Use MemStorage for now until Supabase connection is established
const storage = new MemStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  // First Admin Setup - Only works if no users exist
  app.post("/api/auth/setup-admin", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if any users exist - only allow if database is empty
      const allUsers = await storage.getUsers();
      if (allUsers.length > 0) {
        return res.status(403).json({ message: "Admin already exists. Use regular registration." });
      }
      
      // Create first admin user
      const adminData = { ...userData, isAdmin: true };
      const user = await storage.createUser(adminData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd verify the password hash here
      // For now, we'll accept any password for demo purposes
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Main topic routes
  app.get("/api/mains", async (req, res) => {
    try {
      const mains = await storage.getMains();
      res.json(mains);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/mains/:id", async (req, res) => {
    try {
      const main = await storage.getMain(req.params.id);
      if (!main) {
        return res.status(404).json({ message: "Main topic not found" });
      }
      res.json(main);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/mains", async (req, res) => {
    try {
      const mainData = insertMainSchema.parse(req.body);
      const main = await storage.createMain(mainData);
      res.status(201).json(main);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/mains/:id", async (req, res) => {
    try {
      const updates = req.body;
      const main = await storage.updateMain(req.params.id, updates);
      if (!main) {
        return res.status(404).json({ message: "Main topic not found" });
      }
      res.json(main);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/mains/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMain(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Main topic not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Class routes
  app.get("/api/classes/:id", async (req, res) => {
    try {
      const classData = await storage.getClass(req.params.id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const updates = req.body;
      const classData = await storage.updateClass(req.params.id, updates);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classData);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClass(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lesson routes
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const lesson = await storage.getLesson(req.params.id, userId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/classes/:classId/lessons", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const lessons = await storage.getLessons(req.params.classId, userId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/lessons/:id", async (req, res) => {
    try {
      const updates = req.body;
      const lesson = await storage.updateLesson(req.params.id, updates);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/lessons/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLesson(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search routes
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const userId = req.query.userId as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const lessons = await storage.searchLessons(query, userId);
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress/:lessonId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId, req.params.lessonId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId: req.params.userId,
      });
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.params.userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/completed", async (req, res) => {
    try {
      const completed = await storage.getUserCompletedLessons(req.params.userId);
      res.json(completed);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload routes (placeholder - would need actual file handling in production)
  app.post("/api/upload/image", async (req, res) => {
    try {
      // In a real implementation, you'd handle file upload to cloud storage
      const imageUrl = "https://images.unsplash.com/photo-1544967919-6e89ec2cb57b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
      res.json({ url: imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  app.post("/api/upload/audio", async (req, res) => {
    try {
      // In a real implementation, you'd handle audio file upload
      const audioUrl = "https://example.com/audio/sample.mp3";
      res.json({ url: audioUrl });
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
