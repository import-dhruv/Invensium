import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { config } from '../config';
import { generateOtp, getOtpExpiry } from '../utils/otp';
import { createError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const authService = {
  async register(name: string, email: string, password: string, role?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw createError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (role as UserRole) || 'WAREHOUSE_STAFF',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken(user.id, user.role);
    return { user, token };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw createError('Invalid email or password', 401);
    }

    const token = generateToken(user.id, user.role);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  },

  async requestOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError('No account found with this email', 404);
    }

    // Invalidate previous OTPs
    await prisma.otpToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.otpToken.create({
      data: {
        otp: hashedOtp,
        userId: user.id,
        expiresAt: getOtpExpiry(10),
      },
    });

    // In development, log OTP to console
    if (config.nodeEnv === 'development') {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return { message: 'OTP sent successfully', otp: config.nodeEnv === 'development' ? otp : undefined };
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError('No account found with this email', 404);
    }

    const otpTokens = await prisma.otpToken.findMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (otpTokens.length === 0) {
      throw createError('OTP expired or not found. Please request a new one.', 400);
    }

    const isValidOtp = await bcrypt.compare(otp, otpTokens[0].otp);
    if (!isValidOtp) {
      throw createError('Invalid OTP', 400);
    }

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpTokens[0].id },
      data: { used: true },
    });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw createError('User not found', 404);
    }
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      });
      if (existing) {
        throw createError('Email already in use', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
    return user;
  },
};
