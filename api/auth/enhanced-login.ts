import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MemStorage } from '../../server/storage.js';
import { AuthService } from '../../server/auth-service.js';
import { z } from 'zod';

const storage = new MemStorage();
const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
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
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validationResult.error.errors
      });
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // In a real app, you'd verify the hashed password here
    // For this demo, we'll assume password is correct if user exists
    // TODO: Implement proper password hashing with bcrypt
    
    // Generate JWT token
    const token = authService.generateJWT(user);

    console.log(`✅ User logged in: ${user.fullName} (${user.email})`);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      token
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error during login' 
    });
  }
}