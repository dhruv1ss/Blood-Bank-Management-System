import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

const DB_URL = "postgresql://postgres.yyhnngrklclvxyobqvff:dhruv%40123sr2@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function fixSequences() {
    try {
        console.log("Connecting to Cloud PostgreSQL...");
        
        const sequelize = new Sequelize(DB_URL, {
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            }
        });

        await sequelize.authenticate();
        console.log("✅ Connected to Cloud PostgreSQL!");

        const tables = [
            'Users', 'Requests', 'Donations', 'Camps', 'Appointments', 
            'Notifications', 'ProfileEditRequests', 'Posts', 'Comments', 
            'Likes', 'SupportMessages'
        ];

        for (const tableName of tables) {
            try {
                // Find max ID
                const [maxResult] = await sequelize.query(`SELECT MAX(id) as max_id FROM "${tableName}";`);
                let maxId = maxResult[0].max_id;
                
                if (maxId === null || maxId === undefined) {
                    console.log(`Table ${tableName} is empty, setting sequence to 1`);
                    maxId = 0;
                } else {
                    console.log(`Table ${tableName} max ID is ${maxId}`);
                }

                // Set sequence to maxId (next insert will be maxId + 1)
                const query = `
                    SELECT setval(
                        '"${tableName}_id_seq"',
                        COALESCE((SELECT MAX(id) FROM "${tableName}"), 1),
                        (SELECT MAX(id) IS NOT NULL FROM "${tableName}")
                    );
                `;
                await sequelize.query(query);
                
                console.log(`✅ Fixed sequence for ${tableName}!`);
            } catch (err) {
                console.error(`⚠️ Error fixing ${tableName}:`, err.message);
            }
        }

        console.log("\n🎉 ALL SEQUENCES FIXED SUCCESSFULLY!");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

fixSequences();
