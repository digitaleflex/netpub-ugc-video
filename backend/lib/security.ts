import crypto from 'crypto';

// Security utilities
export class SecurityUtils {
  // Generate secure random tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive data
  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate file uploads
  static validateFileUpload(file: any): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      return { valid: false, error: 'Aucun fichier fourni' };
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Type de fichier non autorisé' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Fichier trop volumineux (max 10MB)' };
    }

    return { valid: true };
  }

  // Rate limiting for API endpoints
  static createRateLimiter(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (key: string): boolean => {
      const now = Date.now();
      const record = requests.get(key);

      if (!record || now > record.resetTime) {
        requests.set(key, { count: 1, resetTime: now + windowMs });
        return true;
      }

      if (record.count >= maxRequests) {
        return false;
      }

      record.count++;
      return true;
    };
  }

  // CORS configuration
  static getCorsConfig() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    return {
      origin: (origin: string | undefined, callback: Function) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
  }

  // Helmet security headers
  static getSecurityHeaders() {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  // Helmet config object
  static getHelmetConfig() {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    };
  }

  // SQL injection prevention (additional layer)
  static sanitizeSqlInput(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  // Log security events
  static logSecurityEvent(event: string, details: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY ${timestamp}] ${event}:`, details);

    // In production, you might want to send this to a logging service
    // or store it in a database
  }
}

// Performance optimization utilities
export class PerformanceUtils {
  // Cache implementation
  static createCache<T>(ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    const cache = new Map<string, { data: T; timestamp: number }>();

    return {
      get: (key: string): T | null => {
        const item = cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > ttlMs) {
          cache.delete(key);
          return null;
        }

        return item.data;
      },

      set: (key: string, data: T): void => {
        cache.set(key, { data, timestamp: Date.now() });
      },

      clear: (): void => {
        cache.clear();
      },

      size: (): number => cache.size
    };
  }

  // Database query optimization
  static optimizeQuery(query: any): any {
    // Add pagination defaults
    if (!query.take) {
      query.take = 50; // Default limit
    }

    // Add ordering for consistent results
    if (!query.orderBy) {
      query.orderBy = { createdAt: 'desc' };
    }

    return query;
  }

  // Response compression
  static shouldCompressResponse(req: any): boolean {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    return acceptEncoding.includes('gzip') || acceptEncoding.includes('deflate');
  }

  // Memory usage monitoring
  static getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  // Database connection pooling status
  static async checkDatabaseHealth(): Promise<boolean> {
    try {
      // This would check database connectivity
      // For now, return true
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Monitoring and analytics
export class MonitoringUtils {
  static startTimer(label: string): () => number {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e6; // Convert to milliseconds
      console.log(`${label} took ${duration.toFixed(2)}ms`);
      return duration;
    };
  }

  static trackApiCall(endpoint: string, method: string, duration: number, statusCode: number): void {
    console.log(`API Call: ${method} ${endpoint} - ${statusCode} - ${duration.toFixed(2)}ms`);

    // In production, send to monitoring service like DataDog, New Relic, etc.
  }

  static trackError(error: Error, context?: any): void {
    console.error('Tracked Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // In production, send to error tracking service like Sentry, Rollbar, etc.
  }

  static trackUserAction(userId: string, action: string, details?: any): void {
    console.log(`User Action: ${userId} - ${action}`, details);

    // In production, send to analytics service
  }
}