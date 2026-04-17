import { sequelize } from './config/db.js';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');
        
        // Test if database exists
        const [results] = await sequelize.query("SHOW DATABASES LIKE 'lifeflow'");
        if (results.length === 0) {
            console.log('📝 Creating lifeflow database...');
            await sequelize.query("CREATE DATABASE IF NOT EXISTS lifeflow");
            console.log('✅ Database created successfully!');
        } else {
            console.log('✅ Database lifeflow already exists');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testConnection();