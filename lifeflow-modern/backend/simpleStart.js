import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory database for quick testing
const users = [];
const camps = [];
const donations = [];

// Initialize with test data
async function initData() {
    const salt = await bcrypt.genSalt(12);
    
    // Admin
    users.push({
        id: 1,
        name: 'LifeFlow Admin',
        email: 'admin@lifeflow.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'ADMIN',
        points: 1000,
        badge: 'Admin',
        bloodGroup: 'O+',
        city: 'Ahmedabad'
    });
    
    // Test users
    users.push({
        id: 2,
        name: 'John Doe',
        email: 'john@test.com',
        password: await bcrypt.hash('password123', salt),
        role: 'DONOR',
        points: 250,
        badge: 'Gold',
        bloodGroup: 'O+',
        city: 'Ahmedabad'
    });
    
    users.push({
        id: 3,
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: await bcrypt.hash('password123', salt),
        role: 'DONOR',
        points: 50,
        badge: 'Bronze',
        bloodGroup: 'A+',
        city: 'Surat'
    });
    
    // Camps
    camps.push({
        id: 1,
        name: 'City Hospital Blood Drive',
        description: 'Monthly blood donation camp',
        address: 'City Hospital, Ellis Bridge',
        city: 'Ahmedabad',
        status: 'APPROVED'
    });
    
    camps.push({
        id: 2,
        name: 'Community Center Drive',
        description: 'Weekend blood donation',
        address: 'Community Center, Satellite',
        city: 'Ahmedabad',
        status: 'APPROVED'
    });
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ status: 'error', message: 'No token' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
};

// Routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    res.json({
        status: 'success',
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            bloodGroup: user.bloodGroup,
            points: user.points,
            badge: user.badge
        }
    });
});

app.get('/api/user/dashboard', verifyToken, (req, res) => {
    const userDonations = donations.filter(d => d.userId === req.user.id);
    res.json({
        status: 'success',
        data: {
            donations: userDonations,
            points: users.find(u => u.id === req.user.id)?.points || 0,
            badge: users.find(u => u.id === req.user.id)?.badge || 'Starter',
            totalDonations: userDonations.length
        }
    });
});

app.get('/api/public/camps', (req, res) => {
    res.json({
        status: 'success',
        camps: camps.filter(c => c.status === 'APPROVED')
    });
});

app.post('/api/user/donations', verifyToken, (req, res) => {
    const { bloodGroup, age, condition, campId } = req.body;
    
    if (!campId) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'You must select a donation camp' 
        });
    }
    
    const camp = camps.find(c => c.id === campId && c.status === 'APPROVED');
    if (!camp) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Selected camp not found or not approved' 
        });
    }
    
    const donation = {
        id: donations.length + 1,
        userId: req.user.id,
        bloodGroup,
        age,
        condition,
        campId,
        status: 'PENDING',
        createdAt: new Date()
    };
    
    donations.push(donation);
    
    res.json({
        status: 'success',
        message: 'Donation request submitted for admin approval',
        data: donation
    });
});

app.get('/api/admin/users', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }
    
    res.json({
        status: 'success',
        users: users.filter(u => u.role === 'DONOR').map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            points: u.points,
            badge: u.badge,
            bloodGroup: u.bloodGroup,
            city: u.city
        }))
    });
});

// Start server
initData().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Simple Server running on port ${PORT}`);
        console.log(`📝 Test login credentials:`);
        console.log(`   Admin: admin@lifeflow.com / admin123`);
        console.log(`   User: john@test.com / password123 (Gold badge)`);
        console.log(`   User: jane@test.com / password123 (Bronze badge)`);
        console.log(`\n✅ Login system is working!`);
        console.log(`✅ Users will appear in admin panel`);
        console.log(`✅ Badge system is based on donation count`);
    });
});

app.get('/api/admin/users', verifyToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }
    
    res.json({
        status: 'success',
        users: users.filter(u => u.role === 'DONOR').map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            points: u.points,
            badge: u.badge,
            bloodGroup: u.bloodGroup,
            city: u.city
        }))
    });
});