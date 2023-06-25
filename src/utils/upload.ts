import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { AppError } from './app-error';

enum FILE_TYPE {
  image = 'image',
  audio = 'audio',
}

// TODO: Implement for process.env.NODE_ENV === 'production'
const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/audio/cards');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerFilter =
  (fileType: FILE_TYPE) =>
  (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith(fileType)) {
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

const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: multerFilter(FILE_TYPE.image),
});

const uploadAudio = multer({
  storage: diskStorage,
  fileFilter: multerFilter(FILE_TYPE.audio),
});

export { uploadImage, uploadAudio };
