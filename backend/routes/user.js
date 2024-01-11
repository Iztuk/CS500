import express from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/user.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        // Initializes variables from the request body.
        const {
            userId,
            userEmail,
            userName,
            userPassword
        } = req.body;

        const existingEmail = await UserModel.findOne({ userEmail });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingUserId = await UserModel.findOne({ userId });
        if (existingUserId) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(userPassword, 10) // 10 is the salt rounds.

        // This creates a newUser instance with the hashed password.
        const newUser = UserModel({
            userId,
            userEmail,
            userName,
            userPassword: hashedPassword
        });

        // Save the user to the database.
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        // Initializes user credentials from the request body.
        const {
            userEmail,
            userPassword
        } = req.body;

        // Find the user by email.
        const user = await UserModel.findOne({ userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored password.
        const passwordMatch = await bcrypt.compare(userPassword, user.userPassword);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Login is successful.
        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;