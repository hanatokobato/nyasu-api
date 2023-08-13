import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { storage as deckStorage } from '../storage/deckPhotoStorage';
import { storage as cardPhotoStorage } from '../storage/cardPhotoStorage';
import { storage as cardAudioStorage } from '../storage/cardAudioStorage';
import { AppError } from './appError';

enum FILE_TYPE {
  image = 'image',
  audio = 'audio',
}

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

const uploadDeckPhoto = multer({
  storage: deckStorage,
  fileFilter: multerFilter(FILE_TYPE.image),
});

const uploadCardPhoto = multer({
  storage: cardPhotoStorage,
  fileFilter: multerFilter(FILE_TYPE.image),
});

const uploadCardAudio = multer({
  storage: cardAudioStorage,
  fileFilter: multerFilter(FILE_TYPE.audio),
});

export { uploadCardAudio, uploadDeckPhoto, uploadCardPhoto };
