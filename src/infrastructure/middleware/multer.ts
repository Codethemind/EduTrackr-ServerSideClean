
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import config from '../../config';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'student_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }),
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const DEFAULT_PROFILE_IMAGE =
  'https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png';

export const ensureFullImageUrl = (imagePath?: string): string => {
  if (!imagePath || imagePath.trim() === '') return DEFAULT_PROFILE_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  return `${config.BASE_URL}/${imagePath.replace(/^\//, '')}`;
};



// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import cloudinary from '../services/cloudinary';
// import config from '../../config';

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'student_profiles',
//     allowed_formats: ['jpg', 'jpeg', 'png'],
//     transformation: [{ width: 500, height: 500, crop: 'limit' }],
//     // Ensure we get a secure HTTPS URL
//     secure: true,
//   },
// });

// export const upload = multer({ 
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// export const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";

// export const ensureFullImageUrl = (imagePath: string | undefined): string | undefined => {
//   if (!imagePath) return DEFAULT_PROFILE_IMAGE;
  
//   if (imagePath.trim() === '') return DEFAULT_PROFILE_IMAGE;
  
//   if (imagePath.startsWith('http')) return imagePath;
  
//   return `${config.BASE_URL}/${imagePath.replace(/^\//, '')}`;
// };
