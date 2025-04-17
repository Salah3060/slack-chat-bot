import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request & { rawBody?: string }, res: Response, next: NextFunction) {
    if (
      req.headers['content-type'] === 'application/json' ||
      req.headers['content-type'] === 'application/x-www-form-urlencoded'
    ) {
      let rawData = '';

      req.on('data', (chunk) => {
        rawData += chunk;
      });

      req.on('end', () => {
        req.rawBody = rawData;
        next(); // Call next() only after the entire body has been received
      });
    } else {
      // For other content types, just proceed without capturing raw body
      next();
    }
  }
}
