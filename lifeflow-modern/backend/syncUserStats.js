import { sequelize, User, Donation } from './config/db.js';
import { Op } from 'sequelize';

async function syncUserStats() {
    try {
        console.log('🚀 Starting User Points & Badge Synchronization...\n');
        
        const users = await User.findAll({ where: { role: 'DONOR' } });
        console.log(`Found ${users.length} donors to process.\n`);

        const BADGE_THRESHOLDS = [
            { threshold: 50, badge: 'Legend', donations: 50 },
            { threshold: 20, badge: 'Diamond', donations: 20 },
            { threshold: 10, badge: 'Platinum', donations: 10 },
            { threshold: 5, badge: 'Gold', donations: 5 },
            { threshold: 3, badge: 'Silver', donations: 3 },
            { threshold: 1, badge: 'Bronze', donations: 1 },
            { threshold: 0, badge: 'Starter', donations: 0 }
        ];

        for (const user of users) {
            const donationCount = await Donation.count({
                where: {
                    userId: user.id,
                    status: { [Op.in]: ['COMPLETED', 'APPROVED'] }
                }
            });

            const points = donationCount * 50;
            let badge = 'Starter';

            for (const { threshold, badge: b } of BADGE_THRESHOLDS) {
                if (donationCount >= threshold) {
                    badge = b;
                    break;
                }
            }

            await user.update({ points, badge });
            console.log(`✅ Updated ${user.name}: ${donationCount} donations -> ${points} points, Badge: ${badge}`);
        }

        console.log('\n✨ Synchronization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncUserStats();
