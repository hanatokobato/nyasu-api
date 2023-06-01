import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from './app-error';

// TODO: Implement for process.env.NODE_ENV === 'production'
const multerStorage = multer.memoryStorage();
const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Your file format is not supported! Please upload only images.',
        400
      )
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export { upload };
