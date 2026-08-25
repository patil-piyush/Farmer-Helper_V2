require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { protect } = require('./middlewares/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cropRoutes = require('./routes/cropRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const marketRoutes = require('./routes/marketRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: [
        'http://16.192.130.100:5173',
        'http://localhost:5173'
    ],
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', protect, weatherRoutes);
app.use('/api/crop', protect, cropRoutes);
app.use('/api/disease', protect, diseaseRoutes);
app.use('/api/market', protect, marketRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});