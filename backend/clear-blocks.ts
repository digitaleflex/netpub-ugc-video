import { AuthService } from './lib/auth.js';

// Clear all IP blocks
const failedAttempts = (AuthService as any).failedAttempts;
failedAttempts.clear();

console.log('✅ All IP blocks cleared');
console.log('You can now try logging in again');
