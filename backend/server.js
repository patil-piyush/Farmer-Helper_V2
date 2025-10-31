require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/crop', auth, require('./routes/cropRoutes'));
app.use('/api/disease', auth, require('./routes/diseaseRoutes'));
app.use('/api/weather', auth, require('./routes/weatherRoutes'));
app.use('/api/market', auth, require('./routes/marketRoutes'));

// Connect to MongoDB
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
