import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'junta/images',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
    };
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'junta/documents',
      resource_type: 'raw',
      public_id: `${Date.now()}-${file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}.${file.originalname.split('.').pop()}`,
    };
  },
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadDocument = multer({ storage: documentStorage });
export { cloudinary };
