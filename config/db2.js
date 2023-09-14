import express from 'express';
import pkg from 'mongodb';
const { MongoClient } = pkg;
// const URI = process.env.MONGO_URI;
const URI = "mongodb+srv://amrnet:yNFTMCqUw3iuCbKk@clusteramr.vmqh0b2.mongodb.net/amrnet_proto?retryWrites=true&w=majority";
export const client = new MongoClient(URI)

// Connection to MongoDB
const connectDB = async () => {
    try {
       await client.connect();
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB