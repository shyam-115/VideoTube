import { config, validateEnv } from './config.js';
import connectDB from './db/index.js';
import app from './app.js';

validateEnv();

connectDB()
    .then(() => {
        app.listen(config.port, () =>
            console.log(`Server running on port ${config.port} [${config.nodeEnv}]`)
        );
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
