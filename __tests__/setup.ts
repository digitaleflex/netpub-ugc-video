// Jest setup file
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.BREVO_SMTP_HOST = 'smtp.test.com';
process.env.BREVO_SMTP_PORT = '587';
process.env.BREVO_SMTP_USER = 'test@test.com';
process.env.BREVO_SMTP_PASS = 'test-password';

// Mock console methods to prevent test output clutter
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};