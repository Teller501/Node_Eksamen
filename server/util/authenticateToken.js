import jwt from "jsonwebtoken";

export default function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.status(401).send({ error: "Unauthorized" });

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).send({ error: "Invalid token" });
		req.user = user;
		next();
	});
}