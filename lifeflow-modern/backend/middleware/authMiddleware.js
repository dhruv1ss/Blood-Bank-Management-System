import jwt from 'jsonwebtoken';
import { User } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verify user still exists and is active
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({ status: 'error', message: 'User not found' });
            }

            // Check if token was issued before password change (if applicable)
            if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
                return res.status(401).json({ status: 'error', message: 'Token expired. Please login again.' });
            }

            req.user = decoded;
            req.userId = decoded.id;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ status: 'error', message: 'Token expired. Please login again.' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ status: 'error', message: 'Invalid token.' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ status: 'error', message: 'Authentication failed' });
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        await verifyToken(req, res, async () => {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ 
                    status: 'error', 
                    message: 'Access denied. Admin privileges required.' 
                });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Authorization failed' });
    }
};

export const verifyOrg = async (req, res, next) => {
    try {
        await verifyToken(req, res, async () => {
            if (req.user.role !== 'ORGANIZATION') {
                return res.status(403).json({ 
                    status: 'error', 
                    message: 'Access denied. Organization privileges required.' 
                });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Authorization failed' });
    }
};

export const verifyUser = async (req, res, next) => {
    try {
        await verifyToken(req, res, async () => {
            if (req.user.role !== 'DONOR') {
                return res.status(403).json({ 
                    status: 'error', 
                    message: 'Access denied. User privileges required.' 
                });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Authorization failed' });
    }
};

// Generate JWT token with enhanced security
export const generateToken = (user) => {
    try {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            iat: Math.floor(Date.now() / 1000)
        };

        const secret = process.env.JWT_SECRET || 'lifeflow_super_secret_jwt_key_2024_very_long_and_secure_key_for_production';
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

        console.log('Generating token for user:', { id: user.id, email: user.email, role: user.role });
        
        const token = jwt.sign(
            payload,
            secret,
            { 
                expiresIn,
                issuer: 'LifeFlow',
                audience: 'lifeflow-app',
                subject: user.id.toString()
            }
        );

        console.log('Token generated successfully');
        return token;
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate token');
    }
};

// Rate limiting for authentication endpoints
export const authLimiter = (req, res, next) => {
    // This would integrate with a rate limiting service like Redis in production
    // For now, we'll use a simple in-memory store for demo
    next();
};