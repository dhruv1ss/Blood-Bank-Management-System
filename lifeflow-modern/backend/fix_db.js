import { sequelize } from './config/db.js';

async function run() {
    try {
        const [indexes] = await sequelize.query(`SHOW INDEX FROM users`);
        
        let dropQueries = [];
        for (const idx of indexes) {
            const name = idx.Key_name;
            if (name !== 'PRIMARY' && name !== 'email' && name !== 'phone' && name !== 'users_email' && name !== 'users_phone') {
                dropQueries.push(`ALTER TABLE users DROP INDEX \`${name}\``);
            }
        }
        
        dropQueries = [...new Set(dropQueries)]; // unique queries
        
        let successCount = 0;
        for(let q of dropQueries) {
            try {
                await sequelize.query(q);
                successCount++;
            } catch(e) {}
        }
        console.log("Cleanup done. Dropped " + successCount + " duplicate indexes.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
run();
