import createError from "http-errors";

export const BadRequestError = (message) => createError(400, message);
export const UnauthorizedError = (message) => createError(401, message);
export const ForbiddenError = (message) => createError(403, message);
export const NotFoundError = (message) => createError(404, message);
export const InternalServerError = (message) => createError(500, message);