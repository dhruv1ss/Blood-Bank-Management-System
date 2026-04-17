import mysql from 'mysql2/promise';

async function resetMySQL() {
    try {
        console.log('🔧 Attempting to connect to MySQL...');
        
        // Try different connection methods
        const connectionConfigs = [
            { host: 'localhost', user: 'root', password: '' },
            { host: 'localhost', user: 'root', password: 'root' },
            { host: 'localhost', user: 'root', password: 'mysql' },
            { host: 'localhost', user: 'root', password: 'admin' }
        ];
        
        let connection = null;
        let workingConfig = null;
        
        for (const config of connectionConfigs) {
            try {
                console.log(`Trying connection with password: "${config.password}"`);
                connection = await mysql.createConnection(config);
                workingConfig = config;
                console.log('✅ Connection successful!');
                break;
            } catch (error) {
                console.log(`❌ Failed with password "${config.password}": ${error.message}`);
            }
        }
        
        if (!connection) {
            console.log('❌ Could not connect with any password. Please check XAMPP MySQL configuration.');
            return;
        }
        
        // Create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS lifeflow');
        console.log('✅ Database "lifeflow" created/verified');
        
        // Update .env file with working password
        const fs = await import('fs');
        const envContent = `PORT=5000
JWT_SECRET=lifeflow_super_secret_jwt_key_2024_very_long_and_secure_key_for_production
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_USER=root
DB_PASS=${workingConfig.password}
DB_NAME=lifeflow
NODE_ENV=development
`;
        
        fs.writeFileSync('.env', envContent);
        console.log(`✅ Updated .env file with working password: "${workingConfig.password}"`);
        
        await connection.end();
        console.log('🎉 MySQL setup complete! You can now run the application.');
        
    } catch (error) {
        console.error('❌ MySQL reset failed:', error.message);
    }
}

resetMySQL();