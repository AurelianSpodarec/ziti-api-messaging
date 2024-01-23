// server/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError } from 'sequelize';
import { Error as MongooseError } from 'mongoose';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    return next(err);
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
    console.error('Error Stack:', err.stack);
  } else {
    console.error('Error:', err.message);
  }

  let statusCode = err.statusCode || 500;
  let message = 'An error occurred';

  // Handle Sequelize validation errors
  if (err instanceof SequelizeValidationError) {
    statusCode = 400;
    message = 'Validation error: ' + err.errors.map((e: any) => e.message).join('; ');
  }

  // Handle Mongoose validation and other errors
  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Validation error: ' + Object.values(err.errors).map((e: any) => e.message).join('; ');
  } else if (err instanceof MongooseError) {
    statusCode = 400; // You can adjust the status code based on specific Mongoose errors if needed
    message = 'Mongoose error: ' + err.message;
  }

  res.status(statusCode).json({ error: message });
}
