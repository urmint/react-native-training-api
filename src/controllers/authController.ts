import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import config from '../config/config';
import { ApiResponse } from '../types/common';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 6 characters)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error('User already exists');
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();
    
    // Send response
    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       400:
 *         description: Bad request
 *       401:
 *         description: Invalid credentials
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    
    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );
    
    // Save refresh token to user
    await User.findByIdAndUpdate(user._id, { refreshToken });
    
    // Send response
    const response: ApiResponse = {
      success: true,
      message: 'User logged in successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *       401:
 *         description: Invalid refresh token
 *       404:
 *         description: User not found
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(401);
      throw new Error('Refresh token is required');
    }
    
    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string };
      
      // Find user with this refresh token
      const user = await User.findOne({ _id: decoded.id, refreshToken });
      
      if (!user) {
        res.status(404);
        throw new Error('User not found or refresh token is invalid');
      }
      
      // Generate new access token
      const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
      );
      
      // Send response
      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }
  } catch (error: any) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       401:
 *         description: Not authorized
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};