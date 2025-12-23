import { AuthService } from './lib/auth.js';

// Access the private failedAttempts map via reflection
const failedAttempts = (AuthService as any).failedAttempts;

console.log('🔍 Checking IP blocking status...');
console.log('Blocked IPs:', Array.from(failedAttempts.entries()));

if (failedAttempts.size === 0) {
  console.log('✅ No IPs are currently blocked');
} else {
  failedAttempts.forEach((value: any, key: string) => {
    const now = Date.now();
    const isBlocked = value.blockedUntil > now;
    console.log(`IP: ${key}`);
    console.log(`  Failed attempts: ${value.count}`);
    console.log(`  Blocked: ${isBlocked}`);
    if (isBlocked) {
      const remainingMs = value.blockedUntil - now;
      console.log(`  Unblocks in: ${Math.ceil(remainingMs / 1000 / 60)} minutes`);
    }
  });
}
