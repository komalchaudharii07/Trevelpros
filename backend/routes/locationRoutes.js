import express from 'express';
import { 
  seedLocations, 
  getLocations, 
  getLocationById, 
  createLocation 
} from '../controllers/locationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js'; // Import your multer upload middleware

const router = express.Router();

// Public routes
router.get('/', getLocations);

// STATIC routes like '/seed' MUST come BEFORE dynamic parameters like '/:id'
router.get('/seed', protect, adminOnly, seedLocations);

// Public route for specific location by ID
router.get('/:id', getLocationById);

// Protected & Admin-only route with Cloudinary image upload middleware
router.post('/', protect, adminOnly, upload.single('image'), createLocation);

export default router;