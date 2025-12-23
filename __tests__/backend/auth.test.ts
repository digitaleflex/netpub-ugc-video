import { AuthService } from '../../backend/lib/auth';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock the prisma client
jest.mock('../../backend/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Mock bcrypt functions
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(password === `validPassword`)),
}));

// Mock jsonwebtoken functions
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked_jwt_token'),
  verify: jest.fn(() => ({ userId: '1', email: 'test@example.com', role: 'user' })),
}));

describe('AuthService', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashed = await AuthService.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(await bcrypt.compare(password, hashed)).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testPassword123';
      const hashed = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashed = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'user',
        name: 'Test User',
      };

      // Mock JWT secret
      process.env.JWT_SECRET = 'test-secret';
      const token = AuthService.generateToken(user);

      expect(token).toBeDefined();
      
      // Verify the token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const email = 'newuser@example.com';
      const password = 'SecurePassword123';
      const name = 'New User';

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '2',
        email,
        password: 'hashedPassword',
        role: 'user',
        name,
      });

      const result = await AuthService.registerUser(email, password, name);

      expect(result).toBeDefined();
      expect(result?.email).toBe(email);
      expect(result?.name).toBe(name);
      expect(result?.role).toBe('user');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: expect.any(String), // hashed password
          name,
          role: 'user'
        }
      });
    });

    it('should return null if required fields are missing', async () => {
      const result = await AuthService.registerUser('', 'password');
      expect(result).toBeNull();
    });

    it('should return null if email format is invalid', async () => {
      const result = await AuthService.registerUser('invalid-email', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password is too short', async () => {
      const result = await AuthService.registerUser('test@example.com', '123');
      expect(result).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate a user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'validPassword';
      const hashedPassword = await AuthService.hashPassword(password);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      // Mock JWT secret
      process.env.JWT_SECRET = 'test-secret';
      const result = await AuthService.authenticateUser(email, password, '127.0.0.1');

      expect(result).toBeDefined();
      expect(result?.email).toBe(email);
    });

    it('should return null for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const correctHashedPassword = await AuthService.hashPassword('correctPassword');

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: correctHashedPassword,
      });

      const result = await AuthService.authenticateUser(email, password, '127.0.0.1');
      expect(result).toBeNull();
    });
  });
});