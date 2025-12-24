import { AuthUser } from './types.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';
import { SecurityUtils } from './security.js';


const JWT_SECRET = process.env.JWT_SECRET;

// Validate that required environment variables are present
if (!JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET environment variable is required');
  console.error('Please set JWT_SECRET in your .env file');
  process.exit(1);
}

export class AuthService {
  private static failedAttempts: Map<string, { count: number; lastAttempt: number; blockedUntil: number }> = new Map();

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET as string,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as any;
      return {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      };
    } catch (error) {
      return null;
    }
  }

  static async createAdminUser(): Promise<AuthUser | null> {
    try {
      const adminPassword = process.env.ADMIN_PASSWORD || 'NetpubAdmin2024!';
      const hashedPassword = await this.hashPassword(adminPassword);

      let adminUser = await prisma.user.findFirst({
        where: { role: 'admin' }
      });

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: process.env.ADMIN_EMAIL || 'admin@netpub.agency',
            name: 'Admin NetPub',
            password: hashedPassword,
            role: 'admin'
          }
        });
        console.log('✅ Utilisateur admin créé avec succès');
      } else {
        console.log('ℹ️ Utilisateur admin existe déjà');
      }
      return {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name || null,
        role: adminUser.role
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
      return null;
    }
  }

  static async authenticateUser(email: string, password: string, ip: string): Promise<AuthUser | null> {
    try {
      // IP blocking logic
      const now = Date.now();
      const attempts = AuthService.failedAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 };

      if (attempts.blockedUntil > now) {
        console.log(`❌ IP ${ip} est bloquée jusqu'à ${new Date(attempts.blockedUntil).toLocaleString()}`);
        return null;
      }

      console.log(`🔐 Tentative d'authentification pour ${email} depuis IP ${ip}`);
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log(`❌ Utilisateur ${email} non trouvé`);
        attempts.count++;
        attempts.lastAttempt = now;
        if (attempts.count >= 3) {
          attempts.blockedUntil = now + 24 * 60 * 60 * 1000; // Block for 24 hours
          console.log(`🚫 IP ${ip} bloquée pour 24 heures suite à des tentatives échouées.`);
        }
        AuthService.failedAttempts.set(ip, attempts);
        return null;
      }

      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log(`❌ Mot de passe invalide pour ${email}`);
        attempts.count++;
        attempts.lastAttempt = now;
        if (attempts.count >= 3) {
          attempts.blockedUntil = now + 24 * 60 * 60 * 1000; // Block for 24 hours
          console.log(`🚫 IP ${ip} bloquée pour 24 heures suite à des tentatives échouées.`);
        }
        AuthService.failedAttempts.set(ip, attempts);
        SecurityUtils.logSecurityEvent('failed_login_attempt', { email, ip });
        return null;
      }

      // Authentication successful, reset attempts for this IP
      AuthService.failedAttempts.delete(ip);
      console.log(`✅ Authentification réussie pour ${email} (rôle: ${user.role}) depuis IP ${ip}`);
      return {
        id: user.id,
        email: user.email,
        name: user.name || null,
        role: user.role
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification:', error);
      return null;
    }
  }

  static async registerUser(email: string, password: string, name?: string): Promise<AuthUser | null> {
    try {
      // Validate input
      if (!email || !password) {
        console.error('❌ Missing required fields for registration:', { email: !!email, password: !!password });
        return null;
      }

      // Validate email format
      const emailRegex = /^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        console.error('❌ Invalid email format for registration:', email);
        return null;
      }

      // Validate password strength
      if (password.length < 8) {
        console.error('❌ Password too short for registration');
        return null;
      }

      const hashedPassword = await this.hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role: 'user'
        }
      });

      console.log(`✅ User registered successfully: ${email}`);
      return {
        id: user.id,
        email: user.email,
        name: user.name || null,
        role: user.role
      };
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === 'P2002') { // Prisma unique constraint violation
        console.error('❌ User registration failed - email already exists:', email);
      } else {
        console.error('❌ User registration failed:', error.message);
      }
      return null;
    }
  }
}