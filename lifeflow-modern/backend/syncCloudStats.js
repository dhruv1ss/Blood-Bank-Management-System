import dotenv from 'dotenv';
dotenv.config();

if (!process.env.CLOUD_DATABASE_URL) {
    console.error("Please provide CLOUD_DATABASE_URL");
    process.exit(1);
}

process.env.DATABASE_URL = process.env.CLOUD_DATABASE_URL;

async function syncCloudStats() {
    try {
        const db = await import('./config/db.js');
        const gamification = await import('./utils/gamification.js');
        const sequelize = db.sequelize;
        const User = db.User;
        const recalculateUserGamification = gamification.recalculateUserGamification;

        await sequelize.authenticate();
        console.log("Connected to Cloud Database for sync...");
        
        console.log("Starting full gamification recalculation...");
        const users = await User.findAll({ attributes: ['id'] });
        for(const u of users) {
           await recalculateUserGamification(u.id);
        }
        
        console.log(`✅ All ${users.length} user points and badges recalculated successfully on the cloud!`);
        process.exit(0);
    } catch (err) {
        console.error("Sync failed:", err);
        process.exit(1);
    }
}

syncCloudStats();
