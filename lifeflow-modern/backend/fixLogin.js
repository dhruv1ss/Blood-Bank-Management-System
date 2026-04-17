import { sequelize, User } from './config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function fixLogin() {
    try {
        console.log('🔧 Starting login fix process...\n');
        
        // 1. Test database connection
        console.log('1️⃣ Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected successfully\n');
        
        // 2. Sync database
        console.log('2️⃣ Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced successfully\n');
        
        // 3. Create/verify admin user
        console.log('3️⃣ Setting up admin user...');
        const adminEmail = 'admin@lifeflow.com';
        const adminPassword = 'admin123';
        
        let admin = await User.findOne({ where: { email: adminEmail } });
        
        if (!admin) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            
            admin = await User.create({
                name: 'LifeFlow Admin',
                email: adminEmail,
                password: hashedPassword,
                bloodGroup: 'O+',
                age: 30,
                role: 'ADMIN',
                points: 0,
                badge: 'Admin'
            });
            console.log('✅ Admin user created');
        } else {
            console.log('✅ Admin user already exists');
        }
        
        // 4. Test password verification
        console.log('\n4️⃣ Testing password verification...');
        const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
        console.log(`Password verification: ${isPasswordValid ? '✅ PASS' : '❌ FAIL'}`);
        
        if (!isPasswordValid) {
            console.log('🔧 Fixing admin password...');
            const salt = await bcrypt.genSalt(12);
            const newHashedPassword = await bcrypt.hash(adminPassword, salt);
            await admin.update({ password: newHashedPassword });
            console.log('✅ Admin password fixed');
        }
        
        // 5. Test JWT token generation
        console.log('\n5️⃣ Testing JWT token generation...');
        try {
            const payload = {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                name: admin.name,
                iat: Math.floor(Date.now() / 1000)
            };
            
            const secret = process.env.JWT_SECRET;
            console.log('JWT Secret exists:', !!secret);
            
            const token = jwt.sign(payload, secret, { expiresIn: '7d' });
            console.log('✅ JWT token generated successfully');
            
            // Verify token
            const decoded = jwt.verify(token, secret);
            console.log('✅ JWT token verification successful');
            console.log('Token payload:', { id: decoded.id, email: decoded.email, role: decoded.role });
            
        } catch (tokenError) {
            console.error('❌ JWT token error:', tokenError.message);
        }
        
        // 6. Create test donor user
        console.log('\n6️⃣ Creating test donor user...');
        const testEmail = 'test@lifeflow.com';
        const testPassword = 'test123';
        
        let testUser = await User.findOne({ where: { email: testEmail } });
        
        if (!testUser) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(testPassword, salt);
            
            testUser = await User.create({
                name: 'Test User',
                email: testEmail,
                password: hashedPassword,
                bloodGroup: 'A+',
                age: 25,
                role: 'DONOR',
                points: 0,
                badge: 'Starter'
            });
            console.log('✅ Test donor user created');
        } else {
            console.log('✅ Test donor user already exists');
        }
        
        // 7. Summary
        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('👨‍💼 ADMIN LOGIN:');
        console.log('   Email: admin@lifeflow.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('👤 TEST USER LOGIN:');
        console.log('   Email: test@lifeflow.com');
        console.log('   Password: test123');
        console.log('========================\n');
        
        // 8. Database stats
        const totalUsers = await User.count();
        const adminCount = await User.count({ where: { role: 'ADMIN' } });
        const donorCount = await User.count({ where: { role: 'DONOR' } });
        const orgCount = await User.count({ where: { role: 'ORGANIZATION' } });
        
        console.log('📊 DATABASE STATS:');
        console.log(`   Total users: ${totalUsers}`);
        console.log(`   Admins: ${adminCount}`);
        console.log(`   Donors: ${donorCount}`);
        console.log(`   Organizations: ${orgCount}`);
        console.log('');
        
        console.log('🎉 Login fix completed successfully!');
        console.log('🚀 You can now try logging in with the credentials above.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Login fix failed:', error);
        process.exit(1);
    }
}

fixLogin();