import fs from 'fs';
import { sequelize } from './config/db.js';
async function run() {
    try {
        const [results] = await sequelize.query(`
            SELECT TABLE_NAME, COUNT(1) AS index_count 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'lifeflow' 
            GROUP BY TABLE_NAME 
            ORDER BY index_count DESC;
        `);
        fs.writeFileSync('keys_out.json', JSON.stringify(results, null, 2));
    } catch(e) {
        fs.writeFileSync('keys_out.json', JSON.stringify({error: e.message}));
    }
    process.exit(0);
}
run();
