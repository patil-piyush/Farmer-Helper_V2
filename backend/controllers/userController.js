require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');



const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { fullname, email, password, location, farmsize } = req.body;

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (location) user.location = location;
        if (farmsize) user.farmsize = farmsize;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            location: updatedUser.location,
            farmsize: updatedUser.farmsize,
        },{ message: 'User profile updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
};