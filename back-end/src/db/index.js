import mongoose from 'mongoose';
import { config } from '../config.js';

const connectDB = async () => {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${config.dbName}`);
    console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;