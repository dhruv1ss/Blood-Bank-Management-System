import { sequelize, User } from './config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Sync database
        await sequelize.sync({ alter: true });
        console.log('✅ Database sync successful');
        
        // Check if any users exist
        const userCount = await User.count();
        console.log(`📊 Total users in database: ${userCount}`);
        
        // List all users
        const allUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        
        console.log('\n📋 All users:');
        allUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`);
        });
        
        // Create admin if doesn't exist
        const adminEmail = 'admin@lifeflow.com';
        let admin = await User.findOne({ where: { email: adminEmail } });
        
        if (!admin) {
            console.log('\n🔧 Creating admin user...');
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
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
            console.log('\n✅ Admin user already exists');
        }
        
        // Test password verification
        console.log('\n🔐 Testing password verification...');
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log(`Password test result: ${isMatch ? '✅ PASS' : '❌ FAIL'}`);
        
        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('Email: admin@lifeflow.com');
        console.log('Password: admin123');
        console.log('========================\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabase();