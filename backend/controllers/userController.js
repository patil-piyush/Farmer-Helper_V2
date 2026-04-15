require('dotenv').config();

const dynamoDB = require('../config/dynamodb');
const { GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require('bcryptjs');


// =======================
// ✅ GET USER PROFILE
// =======================
const getUserProfile = async (req, res) => {
    try {
        const result = await dynamoDB.send(new GetCommand({
            TableName: "UsersAuth",
            Key: { email: req.user.email }
        }));

        const user = result.Item;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        delete user.password; // remove password

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =======================
// ✅ UPDATE USER PROFILE
// =======================
const updateUserProfile = async (req, res) => {
    try {
        const { fullname, location, farmsize } = req.body;

        // Build dynamic update expression
        let updateExpression = "set ";
        let ExpressionAttributeValues = {};
        let updates = [];

        if (fullname) {
            updates.push("fullname = :f");
            ExpressionAttributeValues[":f"] = fullname;
        }

        if (location) {
            updates.push("location = :l");
            ExpressionAttributeValues[":l"] = location;
        }

        if (farmsize !== undefined) {
            updates.push("farmsize = :fs");
            ExpressionAttributeValues[":fs"] = farmsize;
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateExpression += updates.join(", ");

        await dynamoDB.send(new UpdateCommand({
            TableName: "UsersAuth",
            Key: { email: req.user.email },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }));

        res.status(200).json({
            message: 'User profile updated successfully'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =======================
// ✅ CHANGE PASSWORD
// =======================
const changeUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Both old and new passwords are required.'
            });
        }

        // 🔍 Get user
        const result = await dynamoDB.send(new GetCommand({
            TableName: "UsersAuth",
            Key: { email: req.user.email }
        }));

        const user = result.Item;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 🔐 Check old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Old password is incorrect.'
            });
        }

        // ❗ Prevent same password
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({
                message: 'New password must be different'
            });
        }

        // 🔐 Hash new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // 💾 Update password
        await dynamoDB.send(new UpdateCommand({
            TableName: "UsersAuth",
            Key: { email: req.user.email },
            UpdateExpression: "set password = :p",
            ExpressionAttributeValues: {
                ":p": newHashedPassword
            }
        }));

        res.status(200).json({
            message: 'Password changed successfully.'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// =======================
module.exports = {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
};