import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Path to your frontend or local images folder
const localImagesDir = path.join('../frontend/public/images'); // Adjust path if needed

const uploadAllImages = async () => {
  try {
    if (!fs.existsSync(localImagesDir)) {
      console.error("Local images directory not found:", localImagesDir);
      return;
    }

    const files = fs.readdirSync(localImagesDir);

    for (const file of files) {
      if (file.endsWith('.webp')) {
        const filePath = path.join(localImagesDir, file);
        console.log(`Uploading ${file} to Cloudinary...`);

        const result = await cloudinary.v2.uploader.upload(filePath, {
          folder: 'meghalaya-tourism',
        });

        console.log(`Uploaded successfully! URL: ${result.secure_url}`);
      }
    }
  } catch (err) {
    console.error("Error uploading images:", err);
  }
};

uploadAllImages();