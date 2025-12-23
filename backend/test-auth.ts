import { prisma } from './lib/prisma.js';
import { AuthService } from './lib/auth.js';

async function testAuth() {
    try {
        console.log('🔍 Checking for admin user...');
        const adminEmail = process.env.ADMIN_EMAIL || 'org.netpub@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'NetpubAdmin2024!';

        const user = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!user) {
            console.log('❌ Admin user NOT found in database');
            console.log('Creating admin user...');
            await AuthService.createAdminUser();
            console.log('✅ Admin user created');
        } else {
            console.log('✅ Admin user found:', {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            });

            // Test password verification
            console.log('\n🔐 Testing password verification...');
            const isValid = await AuthService.verifyPassword(adminPassword, user.password);
            console.log(isValid ? '✅ Password is VALID' : '❌ Password is INVALID');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
