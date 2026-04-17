import { Donation, User } from './config/db.js';

async function checkVikram() {
    try {
        const user = await User.findOne({ where: { email: 'vikram@lifeflow.com' } });
        if (!user) {
            console.log('Vikram not found');
            return;
        }
        
        const counts = await Donation.count({
            where: { userId: user.id, status: ['APPROVED', 'COMPLETED'] }
        });
        
        console.log(`COUNT_APPROVED:${counts}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkVikram();
