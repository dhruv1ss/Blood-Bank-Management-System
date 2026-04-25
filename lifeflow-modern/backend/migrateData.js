import dotenv from 'dotenv';
dotenv.config();

const DB_URL = "postgresql://postgres.yyhnngrklclvxyobqvff:dhruv%40123sr2@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

// Set BEFORE any db imports
process.env.DATABASE_URL = DB_URL;

import { Sequelize } from 'sequelize';

async function migrate() {
    try {
        console.log("Connecting to databases...");
        
        // Dynamic import strictly AFTER assignment
        const dbModule = await import('./config/db.js');
        const db = dbModule.default || dbModule;

        const cloudSq = db.sequelize;

        const localSq = new Sequelize('lifeflow', 'root', '', {
            host: 'localhost', port: 3307, dialect: 'mysql', logging: false
        });

        await cloudSq.authenticate();
        console.log("✅ Connected to Cloud PostgreSQL!");

        await localSq.authenticate();
        console.log("✅ Connected to Local MySQL!");

        await cloudSq.sync({ force: true });
        console.log("✅ Cloud schema forcibly synchronized!");

        const tables = ['Users', 'Camps', 'Donations', 'Appointments', 'Notifications'];

        for (const tableName of tables) {
            console.log(`\n📦 Migrating ${tableName}...`);
            const Model = db[tableName.slice(0, -1)] || db[tableName]; 
            
            const [rows] = await localSq.query(`SELECT * FROM ${tableName}`);
            
            if (rows.length === 0) {
                console.log(`No records found in ${tableName}`);
                continue;
            }

            console.log(`Found ${rows.length} records. Inserting...`);
            await Model.bulkCreate(rows, { ignoreDuplicates: true });
            console.log(`✅ Success for ${tableName}!`);
        }

        console.log("\n🎉 ALL DATA MIGRATED SUCCESSFULLY TO SUPABASE!");
        process.exit(0);
    } catch (e) {
        console.error("Migration Error:", e);
        process.exit(1);
    }
}

migrate();
