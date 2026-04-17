import bcrypt from 'bcryptjs';
import { sequelize, User } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedOrg() {
    try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ alter: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('org123', salt);

        const [org, created] = await User.findOrCreate({
            where: { email: 'org@lifeflow.com' },
            defaults: {
                name: 'Demo Organization',
                email: 'org@lifeflow.com',
                password: hashedPassword,
                role: 'ORGANIZATION',
                orgName: 'Gujarat Red Cross Society',
                orgPhone: '+91 79 2630 0000',
                orgAddress: 'Red Cross Bhavan, Shahibaug, Ahmedabad',
            }
        });

        if (!created) {
            // Update existing to ORGANIZATION role
            await org.update({
                role: 'ORGANIZATION',
                orgName: 'Gujarat Red Cross Society',
                orgPhone: '+91 79 2630 0000',
                orgAddress: 'Red Cross Bhavan, Shahibaug, Ahmedabad',
            });
            console.log('✅ Organization account updated.');
        } else {
            console.log('✅ Organization account created.');
        }

        console.log('\n=== ORGANIZATION LOGIN CREDENTIALS ===');
        console.log('Email:    org@lifeflow.com');
        console.log('Password: org123');
        console.log('Role:     ORGANIZATION');
        console.log('======================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedOrg();
