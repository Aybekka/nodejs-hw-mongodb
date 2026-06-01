import mongoose from 'mongoose';

export const initMongoConnection = async () => {
    const user = process.env.MONGODB_USER;
    const pwd = process.env.MONGODB_PASSWORD;
    const url = process.env.MONGODB_URL;
    const db = process.env.MONGODB_DB;

    const link = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`;
    
    await mongoose.connect(link);
    console.log('Mongo connection successfully extablished!');
    
};