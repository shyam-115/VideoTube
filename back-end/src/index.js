import { config, validateEnv } from './config.js';
import connectDB from './db/index.js';
import { DB_NAME } from './constants.js';
import app from './app.js';

validateEnv();

connectDB()
    .then(() => {
        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
        console.log(`Connected to MongoDB database: ${DB_NAME}`);
    })
    .catch((error) => {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    });
