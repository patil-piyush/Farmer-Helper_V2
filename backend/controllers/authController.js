require('dotenv').config();

const dynamoDB = require('../config/dynamodb');
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// =======================
// 🔐 GENERATE TOKEN
// =======================
const generateToken = (email) => {
    return jwt.sign({ id: email }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};


// =======================
// 📝 REGISTER USER
// =======================
const registerUser = async (req, res) => {
    try {
        const { fullname, email, password, location, farmsize } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: 'Required fields missing'
            });
        }

        // 🔍 Check if user exists
        const existingUser = await dynamoDB.send(new GetCommand({
            TableName: "UsersAuth",
            Key: { email }
        }));

        if (existingUser.Item) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // 🔐 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 💾 Save user
        await dynamoDB.send(new PutCommand({
            TableName: "UsersAuth",
            Item: {
                email,
                fullname,
                password: hashedPassword,
                location: location || "",
                farmsize: farmsize || 0,
                createdAt: new Date().toISOString()
            }
        }));

        const token = generateToken(email);

        res.status(201).json({
            message: "User registered successfully",
            email,
            fullname,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// =======================
// 🔑 LOGIN USER
// =======================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        // 🔍 Get user
        const result = await dynamoDB.send(new GetCommand({
            TableName: "UsersAuth",
            Key: { email }
        }));

        const user = result.Item;

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // 🔐 Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = generateToken(email);

        res.status(200).json({
            message: "Login successful",
            email: user.email,
            fullname: user.fullname,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// =======================
module.exports = {
    registerUser,
    loginUser,
};