// Database connection pooling configuration
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool for high traffic
const sequelize = new Sequelize(
    process.env.DB_NAME || 'lifeflow',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        
        // Connection pool settings for high traffic
        pool: {
            max: 20,           // Maximum number of connections in pool
            min: 5,            // Minimum number of connections in pool
            acquire: 30000,    // Maximum time (ms) to acquire connection
            idle: 10000,       // Maximum time (ms) a connection can be idle
            evict: 1000,       // Interval (ms) to check for idle connections
        },
        
        // Performance optimizations
        benchmark: process.env.NODE_ENV === 'development',
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        },
        
        // Retry configuration
        retry: {
            max: 3,            // Maximum retry attempts
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /ETIMEDOUT/,
                /ECONNREFUSED/,
                /ECONNRESET/,
                /EPIPE/,
                /EHOSTUNREACH/,
                /ENETUNREACH/,
                /EAI_AGAIN/,
            ],
        },
    }
);

// Test connection
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        
        // Log pool stats
        const pool = sequelize.connectionManager.pool;
        console.log(`📊 Connection Pool Stats:`);
        console.log(`   - Available: ${pool.available}`);
        console.log(`   - Borrowed: ${pool.borrowed}`);
        console.log(`   - Pending: ${pool.pending}`);
        console.log(`   - Size: ${pool.size}`);
        
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        return false;
    }
};

// Graceful shutdown
export const gracefulShutdown = async () => {
    console.log('🔄 Closing database connections...');
    try {
        await sequelize.close();
        console.log('✅ Database connections closed.');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
};

// Health check
export const healthCheck = async () => {
    try {
        await sequelize.authenticate();
        const [result] = await sequelize.query('SELECT 1 as health');
        return {
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            pool: {
                available: sequelize.connectionManager.pool.available,
                borrowed: sequelize.connectionManager.pool.borrowed,
                pending: sequelize.connectionManager.pool.pending,
                size: sequelize.connectionManager.pool.size,
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Query monitoring
export const monitorQueries = () => {
    if (process.env.NODE_ENV === 'development') {
        sequelize.addHook('beforeQuery', (options) => {
            options.startTime = Date.now();
        });

        sequelize.addHook('afterQuery', (options) => {
            const duration = Date.now() - options.startTime;
            if (duration > 100) { // Log slow queries (>100ms)
                console.warn(`⚠️ Slow query detected: ${duration}ms`, options);
            }
        });
    }
};

export default sequelize;