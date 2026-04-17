// Cache middleware for high traffic handling
// In production, use Redis. For development, use in-memory cache.

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const cacheMiddleware = (duration = CACHE_TTL) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `${req.originalUrl}_${JSON.stringify(req.query)}`;
        const cached = cache.get(key);

        if (cached && Date.now() - cached.timestamp < duration) {
            // Return cached response
            res.setHeader('X-Cache', 'HIT');
            return res.json(cached.data);
        }

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function(data) {
            // Cache successful responses (status 200-299)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, {
                    data,
                    timestamp: Date.now()
                });
            }
            originalJson.call(this, data);
        };

        res.setHeader('X-Cache', 'MISS');
        next();
    };
};

// Clear cache for specific routes
export const clearCache = (pattern) => {
    if (!pattern) {
        cache.clear();
        return;
    }

    for (const [key] of cache.entries()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

// Cache stats
export const getCacheStats = () => {
    return {
        size: cache.size,
        keys: Array.from(cache.keys()),
        hits: Array.from(cache.values()).filter(item => 
            Date.now() - item.timestamp < CACHE_TTL
        ).length
    };
};

// Rate limiting middleware
export const rateLimitMiddleware = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or initialize IP record
        let record = requests.get(ip);
        
        // Reset if window has passed
        if (record && record.timestamp < windowStart) {
            record = null;
        }

        if (!record) {
            record = { count: 0, timestamp: now };
            requests.set(ip, record);
        }

        if (record.count >= max) {
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests, please try again later.'
            });
        }

        // Increment count
        record.count++;

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - record.count);
        res.setHeader('X-RateLimit-Reset', new Date(record.timestamp + windowMs).toISOString());

        next();
    };
};