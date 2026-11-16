import Location from '../models/Location.js';
import { initialLocations } from '../data/seedData.js';
import { uploadToCloudinary } from '../middleware/upload.js'; // Make sure this path points to your upload helper

export const seedLocations = async (req, res) => {
  try {
    await Location.deleteMany({});
    const insertedLocations = await Location.insertMany(initialLocations);
    res.json({ message: "Hierarchical database seeded successfully", insertedLocations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { title, mainDescription, mapCoordinates, views } = req.body;

    let imageUrl = "";

    // If a file was uploaded with the request, send it to Cloudinary
    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = cloudinaryResult.secure_url;
    }

    const newLocation = new Location({ 
      title, 
      mainDescription, 
      mapCoordinates, 
      views,
      image: imageUrl // Assigns the Cloudinary secure URL if uploaded
    });

    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (err) {
    console.error("Create location error:", err);
    res.status(400).json({ error: err.message });
  }
};