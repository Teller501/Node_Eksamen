export function validateUserSignup(req, res, next) {
    const { username, email, password } = req.body;

    if (!username) {
        return res.status(400).send({ error: "Missing key in body: username" });
    }
    if (!email) {
        return res.status(400).send({ error: "Missing key in body: email" });
    }
    if (!password) {
        return res.status(400).send({ error: "Missing key in body: password" });
    }

    next();
}

export function validateUserLogin(req, res, next) {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).send({ error: "Missing key in body: username" });
    }
    if (!password) {
        return res.status(400).send({ error: "Missing key in body: password" });
    }

    next();
}

export function validateToken(req, res, next) {
    const token = req.body.token || req.params.token;

    if (!token) {
        return res.status(401).send({ error: "Missing token" });
    }

    next();
}

export function validateForgotPassword(req, res, next) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send({ error: "Missing key in body: email" });
    }

    next();
}

export function validateResetPassword(req, res, next) {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!newPassword) {
        return res.status(400).send({ error: "Missing key in body: password" });
    }
    if (!token) {
        return res.status(400).send({ error: "Missing key in body: token" });
    }

    next();
}