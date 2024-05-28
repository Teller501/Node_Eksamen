import { Router } from "express";
const router = Router();

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

import authenticateToken from "../util/authenticateToken.js";

router.post("/api/contact", authenticateToken, async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send("Missing required fields");
    }

    const emailMessage = {
        from: `Admin <noreply@${process.env.MAIL_DOMAIN}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New message from contact form`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        reply_to: email,
    };

    try {
        const { error } = await resend.emails.send(emailMessage);

        if (error) {
            console.error(error);
            return res.status(500).send("Failed to send message");
        }

        res.send({ data: "Message sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to send message");
    }
});

export default router;