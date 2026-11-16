import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from './models/Location.js'; 
import { seedLocations } from './data/seedData.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    await Location.deleteMany({});
    console.log('Cleared old locations.');

    await Location.insertMany(seedLocations);
    console.log('Successfully seeded all locations into MongoDB!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();