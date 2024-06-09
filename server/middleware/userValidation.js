import { BadRequestError } from "../util/errors.js";

export function validateUserSignup(req, res, next) {
    const { username, email, password } = req.body;

    if (!username) {
        return next(BadRequestError("Missing key in body: username"));
    }
    if (!email) {
        return next(BadRequestError("Missing key in body: email"));
    }
    if (!password) {
        return next(BadRequestError("Missing key in body: password"));
    }

    next();
}

export function validateUserLogin(req, res, next) {
    const { username, password } = req.body;

    if (!username) {
        return next(BadRequestError("Missing key in body: username"));
    }
    if (!password) {
        return next(BadRequestError("Missing key in body: password"));
    }

    next();
}

export function validateToken(req, res, next) {
    const token = req.body.token || req.params.token;

    if (!token) {
        return next(BadRequestError("Missing key in body: token"));
    }

    next();
}

export function validateForgotPassword(req, res, next) {
    const { email } = req.body;

    if (!email) {
        return next(BadRequestError("Missing key in body: email"));
    }

    next();
}

export function validateResetPassword(req, res, next) {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!newPassword) {
        return next(BadRequestError("Missing key in body: newPassword"));
    }
    if (!token) {
        return next(BadRequestError("Missing key in params: token"));
    }

    next();
}
