import { sequelize, User } from './config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Sync without force to avoid dropping tables
        await sequelize.sync({ alter: true });
        console.log('Database synced...');

        const adminEmail = 'admin@lifeflow.com';
        const adminPassword = 'admin123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        
        if (existingAdmin) {
            console.log('\n=== ADMIN ALREADY EXISTS ===');
            console.log('Email:', adminEmail);
            console.log('Password: admin123');
            console.log('Role:', existingAdmin.role);
            console.log('ID:', existingAdmin.id);
            console.log('============================\n');
            
            // Update role to ADMIN if it's not already
            if (existingAdmin.role !== 'ADMIN') {
                await existingAdmin.update({ role: 'ADMIN' });
                console.log('✅ Updated user role to ADMIN');
            }
            
            process.exit(0);
        }

        // Create new admin
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const admin = await User.create({
            name: 'LifeFlow Admin',
            email: adminEmail,
            password: hashedPassword,
            bloodGroup: 'O+',
            age: 30,
            role: 'ADMIN',
            points: 0,
            badge: 'Admin'
        });

        console.log('\n=== NEW ADMIN CREATED ===');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('Role:', admin.role);
        console.log('ID:', admin.id);
        console.log('=========================\n');
        
        // Verify admin was created
        const verifyAdmin = await User.findOne({ where: { email: adminEmail } });
        console.log('✅ Admin verification:', verifyAdmin ? 'SUCCESS' : 'FAILED');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create admin:', error);
        process.exit(1);
    }
};

createAdmin();