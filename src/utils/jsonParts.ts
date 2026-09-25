import { Request } from 'express';
import multer from 'multer';
import { AppError } from './appError';

// The OpenAPI client sends object-valued multipart properties as
// application/json blobs. Browsers give such parts a filename ("blob"), so
// multer treats them as files and hands them to the storage engine. This
// wrapper parses the named parts into req.body and passes every other part
// on to the real storage.
const withJsonParts = (
  storage: multer.StorageEngine,
  jsonParts: string[]
): multer.StorageEngine => ({
  _handleFile(req: Request, file: Express.Multer.File, cb) {
    if (!jsonParts.includes(file.fieldname)) {
      return storage._handleFile(req, file, cb);
    }

    const chunks: Buffer[] = [];
    file.stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    file.stream.on('error', cb);
    file.stream.on('end', () => {
      try {
        req.body[file.fieldname] = JSON.parse(
          Buffer.concat(chunks).toString('utf8')
        );
        cb(null, {});
      } catch {
        cb(new AppError(`${file.fieldname} must be valid JSON.`, 400));
      }
    });
  },
  _removeFile(req: Request, file: Express.Multer.File, cb) {
    if (jsonParts.includes(file.fieldname)) return cb(null);
    storage._removeFile(req, file, cb);
  },
});

export { withJsonParts };
