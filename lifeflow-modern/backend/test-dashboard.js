import { User, sequelize } from './config/db.js';
import { generateToken } from './middleware/authMiddleware.js';

async function testDashboard() {
    try {
        await sequelize.authenticate();
        
        const dhruv = await User.findOne({ where: { name: 'Dhruv' } });
        if (!dhruv) {
            console.error('Dhruv not found in DB');
            return;
        }
        
        const token = generateToken(dhruv);
        
        const url = 'http://localhost:5000/api/user/dashboard';
        console.log(`Testing endpoint: ${url}`);
        
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));
        
        await sequelize.close();
    } catch (err) {
        console.error('Test Error:', err.message);
    }
}

testDashboard();
