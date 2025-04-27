import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../services/cloudinary';
import config from '../../config';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'student_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    // Ensure we get a secure HTTPS URL
    secure: true,
  },
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to ensure profile image URLs are consistent
export const ensureFullImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Otherwise, construct a full URL
  return `${config.BASE_URL}/${imagePath.replace(/^\//, '')}`;
};
