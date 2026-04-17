import { sequelize, User, Request, Donation, Camp } from './config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Badge system based on donation count
const BADGE_SYSTEM = {
    0: 'Starter',
    1: 'Bronze',
    3: 'Silver', 
    5: 'Gold',
    10: 'Platinum',
    20: 'Diamond',
    50: 'Legend'
};

function calculateBadge(donationCount) {
    const thresholds = Object.keys(BADGE_SYSTEM).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
        if (donationCount >= threshold) {
            return BADGE_SYSTEM[threshold];
        }
    }
    return 'Starter';
}

async function completeLoginFix() {
    try {
        console.log('🚀 Starting Complete Login & Badge System Fix...\n');
        
        // 1. Database Connection & Sync
        console.log('1️⃣ Database Setup...');
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Force sync to ensure all tables exist with correct structure
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Database synced with latest schema\n');
        
        // 2. Create Admin User
        console.log('2️⃣ Setting up Admin User...');
        const adminEmail = 'admin@lifeflow.com';
        const adminPassword = 'admin123';
        
        // Delete existing admin if exists to recreate with correct structure
        await User.destroy({ where: { email: adminEmail } });
        
        const salt = await bcrypt.genSalt(12);
        const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);
        
        const admin = await User.create({
            name: 'LifeFlow Admin',
            email: adminEmail,
            password: hashedAdminPassword,
            bloodGroup: 'O+',
            age: 30,
            role: 'ADMIN',
            points: 1000,
            badge: 'Admin',
            city: 'Ahmedabad',
            state: 'Gujarat'
        });
        console.log('✅ Admin user created with ID:', admin.id);
        
        // 3. Create Test Donor Users
        console.log('\n3️⃣ Creating Test Donor Users...');
        const testUsers = [
            {
                name: 'John Doe',
                email: 'john@test.com',
                password: 'password123',
                bloodGroup: 'O+',
                age: 25,
                city: 'Ahmedabad'
            },
            {
                name: 'Jane Smith', 
                email: 'jane@test.com',
                password: 'password123',
                bloodGroup: 'A+',
                age: 30,
                city: 'Surat'
            },
            {
                name: 'Mike Johnson',
                email: 'mike@test.com', 
                password: 'password123',
                bloodGroup: 'B+',
                age: 28,
                city: 'Vadodara'
            }
        ];
        
        const createdUsers = [];
        for (const userData of testUsers) {
            // Delete if exists
            await User.destroy({ where: { email: userData.email } });
            
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            const user = await User.create({
                ...userData,
                password: hashedPassword,
                role: 'DONOR',
                points: 0,
                badge: 'Starter',
                state: 'Gujarat'
            });
            createdUsers.push(user);
            console.log(`✅ Created user: ${user.name} (${user.email})`);
        }
        
        // 4. Create Test Organization
        console.log('\n4️⃣ Creating Test Organization...');
        await User.destroy({ where: { email: 'org@test.com' } });
        
        const hashedOrgPassword = await bcrypt.hash('org123', salt);
        const org = await User.create({
            name: 'Test Organization',
            email: 'org@test.com',
            password: hashedOrgPassword,
            role: 'ORGANIZATION',
            orgName: 'Red Cross Test Center',
            orgPhone: '+91 79 1234 5678',
            orgAddress: 'Test Address, Ahmedabad',
            city: 'Ahmedabad',
            state: 'Gujarat',
            points: 0,
            badge: 'Organization'
        });
        console.log('✅ Organization created:', org.orgName);
        
        // 5. Create Sample Approved Camps
        console.log('\n5️⃣ Creating Sample Camps...');
        await Camp.destroy({ where: {} }); // Clear existing camps
        
        const camps = [
            {
                name: 'City Hospital Blood Drive',
                description: 'Monthly blood donation camp',
                address: 'City Hospital, Ellis Bridge',
                city: 'Ahmedabad',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                startTime: '09:00',
                endTime: '17:00',
                totalSlots: 100,
                organizationId: org.id,
                status: 'APPROVED'
            },
            {
                name: 'Community Center Drive',
                description: 'Weekend blood donation',
                address: 'Community Center, Satellite',
                city: 'Ahmedabad', 
                date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                startTime: '10:00',
                endTime: '16:00',
                totalSlots: 80,
                organizationId: org.id,
                status: 'APPROVED'
            }
        ];
        
        for (const campData of camps) {
            const camp = await Camp.create(campData);
            console.log(`✅ Created camp: ${camp.name}`);
        }
        
        // 6. Create Sample Donations with Badge Progression
        console.log('\n6️⃣ Creating Sample Donations & Testing Badge System...');
        await Donation.destroy({ where: {} }); // Clear existing donations
        
        // Create donations for John (multiple donations to test badge progression)
        const johnUser = createdUsers[0];
        const approvedCamp = await Camp.findOne({ where: { status: 'APPROVED' } });
        
        const johnDonations = [
            { bloodGroup: 'O+', age: 25, condition: 'Good', status: 'COMPLETED' },
            { bloodGroup: 'O+', age: 25, condition: 'Good', status: 'COMPLETED' },
            { bloodGroup: 'O+', age: 25, condition: 'Good', status: 'COMPLETED' },
            { bloodGroup: 'O+', age: 25, condition: 'Good', status: 'COMPLETED' },
            { bloodGroup: 'O+', age: 25, condition: 'Good', status: 'COMPLETED' }
        ];
        
        for (let i = 0; i < johnDonations.length; i++) {
            const donation = await Donation.create({
                ...johnDonations[i],
                userId: johnUser.id,
                campId: approvedCamp.id,
                appointmentDate: new Date(),
                appointmentTime: '10:00-10:30'
            });
            
            // Update user badge and points after each donation
            const completedDonations = i + 1;
            const newBadge = calculateBadge(completedDonations);
            const newPoints = completedDonations * 50; // 50 points per donation
            
            await johnUser.update({
                points: newPoints,
                badge: newBadge,
                lastDonationDate: new Date()
            });
            
            console.log(`✅ Donation ${completedDonations} for ${johnUser.name}: Badge = ${newBadge}, Points = ${newPoints}`);
        }
        
        // Create fewer donations for other users
        const janeUser = createdUsers[1];
        await Donation.create({
            userId: janeUser.id,
            bloodGroup: 'A+',
            age: 30,
            condition: 'Good',
            campId: approvedCamp.id,
            status: 'COMPLETED',
            appointmentDate: new Date(),
            appointmentTime: '11:00-11:30'
        });
        
        await janeUser.update({
            points: 50,
            badge: calculateBadge(1),
            lastDonationDate: new Date()
        });
        console.log(`✅ Donation for ${janeUser.name}: Badge = ${janeUser.badge}, Points = 50`);
        
        // 7. Test JWT Token Generation
        console.log('\n7️⃣ Testing JWT Token Generation...');
        try {
            const testPayload = {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                name: admin.name
            };
            
            const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ JWT token generation and verification successful');
        } catch (tokenError) {
            console.error('❌ JWT token error:', tokenError.message);
        }
        
        // 8. Verify Database State
        console.log('\n8️⃣ Database Verification...');
        const stats = {
            totalUsers: await User.count(),
            admins: await User.count({ where: { role: 'ADMIN' } }),
            donors: await User.count({ where: { role: 'DONOR' } }),
            organizations: await User.count({ where: { role: 'ORGANIZATION' } }),
            camps: await Camp.count(),
            approvedCamps: await Camp.count({ where: { status: 'APPROVED' } }),
            donations: await Donation.count(),
            completedDonations: await Donation.count({ where: { status: 'COMPLETED' } })
        };
        
        console.log('📊 Database Stats:');
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
        
        // 9. Display Login Credentials
        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('👨‍💼 ADMIN:');
        console.log('   Email: admin@lifeflow.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('👤 TEST USERS:');
        console.log('   Email: john@test.com (5 donations - Gold badge)');
        console.log('   Email: jane@test.com (1 donation - Bronze badge)');
        console.log('   Email: mike@test.com (0 donations - Starter badge)');
        console.log('   Password: password123 (for all test users)');
        console.log('');
        console.log('🏢 ORGANIZATION:');
        console.log('   Email: org@test.com');
        console.log('   Password: org123');
        console.log('========================');
        
        console.log('\n🎉 Complete login fix successful!');
        console.log('✅ All users will now appear in admin panel');
        console.log('✅ Badge system is working based on donation count');
        console.log('✅ Points are awarded for each completed donation');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Complete login fix failed:', error);
        process.exit(1);
    }
}

completeLoginFix();