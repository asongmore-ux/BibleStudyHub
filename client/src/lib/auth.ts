// Authentication utilities and types
// Currently works with the in-memory storage system

import { User } from "@shared/schema";

export interface AuthSession {
  user: User;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
}

// Session storage key
export const AUTH_STORAGE_KEY = 'bible-study-user';

// Get stored user session
export const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const user = JSON.parse(stored);
    return user;
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

// Store user session
export const storeUser = (user: User): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user:', error);
  }
};

// Clear user session
export const clearStoredUser = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.isAdmin === true;
};

// Get user initials for avatar
export const getUserInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  // Additional password requirements can be added here
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Auth error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_EXISTS = 'USER_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
}

// Create auth error
export const createAuthError = (type: AuthErrorType, message: string): AuthError => ({
  type,
  message,
});

// Parse API error to auth error
export const parseAuthError = (error: any): AuthError => {
  if (error.message?.includes('already exists')) {
    return createAuthError(AuthErrorType.USER_EXISTS, 'An account with this email already exists');
  }
  
  if (error.message?.includes('Invalid credentials')) {
    return createAuthError(AuthErrorType.INVALID_CREDENTIALS, 'Invalid email or password');
  }
  
  if (error.message?.includes('Password')) {
    return createAuthError(AuthErrorType.WEAK_PASSWORD, 'Password does not meet requirements');
  }
  
  return createAuthError(AuthErrorType.UNKNOWN_ERROR, error.message || 'An unexpected error occurred');
};

// Future Supabase auth integration helpers
export const supabaseAuthHelpers = {
  // Convert Supabase user to our User type
  convertSupabaseUser: (supabaseUser: any): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    fullName: supabaseUser.user_metadata?.fullName || supabaseUser.email,
    isAdmin: supabaseUser.user_metadata?.isAdmin || false,
    createdAt: new Date(supabaseUser.created_at),
  }),
  
  // Prepare user metadata for Supabase
  prepareUserMetadata: (fullName: string, isAdmin: boolean = false) => ({
    fullName,
    isAdmin,
  }),
};

export default {
  getStoredUser,
  storeUser,
  clearStoredUser,
  isAdmin,
  getUserInitials,
  isValidEmail,
  validatePassword,
  AuthErrorType,
  createAuthError,
  parseAuthError,
  supabaseAuthHelpers,
};
