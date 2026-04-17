import { sequelize, User, Camp } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedCamps() {
    try {
        await sequelize.sync({ alter: true });

        // Find or create organization user
        const [org] = await User.findOrCreate({
            where: { email: 'org@lifeflow.com' },
            defaults: {
                name: 'Demo Organization',
                email: 'org@lifeflow.com',
                password: '$2a$10$dummy.hash.for.testing',
                role: 'ORGANIZATION',
                orgName: 'Gujarat Red Cross Society',
                orgPhone: '+91 79 2630 0000',
                orgAddress: 'Red Cross Bhavan, Shahibaug, Ahmedabad',
            }
        });

        // Create sample approved camps
        const camps = [
            {
                name: 'Ahmedabad Civil Blood Drive',
                description: 'A large community blood drive at Civil Hospital Ahmedabad to replenish city blood banks before summer.',
                address: 'Asarwa, Civil Hospital Campus, Ahmedabad',
                city: 'Ahmedabad',
                state: 'Gujarat',
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                startTime: '09:00',
                endTime: '17:00',
                totalSlots: 150,
                bookedSlots: 0,
                bloodGroupsNeeded: 'A+,B+,O+,AB+',
                contactPhone: '+91 79 2268 1000',
                lat: 23.0558,
                lng: 72.6020,
                organizationId: org.id,
                status: 'APPROVED'
            },
            {
                name: 'Surat Diamond Bourse Camp',
                description: 'Corporate blood donation camp at the iconic Surat Diamond Bourse. Walk-ins warmly welcome.',
                address: 'Surat Diamond Bourse, Khajod, Surat',
                city: 'Surat',
                state: 'Gujarat',
                date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                startTime: '10:00',
                endTime: '16:00',
                totalSlots: 200,
                bookedSlots: 0,
                bloodGroupsNeeded: 'O-,B-,A-,O+',
                contactPhone: '+91 261 244 5555',
                lat: 21.1702,
                lng: 72.8311,
                organizationId: org.id,
                status: 'APPROVED'
            },
            {
                name: 'Patan Heritage Blood Drive',
                description: 'A historic blood donation camp near Rani Ki Vav in Patan. Save lives and celebrate heritage.',
                address: 'Near Rani Ki Vav, Patan',
                city: 'Patan',
                state: 'Gujarat',
                date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
                startTime: '08:00',
                endTime: '16:00',
                totalSlots: 100,
                bookedSlots: 0,
                bloodGroupsNeeded: 'O+,B+,A-',
                contactPhone: '+91 2766 230 000',
                lat: 23.8493,
                lng: 72.1158,
                organizationId: org.id,
                status: 'APPROVED'
            },
            {
                name: 'Vadodara University Drive',
                description: 'Annual university blood donation drive organized by MS University and SSG Hospital volunteers.',
                address: 'MS University, Fatehgunj, Vadodara',
                city: 'Vadodara',
                state: 'Gujarat',
                date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
                startTime: '08:00',
                endTime: '18:00',
                totalSlots: 180,
                bookedSlots: 0,
                bloodGroupsNeeded: 'A+,B+,O+,O-,AB-',
                contactPhone: '+91 265 279 0000',
                lat: 22.3119,
                lng: 73.1774,
                organizationId: org.id,
                status: 'APPROVED'
            }
        ];

        for (const campData of camps) {
            const [camp, created] = await Camp.findOrCreate({
                where: { 
                    name: campData.name,
                    organizationId: campData.organizationId 
                },
                defaults: campData
            });

            if (created) {
                console.log(`✅ Created camp: ${camp.name}`);
            } else {
                console.log(`ℹ️ Camp already exists: ${camp.name}`);
            }
        }

        console.log('\n=== SAMPLE APPROVED CAMPS CREATED ===');
        console.log('✅ 3 approved camps are now available for donation requests');
        console.log('✅ Users can now select camps in their donation forms');
        console.log('=====================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding camps:', error.message);
        process.exit(1);
    }
}

seedCamps();