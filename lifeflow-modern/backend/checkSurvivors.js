import { User, Donation } from './config/db.js';

async function checkSurvivors() {
    try {
        const survivorEmails = ['aarav@lifeflow.com', 'priya@lifeflow.com', 'vikram@lifeflow.com', 'ananya@lifeflow.com'];
        
        console.log('--- SURVIVOR DATA AUDIT ---');
        for (const email of survivorEmails) {
            const user = await User.findOne({ where: { email } });
            if (user) {
                const donationCount = await Donation.count({ where: { userId: user.id, status: 'COMPLETED' } });
                console.log(`👤 ${user.name} (${user.bloodGroup})`);
                console.log(`   - Points: ${user.points} | Badge: ${user.badge}`);
                console.log(`   - Completed Donations: ${donationCount}`);
            } else {
                console.log(`❌ User not found: ${email}`);
            }
        }
        console.log('---------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error checking survivors:', error);
        process.exit(1);
    }
}

checkSurvivors();
