const express = require('express');


const { getUserProfile, updateUserProfile, changeUserPassword } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changeUserPassword);

module.exports = router;