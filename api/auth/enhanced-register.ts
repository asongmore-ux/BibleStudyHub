import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MemStorage } from '../../server/storage.js';
import { AuthService } from '../../server/auth-service.js';
import { insertUserSchema } from '../../shared/schema.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const storage = new MemStorage();
const authService = new AuthService();

// Enhanced registration schema with stronger validation
const enhancedRegisterSchema = insertUserSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate input
    const validationResult = enhancedRegisterSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path[0],
          message: err.message
        }))
      });
    }

    const { email, fullName, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Create user account
    const userId = randomUUID();
    const user = await storage.createUser({
      id: userId,
      email,
      fullName,
      isAdmin: false, // Regular users are not admin by default
    });

    // Send welcome email
    const emailSent = await authService.sendWelcomeEmail(user);
    
    // Generate JWT token
    const token = authService.generateJWT(user);

    // For demonstration, also send email verification
    await authService.sendEmailVerification(user);

    console.log(`✅ New user registered: ${user.fullName} (${user.email})`);
    if (emailSent) {
      console.log(`📧 Welcome email sent to ${user.email}`);
    }

    res.status(201).json({
      message: 'Account created successfully! Check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      token,
      emailSent
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error during registration' 
    });
  }
}