import { sequelize, User, Donation } from './config/db.js';
import { recalculateUserGamification } from './utils/gamification.js';
import bcrypt from 'bcryptjs';

async function perfectReset() {
    try {
        console.log('Synchronizing database (dropping all existing tables)...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
        console.log('Database synced. Now seeding pristine mathematical data.');

        // Admin
        await User.create({
            name: 'System Admin',
            email: 'admin@lifeflow.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN',
            bloodGroup: 'O+',
        });

        // Org
        const org = await User.create({
            name: 'City Hospital',
            email: 'org@test.com',
            password: await bcrypt.hash('password123', 10),
            role: 'ORGANIZATION',
            orgName: 'City Hospital Blood Center',
            orgAddress: '123 Medical Way'
        });

        // Pristine donors with perfectly aligned points!
        const usersToCreate = [
            { name: 'John Doe', email: 'john@test.com', password: await bcrypt.hash('password123', 10), role: 'DONOR', bloodGroup: 'O+' }, // We'll give John exactly 1 donation
            { name: 'Jane Smith', email: 'jane@test.com', password: await bcrypt.hash('password123', 10), role: 'DONOR', bloodGroup: 'A-' }, // Jane gets exactly 3 donations
            { name: 'Mike Johnson', email: 'mike@test.com', password: await bcrypt.hash('password123', 10), role: 'DONOR', bloodGroup: 'AB+' } // Mike 0 donations
        ];

        for (const u of usersToCreate) {
            const user = await User.create(u);
            
            if (user.name === 'John Doe') {
                await Donation.create({ userId: user.id, bloodGroup: user.bloodGroup, age: 30, condition: 'Healthy', status: 'COMPLETED' });
            } else if (user.name === 'Jane Smith') {
                for (let i = 0; i < 3; i++) {
                    await Donation.create({ userId: user.id, bloodGroup: user.bloodGroup, age: 28, condition: 'Healthy', status: 'COMPLETED' });
                }
            }

            // The absolute source of truth will recalculate!
            const result = await recalculateUserGamification(user.id);
            console.log(`Recalculated ${user.name}: Points=${result?.points}, Badge=${result?.badge}, TotalDonations=${result?.totalDonations}`);
        }

        console.log('✅ PERFECT MATHEMATICAL RESET COMPLETE ✅');
        process.exit(0);

    } catch (error) {
        console.error('Error in perfect reset:', error);
        process.exit(1);
    }
}

perfectReset();
