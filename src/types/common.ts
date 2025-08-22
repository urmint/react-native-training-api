import { Request, Response } from 'express';

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name?: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface TaskDocument {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
}