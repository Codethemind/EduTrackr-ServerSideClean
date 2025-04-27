// src/config/index.ts

// Load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not found, skipping .env file loading');
}

export const config = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  
  // MongoDB connection string
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrackr',
  
  // JWT secrets
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  
  // Cloudinary configuration
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  
  // Base URL for your API - used for constructing full URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
};

export default config; 