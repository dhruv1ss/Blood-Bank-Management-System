import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
    console.log('🚀 Setting up LifeFlow Database...\n');
    
    // Try to find working MySQL credentials
    const credentials = [
        { user: 'root', password: '' },
        { user: 'root', password: 'root' },
        { user: 'root', password: 'mysql' },
        { user: 'root', password: 'admin' },
        { user: 'root', password: 'password' },
        { user: 'root', password: '123456' }
    ];
    
    let connection = null;
    let workingCreds = null;
    
    console.log('🔍 Finding MySQL credentials...');
    for (const cred of credentials) {
        try {
            connection = await mysql.createConnection({
                host: 'localhost',
                user: cred.user,
                password: cred.password
            });
            workingCreds = cred;
            console.log(`✅ Connected with user: ${cred.user}, password: "${cred.password}"`);
            break;
        } catch (error) {
            console.log(`❌ Failed with password "${cred.password}"`);
        }
    }
    
    if (!connection) {
        console.log('\n❌ Could not connect to MySQL with any common credentials.');
        console.log('📝 Please ensure MySQL is running and try one of these solutions:');
        console.log('   1. Reset MySQL root password through XAMPP Control Panel');
        console.log('   2. Use phpMyAdmin to create a new user');
        console.log('   3. Manually set DB_PASS in .env file');
        return false;
    }
    
    try {
        // Create database
        console.log('\n📊 Creating database...');
        await connection.execute('CREATE DATABASE IF NOT EXISTS lifeflow');
        console.log('✅ Database "lifeflow" created');
        
        // Switch to lifeflow database
        await connection.execute('USE lifeflow');
        
        // Create tables
        console.log('\n🏗️ Creating tables...');
        
        // Users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                bloodGroup VARCHAR(10),
                age INT,
                city VARCHAR(100),
                state VARCHAR(100),
                phone VARCHAR(20),
                role ENUM('ADMIN', 'DONOR', 'ORGANIZATION') DEFAULT 'DONOR',
                points INT DEFAULT 0,
                badge VARCHAR(50) DEFAULT 'Starter',
                orgName VARCHAR(255),
                orgPhone VARCHAR(20),
                orgAddress TEXT,
                lastDonationDate DATE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Camps table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Camps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                address VARCHAR(500) NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) DEFAULT 'Gujarat',
                date DATE NOT NULL,
                startTime VARCHAR(10) NOT NULL,
                endTime VARCHAR(10) NOT NULL,
                totalSlots INT DEFAULT 100,
                bookedSlots INT DEFAULT 0,
                organizationId INT,
                status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (organizationId) REFERENCES Users(id)
            )
        `);
        
        // Donations table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Donations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                bloodGroup VARCHAR(10) NOT NULL,
                age INT NOT NULL,
                condition VARCHAR(255),
                campId INT,
                appointmentDate DATE,
                appointmentTime VARCHAR(20),
                status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id),
                FOREIGN KEY (campId) REFERENCES Camps(id)
            )
        `);
        
        // Requests table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                patientName VARCHAR(255) NOT NULL,
                bloodGroup VARCHAR(10) NOT NULL,
                units INT NOT NULL,
                hospitalName VARCHAR(255) NOT NULL,
                city VARCHAR(100) NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED') DEFAULT 'PENDING',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id)
            )
        `);
        
        // Notifications table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                type ENUM('URGENT_REQUEST', 'CAMP_APPROVED', 'DONATION_APPROVED', 'GENERAL') DEFAULT 'GENERAL',
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                \`read\` BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id)
            )
        `);
        
        console.log('✅ All tables created successfully');
        
        // Create sample data
        console.log('\n👥 Creating sample users...');
        
        const salt = await bcrypt.genSalt(12);
        
        // Admin user
        const adminPassword = await bcrypt.hash('admin123', salt);
        await connection.execute(`
            INSERT IGNORE INTO Users (name, email, password, role, points, badge, city, state) 
            VALUES (?, ?, ?, 'ADMIN', 1000, 'Admin', 'Ahmedabad', 'Gujarat')
        `, ['LifeFlow Admin', 'admin@lifeflow.com', adminPassword]);
        
        // Test users
        const userPassword = await bcrypt.hash('password123', salt);
        await connection.execute(`
            INSERT IGNORE INTO Users (name, email, password, bloodGroup, age, city, state, role, points, badge) 
            VALUES (?, ?, ?, 'O+', 25, 'Ahmedabad', 'Gujarat', 'DONOR', 250, 'Gold')
        `, ['John Doe', 'john@test.com', userPassword]);
        
        await connection.execute(`
            INSERT IGNORE INTO Users (name, email, password, bloodGroup, age, city, state, role, points, badge) 
            VALUES (?, ?, ?, 'A+', 30, 'Surat', 'Gujarat', 'DONOR', 50, 'Bronze')
        `, ['Jane Smith', 'jane@test.com', userPassword]);
        
        // Organization
        const orgPassword = await bcrypt.hash('org123', salt);
        await connection.execute(`
            INSERT IGNORE INTO Users (name, email, password, role, orgName, orgPhone, orgAddress, city, state) 
            VALUES (?, ?, ?, 'ORGANIZATION', 'Red Cross Center', '+91 79 1234 5678', 'Test Address, Ahmedabad', 'Ahmedabad', 'Gujarat')
        `, ['Test Organization', 'org@test.com', orgPassword]);
        
        // Get organization ID for camps
        const [orgResult] = await connection.execute('SELECT id FROM Users WHERE email = ?', ['org@test.com']);
        const orgId = orgResult[0]?.id;
        
        if (orgId) {
            // Sample camps
            await connection.execute(`
                INSERT IGNORE INTO Camps (name, description, address, city, date, startTime, endTime, organizationId, status) 
                VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00', '17:00', ?, 'APPROVED')
            `, ['City Hospital Blood Drive', 'Monthly blood donation camp', 'City Hospital, Ellis Bridge', 'Ahmedabad', orgId]);
            
            await connection.execute(`
                INSERT IGNORE INTO Camps (name, description, address, city, date, startTime, endTime, organizationId, status) 
                VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), '10:00', '16:00', ?, 'APPROVED')
            `, ['Community Center Drive', 'Weekend blood donation', 'Community Center, Satellite', 'Ahmedabad', orgId]);
        }
        
        console.log('✅ Sample data created');
        
        // Update .env file
        console.log('\n📝 Updating .env file...');
        const fs = await import('fs');
        const envContent = `PORT=5000
JWT_SECRET=lifeflow_super_secret_jwt_key_2024_very_long_and_secure_key_for_production
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_USER=${workingCreds.user}
DB_PASS=${workingCreds.password}
DB_NAME=lifeflow
NODE_ENV=development
`;
        
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file updated');
        
        await connection.end();
        
        console.log('\n🎉 Database setup complete!');
        console.log('\n📋 Login Credentials:');
        console.log('   👨‍💼 Admin: admin@lifeflow.com / admin123');
        console.log('   👤 User: john@test.com / password123 (Gold badge, 5 donations)');
        console.log('   👤 User: jane@test.com / password123 (Bronze badge, 1 donation)');
        console.log('   🏢 Org: org@test.com / org123');
        console.log('\n✅ You can now start the server with: npm start');
        
        return true;
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        return false;
    }
}

setupDatabase();