import bcrypt from 'bcryptjs';
import { sequelize, User } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedTestUsers() {
    try {
        await sequelize.sync({ alter: true });

        const salt = await bcrypt.genSalt(10);
        
        // Create test donor users
        const testUsers = [
            {
                name: 'John Doe',
                email: 'john@test.com',
                password: await bcrypt.hash('password123', salt),
                role: 'DONOR',
                bloodGroup: 'O+',
                age: 25,
                city: 'Ahmedabad',
                state: 'Gujarat'
            },
            {
                name: 'Jane Smith',
                email: 'jane@test.com',
                password: await bcrypt.hash('password123', salt),
                role: 'DONOR',
                bloodGroup: 'A+',
                age: 30,
                city: 'Ahmedabad',
                state: 'Gujarat'
            },
            {
                name: 'Mike Johnson',
                email: 'mike@test.com',
                password: await bcrypt.hash('password123', salt),
                role: 'DONOR',
                bloodGroup: 'B+',
                age: 28,
                city: 'Surat',
                state: 'Gujarat'
            }
        ];

        for (const userData of testUsers) {
            const [user, created] = await User.findOrCreate({
                where: { email: userData.email },
                defaults: userData
            });

            if (created) {
                console.log(`✅ Created test user: ${user.name} (${user.email}) - Role: ${user.role}`);
            } else {
                console.log(`ℹ️ Test user already exists: ${user.name} (${user.email}) - Role: ${user.role}`);
            }
        }

        // Show total count
        const totalDonors = await User.count({ where: { role: 'DONOR' } });
        const totalUsers = await User.count();

        console.log('\n=== TEST USERS CREATED ===');
        console.log(`✅ Total DONOR users: ${totalDonors}`);
        console.log(`✅ Total users (all roles): ${totalUsers}`);
        console.log('✅ Test users should now appear in admin panel');
        console.log('==========================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding test users:', error.message);
        process.exit(1);
    }
}

seedTestUsers();