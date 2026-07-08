
// const jwt = require('jsonwebtoken');


// const authMiddleware = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader) {
//             return res.status(401).json({
//                 message: "No token provided"
//             });
//         }

//         const token = authHeader.split(" ")[1]; // Bearer TOKEN
//         const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';

//         const decoded = jwt.verify(token, jwtSecret);

//         req.user = decoded; // attach user info

//         next();

//     } catch (error) {
//         return res.status(401).json({
//             message: "Invalid or expired token"
//         });
//     }
// };

// module.exports = authMiddleware;


const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";

const JwtVerify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing", data: null, error: "Unauthorized", status: false });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing", data: null, error: "Unauthorized", status: false });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error("Token verification failed", err);
            return res.status(401).json({ message: "Invalid token", data: null, error: "Unauthorized", status: false });
        }
        req.user = decoded;
        next();
    });
};

module.exports = JwtVerify;

