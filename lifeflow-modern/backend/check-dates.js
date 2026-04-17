import { User, Request, Donation, Camp, Appointment, Notification, sequelize } from './config/db.js';

async function checkDates() {
    try {
        console.log('--- Checking for invalid dates in database ---');
        
        const models = [
            { name: 'User', model: User },
            { name: 'Request', model: Request },
            { name: 'Donation', model: Donation },
            { name: 'Camp', model: Camp },
            { name: 'Appointment', model: Appointment },
            { name: 'Notification', model: Notification }
        ];

        for (const { name, model } of models) {
            const records = await model.findAll();
            console.log(`Checking ${name}: ${records.length} records`);
            
            records.forEach(record => {
                try {
                    // This is what Express does: it calls JSON.stringify which calls toJSON/toISOString
                    const json = JSON.stringify(record);
                } catch (err) {
                    console.error(`!!! JSON STRINGIFY FAILED for ${name} (ID: ${record.id}): ${err.message}`);
                    console.log('Record data:', record.toJSON());
                }
            });
        }

        console.log('--- Check complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
}

checkDates();
