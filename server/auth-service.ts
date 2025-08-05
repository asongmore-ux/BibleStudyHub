import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { EmailService } from './email-service.js';
import { User, InsertUser } from '../shared/schema.js';

export interface AuthToken {
  id: string;
  email: string;
  userId: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}

export class AuthService {
  private emailService: EmailService;
  private tokens: Map<string, AuthToken> = new Map();
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'bible-study-hub-secret-key';

  constructor() {
    this.emailService = new EmailService();
  }

  generateJWT(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        isAdmin: user.isAdmin 
      },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyJWT(token: string): { id: string; email: string; isAdmin: boolean } | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { id: string; email: string; isAdmin: boolean };
    } catch {
      return null;
    }
  }

  async createEmailVerificationToken(userId: string, email: string): Promise<string> {
    const tokenId = randomUUID();
    const token: AuthToken = {
      id: tokenId,
      email,
      userId,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };
    
    this.tokens.set(tokenId, token);
    return tokenId;
  }

  async createPasswordResetToken(userId: string, email: string): Promise<string> {
    const tokenId = randomUUID();
    const token: AuthToken = {
      id: tokenId,
      email,
      userId,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      createdAt: new Date(),
    };
    
    this.tokens.set(tokenId, token);
    return tokenId;
  }

  async verifyToken(tokenId: string, type: 'email_verification' | 'password_reset'): Promise<AuthToken | null> {
    const token = this.tokens.get(tokenId);
    
    if (!token || token.type !== type || token.expiresAt < new Date()) {
      if (token) this.tokens.delete(tokenId); // Clean up expired token
      return null;
    }
    
    return token;
  }

  async consumeToken(tokenId: string): Promise<void> {
    this.tokens.delete(tokenId);
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    return this.emailService.sendWelcomeEmail(user.email, user.fullName);
  }

  async sendEmailVerification(user: User): Promise<boolean> {
    const token = await this.createEmailVerificationToken(user.id, user.email);
    // For now, we'll just log the verification URL since we don't have a real email service
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    console.log('📧 Email verification URL for', user.email);
    console.log('🔗', verificationUrl);
    
    // In a real production app, you'd send this via email
    return true;
  }

  async sendPasswordReset(email: string): Promise<boolean> {
    // This would be called after verifying the user exists
    const token = await this.createPasswordResetToken('user-id', email);
    return this.emailService.sendPasswordResetEmail(email, token);
  }

  // Clean up expired tokens periodically
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [tokenId, token] of this.tokens.entries()) {
      if (token.expiresAt < now) {
        this.tokens.delete(tokenId);
      }
    }
  }

  // Enhanced validation for production
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}