import bcrypt from 'bcryptjs';
import { sequelize, User, Donation } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedSurvivors() {
    try {
        console.log('🚀 Synchronizing Survivor Data with Database...');
        await sequelize.sync({ alter: true });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);

        const survivors = [
            {
                name: 'Aarav Sharma',
                email: 'aarav@lifeflow.com',
                password: passwordHash,
                role: 'DONOR',
                bloodGroup: 'O-',
                age: 24,
                city: 'New Delhi',
                state: 'Delhi',
                points: 300,
                badge: 'Guardian',
                avatar: '/assets/survivors/aarav.png',
                donationsCount: 3 // Impact
            },
            {
                name: 'Priya Patel',
                email: 'priya@lifeflow.com',
                password: passwordHash,
                role: 'DONOR',
                bloodGroup: 'A+',
                age: 28,
                city: 'Mumbai',
                state: 'Maharashtra',
                points: 500,
                badge: 'Life Saver',
                avatar: '/assets/survivors/priya.png',
                donationsCount: 5
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@lifeflow.com',
                password: passwordHash,
                role: 'DONOR',
                bloodGroup: 'B+',
                age: 36,
                city: 'Jaipur',
                state: 'Rajasthan',
                points: 500,
                badge: 'Hero',
                avatar: '/assets/survivors/vikram.png',
                donationsCount: 5
            },
            {
                name: 'Ananya Iyer',
                email: 'ananya@lifeflow.com',
                password: passwordHash,
                role: 'DONOR',
                bloodGroup: 'B-',
                age: 22,
                city: 'Bengaluru',
                state: 'Karnataka',
                points: 200,
                badge: 'Star',
                avatar: '/assets/survivors/ananya.png',
                donationsCount: 2
            }
        ];

        for (const data of survivors) {
            // 1. Create or Update User
            const [user, created] = await User.findOrCreate({
                where: { email: data.email },
                defaults: data
            });

            if (!created) {
                await user.update({
                    name: data.name,
                    bloodGroup: data.bloodGroup,
                    points: data.points,
                    badge: data.badge,
                    avatar: data.avatar,
                    city: data.city,
                    state: data.state
                });
            }

            // 2. Add COMPLETED donations to match homepage stats
            const existingDonations = await Donation.count({ where: { userId: user.id, status: 'COMPLETED' } });
            const needed = data.donationsCount - existingDonations;

            for (let i = 0; i < needed; i++) {
                await Donation.create({
                    userId: user.id,
                    bloodGroup: user.bloodGroup,
                    age: user.age,
                    status: 'COMPLETED',
                    appointmentDate: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] // Past dates
                });
            }

            console.log(`✅ Synced: ${user.name} | Donations: ${data.donationsCount} | Points: ${data.points}`);
        }

        console.log('\n✨ Database now reflects Cinematic Survivor Data.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error synchronizing survivors:', error);
        process.exit(1);
    }
}

seedSurvivors();
