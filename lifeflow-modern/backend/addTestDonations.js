import { User, Donation, Camp } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function addTestDonations() {
    try {
        console.log('🚀 Adding test donations...\n');
        
        // Get all users
        const users = await User.findAll({ where: { role: 'DONOR' } });
        console.log(`Found ${users.length} donor users`);
        
        // Get a camp
        const camp = await Camp.findOne({ where: { status: 'APPROVED' } });
        if (!camp) {
            console.log('❌ No approved camps found');
            return;
        }
        
        console.log(`Using camp: ${camp.name}\n`);
        
        // Add donations for each user
        for (const user of users) {
            console.log(`Adding donations for ${user.name}...`);
            
            // Add 3 donations for first user, 2 for second, 1 for third
            const donationCount = users.indexOf(user) === 0 ? 3 : users.indexOf(user) === 1 ? 2 : 1;
            
            for (let i = 0; i < donationCount; i++) {
                await Donation.create({
                    userId: user.id,
                    bloodGroup: user.bloodGroup,
                    age: user.age,
                    condition: 'Good',
                    campId: camp.id,
                    status: 'APPROVED',
                    appointmentDate: new Date(),
                    appointmentTime: '10:00-10:30'
                });
                
                console.log(`  ✅ Donation ${i + 1} created`);
            }
            
            // Update user points and badge
            const points = donationCount * 50;
            let badge = 'Starter';
            if (donationCount >= 3) badge = 'Silver';
            else if (donationCount >= 1) badge = 'Bronze';
            
            await user.update({
                points,
                badge
            });
            
            console.log(`  📊 Updated: ${points} points, ${badge} badge\n`);
        }
        
        console.log('🎉 Test donations added successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addTestDonations();