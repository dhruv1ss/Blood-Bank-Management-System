import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test routes without database
app.get('/api/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Mock login endpoint for testing
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Mock credentials for testing
    const mockUsers = {
        'admin@lifeflow.com': { password: 'admin123', role: 'ADMIN', name: 'Admin User' },
        'john@test.com': { password: 'password123', role: 'DONOR', name: 'John Doe' },
        'jane@test.com': { password: 'password123', role: 'DONOR', name: 'Jane Smith' }
    };
    
    const user = mockUsers[email];
    if (user && user.password === password) {
        const token = 'mock-jwt-token-' + Date.now();
        res.json({
            status: 'success',
            message: 'Login successful',
            token,
            user: {
                id: 1,
                name: user.name,
                email,
                role: user.role,
                bloodGroup: 'O+',
                points: 150,
                badge: 'Bronze'
            }
        });
    } else {
        res.status(401).json({
            status: 'error',
            message: 'Invalid credentials'
        });
    }
});

// Mock dashboard endpoint
app.get('/api/user/dashboard', (req, res) => {
    res.json({
        status: 'success',
        data: {
            requests: [],
            donations: [],
            points: 150,
            badge: 'Bronze',
            totalDonations: 3,
            pendingRequests: 0
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Quick Start Server running on port ${PORT}`);
    console.log(`📝 Test login credentials:`);
    console.log(`   Admin: admin@lifeflow.com / admin123`);
    console.log(`   User: john@test.com / password123`);
    console.log(`   User: jane@test.com / password123`);
});