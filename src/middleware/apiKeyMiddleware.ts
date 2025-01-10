import { Request, Response, NextFunction } from "express";

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const API_KEY = process.env.API_KEY || "";

    const apiKey = req.headers['authorization'];
    if (apiKey && apiKey === API_KEY) {
        next(); // API key is valid, proceed to the next middleware or route handler
    } else {
        res.status(401).send("Unauthorized: Invalid API Key");
    }
};
