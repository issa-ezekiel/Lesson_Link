import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertLessonSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

// Simple session middleware (in a real app, you'd use express-session with a store)
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

const sessions = new Map<string, { userId: number; expires: Date }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: Function) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionId) {
    return res.status(401).json({ message: "No session token provided" });
  }

  const session = sessions.get(sessionId);
  if (!session || session.expires < new Date()) {
    sessions.delete(sessionId);
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  storage.getUser(session.userId).then(user => {
    if (!user) {
      sessions.delete(sessionId);
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    next();
  }).catch(() => {
    res.status(500).json({ message: "Server error" });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      sessions.set(sessionId, { userId: user.id, expires });

      res.json({
        token: sessionId,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subjectAreas: user.subjectAreas,
          gradeLevels: user.gradeLevels,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subjectAreas: user.subjectAreas,
        gradeLevels: user.gradeLevels,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/users/teachers", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user!.role !== "administrator") {
        return res.status(403).json({ message: "Access denied" });
      }

      const teachers = await storage.getAllTeachers();
      res.json(teachers.map(teacher => ({
        id: teacher.id,
        username: teacher.username,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        subjectAreas: teacher.subjectAreas,
        gradeLevels: teacher.gradeLevels,
      })));
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Lesson routes
  app.get("/api/lessons", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      let lessons;
      if (req.user!.role === "administrator") {
        lessons = await storage.getAllLessons();
      } else {
        lessons = await storage.getLessonsByTeacher(req.user!.id);
      }

      // Get teacher names for lessons
      const lessonsWithTeachers = await Promise.all(
        lessons.map(async (lesson) => {
          const teacher = await storage.getUser(lesson.teacherId);
          return {
            ...lesson,
            teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown",
          };
        })
      );

      res.json(lessonsWithTeachers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/lessons", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const lessonData = insertLessonSchema.parse({
        ...req.body,
        teacherId: req.user!.id,
      });

      const lesson = await storage.createLesson(lessonData);

      // Create progress entries for each standard covered
      if (lesson.standardsCovered && lesson.standardsCovered.length > 0) {
        for (const standardCode of lesson.standardsCovered) {
          const standard = await storage.getStandardByCode(standardCode);
          if (standard) {
            await storage.createProgress({
              teacherId: lesson.teacherId,
              standardId: standard.id,
              completedAt: lesson.dateTaught,
              lessonId: lesson.id,
            });
          }
        }
      }

      res.status(201).json(lesson);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Standards routes
  app.get("/api/standards", requireAuth, async (req, res) => {
    try {
      const { subject, grade, search } = req.query;

      let standards;
      if (search) {
        standards = await storage.searchStandards(search as string);
      } else if (subject) {
        standards = await storage.getStandardsBySubject(subject as string);
      } else if (grade) {
        standards = await storage.getStandardsByGrade(grade as string);
      } else {
        standards = await storage.getAllStandards();
      }

      res.json(standards);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Progress routes
  app.get("/api/progress/:teacherId?", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const teacherId = req.params.teacherId ? parseInt(req.params.teacherId) : req.user!.id;

      // Only allow teachers to see their own progress, admins can see anyone's
      if (req.user!.role === "teacher" && teacherId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const progress = await storage.getProgressByTeacher(teacherId);
      
      // Get standard details for each progress entry
      const progressWithStandards = await Promise.all(
        progress.map(async (p) => {
          const standard = await storage.getStandardById(p.standardId);
          return {
            ...p,
            standard,
          };
        })
      );

      res.json(progressWithStandards);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/stats/:teacherId?", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const teacherId = req.params.teacherId ? parseInt(req.params.teacherId) : req.user!.id;

      // Only allow teachers to see their own stats, admins can see anyone's
      if (req.user!.role === "teacher" && teacherId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getTeacherStats(teacherId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reports routes (admin only)
  app.get("/api/reports/overview", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.user!.role !== "administrator") {
        return res.status(403).json({ message: "Access denied" });
      }

      const teachers = await storage.getAllTeachers();
      const allProgress = await storage.getAllProgress();
      const allLessons = await storage.getAllLessons();
      const allStandards = await storage.getAllStandards();

      const report = {
        totalTeachers: teachers.length,
        totalStandards: allStandards.length,
        totalLessons: allLessons.length,
        totalProgress: allProgress.length,
        averageProgress: allProgress.length / teachers.length / allStandards.length * 100,
        teacherStats: await Promise.all(
          teachers.map(async (teacher) => {
            const stats = await storage.getTeacherStats(teacher.id);
            return {
              teacher: {
                id: teacher.id,
                name: `${teacher.firstName} ${teacher.lastName}`,
                subjectAreas: teacher.subjectAreas,
              },
              ...stats,
              progressPercentage: (stats.completedStandards / stats.totalStandards) * 100,
            };
          })
        ),
      };

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const notifications = await storage.getNotificationsByUser(user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ error: "Failed to fetch unread notification count" });
    }
  });

  // Teacher management routes (admin only)
  app.post("/api/users/teachers", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (user.role !== "administrator") {
        return res.status(403).json({ error: "Access denied. Administrator role required." });
      }

      const { username, password, email, firstName, lastName, subjectAreas, gradeLevels } = req.body;

      // Validate required fields
      if (!username || !password || !email || !firstName || !lastName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      const existingUserByEmail = await storage.getUserByEmail(email);

      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const newTeacher = await storage.createUser({
        username,
        password,
        email,
        firstName,
        lastName,
        role: "teacher",
        subjectAreas: subjectAreas || [],
        gradeLevels: gradeLevels || []
      });

      // Create welcome notification for new teacher
      await storage.createNotification({
        userId: newTeacher.id,
        title: "Welcome to EduTrack!",
        message: "Your account has been created. Start by exploring the standards and adding your first lesson.",
        type: "success",
        read: false
      });

      // Remove password from response
      const { password: _, ...teacherResponse } = newTeacher;
      res.status(201).json(teacherResponse);
    } catch (error) {
      console.error("Error creating teacher:", error);
      res.status(500).json({ error: "Failed to create teacher" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const userId = parseInt(req.params.id);

      // Users can only update their own profile, unless they're an admin
      if (user.role !== "administrator" && user.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      // Don't allow role changes unless admin
      if (user.role !== "administrator" && updates.role) {
        delete updates.role;
      }

      const updatedUser = await storage.updateUser(userId, updates);
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
