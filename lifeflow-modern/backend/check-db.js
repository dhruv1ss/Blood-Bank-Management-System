import { User, Request, Donation, sequelize } from './config/db.js';

async function checkDB() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const users = await User.findAll();
        console.log('Total Users:', users.length);
        users.forEach(u => {
            console.log(`User ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Points: ${u.points}`);
        });

        const dhruv = users.find(u => u.name.includes('Dhruv'));
        if (dhruv) {
            console.log('\n--- Checking data for Dhruv ---');
            const requests = await Request.findAll({ where: { userId: dhruv.id } });
            console.log('Requests:', requests.length);
            
            const donations = await Donation.findAll({ where: { userId: dhruv.id } });
            console.log('Donations:', donations.length);
        } else {
            console.log('\nUser "Dhruv" not found in database.');
        }

        await sequelize.close();
    } catch (err) {
        console.error('DB Check Error:', err);
    }
}

checkDB();
