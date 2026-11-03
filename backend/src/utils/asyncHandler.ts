import { Request, Response, NextFunction } from 'express';

export type AsyncRequestHandler = (
  req: Request | any,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Higher-order function that wraps async Express route handlers,
 * automatically catching unhandled promise rejections and passing them to next(error).
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
