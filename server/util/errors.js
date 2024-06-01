import createError from 'http-errors';

export const NotFoundError = (message) => createError(404, message);
export const BadRequestError = (message) => createError(400, message);
export const InternalServerError = (message) => createError(500, message);