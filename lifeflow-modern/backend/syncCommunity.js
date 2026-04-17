import { sequelize } from './config/db.js';

async function sync() {
    try {
        console.log("Synchronizing MySQL explicitly for the new Community tables (Posts, Likes, Comments)...");
        // Using alter true to strictly create missing tables or update alters WITHOUT touching existing rows
        await sequelize.sync({ alter: true });
        console.log("Database synchronized safely!");
        process.exit(0);
    } catch (error) {
        console.error("Sync failed:", error);
        process.exit(1);
    }
}

sync();
