import express from 'express';
import pkg from 'mongodb';
const { MongoClient } = pkg;
const URI ="mongodb://localhost:27017/";
export const client = new MongoClient(URI);

// Connection to MongoDB
const connectDB = async () => {
    try {
       client.connect();
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB