import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { storage as deckStorage } from '../storage/deckPhotoStorage';
import { storage as cardPhotoStorage } from '../storage/cardPhotoStorage';
import { storage as cardAudioStorage } from '../storage/cardAudioStorage';
import { AppError } from './appError';
import { withJsonParts } from './jsonParts';

enum FILE_TYPE {
  image = 'image',
  audio = 'audio',
}

// Object-valued card properties the OpenAPI client sends as JSON parts.
const CARD_JSON_PARTS = ['content', 'fields'];

const multerFilter =
  (fileType: FILE_TYPE, jsonParts: string[] = []) =>
  (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (
      jsonParts.includes(file.fieldname) ||
      file.mimetype.startsWith(fileType)
    ) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `Your file format is not supported! Please upload only ${fileType} files.`,
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
  storage: withJsonParts(cardAudioStorage, CARD_JSON_PARTS),
  fileFilter: multerFilter(FILE_TYPE.audio, CARD_JSON_PARTS),
});

export { uploadCardAudio, uploadDeckPhoto, uploadCardPhoto, CARD_JSON_PARTS };
