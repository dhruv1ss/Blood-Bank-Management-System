import { sequelize, User } from './config/db.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database connected & synced (force)...');

        const existingAdmin = await User.findOne({ where: { email: 'admin@lifeflow.com' } });
        
        if (existingAdmin) {
             console.log('--- ADMIN ALREADY EXISTS ---');
             console.log('Email: admin@lifeflow.com');
             console.log('Password: (Password is hashed, but it was set to admin123 initially)');
             process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'LifeFlow Admin',
            email: 'admin@lifeflow.com',
            password: hashedPassword,
            bloodGroup: 'O+',
            age: 30,
            role: 'ADMIN'
        });

        console.log('--- NEW ADMIN CREATED ---');
        console.log('Email: admin@lifeflow.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed admin:', error);
        process.exit(1);
    }
};

seedAdmin();
