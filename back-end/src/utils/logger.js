import pino from 'pino';
import { config } from '../config.js';

const opts = {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
};
if (config.nodeEnv !== 'production') {
    opts.transport = {
        target: 'pino-pretty',
        options: { colorize: true },
    };
}

const logger = pino(opts);

export default logger;
