require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const {protect} = require('./middlewares/authMiddleware');
const cors = require('cors');
// import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cropRoutes = require('./routes/cropRoutes');
// const diseaseRoutes = require('./routes/diseaseRoutes');
const marketRoutes = require('./routes/marketRoutes');
const weatherRoutes = require('./routes/weatherRoutes');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173', // your Vite dev server
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/weather', protect, weatherRoutes);
app.use('/api/crop', protect, cropRoutes);
// app.use('/api/disease', auth, diseaseRoutes);
app.use('/api/market', protect, marketRoutes);

// Connect to MongoDB
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
