import fs from 'fs';
import multer from 'multer';

// Development storage under files/ (gitignored, served by express.static).
// multer does not create the destination, so without this a fresh clone's
// first upload fails with ENOENT.
const diskStorageIn = (dir: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

export { diskStorageIn };
