import { Request } from 'express';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { diskStorageIn } from './diskStorage';

let storage: multer.StorageEngine | CloudinaryStorage;

if (process.env.NODE_ENV === 'production') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: (req: Request, file: Express.Multer.File) => {
      return {
        folder: 'audio/cards',
        allowed_formats: ['mp3'],
        public_id: `${Date.now()}-${file.originalname}`,
        resource_type: 'video',
      };
    },
  });
} else {
  storage = diskStorageIn('files/audio/cards');
}

export { storage };
