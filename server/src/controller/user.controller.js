const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('../config/firebaseAdmin');

const signUserToken = (user) => jwt.sign(
    {
        id: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

const sanitizeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    address: user.address,
    contact: user.contact,
    age: user.age,
    gender: user.gender,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Current user loaded successfully",
            user: sanitizeUser(user)
        });
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCurrentUser = async (req, res) => {
    try {
        const allowedFields = ["name", "address", "contact", "age", "gender"];
        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.age !== undefined && updates.age !== "") {
            updates.age = Number(updates.age);
        }

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            returnDocument: "after",
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: sanitizeUser(user)
        });
    } catch (error) {
        console.error("Update current user error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// REGISTER
const registerUser = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            address,
            contact,
            age,
            gender
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            contact,
            age,
            gender,
            role: "user"
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// LOGIN
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = signUserToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: sanitizeUser(user)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const adminLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin account required"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = signUserToken(user);

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            user: sanitizeUser(user)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GOOGLE LOGIN
const googleLogin = async (req, res) => {
    try {

        const { firebaseToken } = req.body;

        if (!firebaseToken) {
            return res.status(400).json({
                success: false,
                message: "Firebase token is required"
            });
        }

        const decodedToken =
            await admin.auth().verifyIdToken(firebaseToken);

        const email = decodedToken.email;
        const name = decodedToken.name || "Google User";

        let user = await User.findOne({ email });

        if (!user) {

            const randomPassword = await bcrypt.hash(
                Math.random().toString(36),
                10
            );

            user = await User.create({
                name,
                email,
                password: randomPassword,
                role: "user"
            });
        }

        const token = signUserToken(user);

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: sanitizeUser(user)
        });

    } catch (error) {

        console.error("Google Login Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    adminLogin,
    googleLogin,
    getCurrentUser,
    updateCurrentUser
};
