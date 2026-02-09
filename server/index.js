const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Routes - Organized by feature
const hrRoutes = require('./routes/hrRoutes');
const authRoutes = require('./routes/authRoutes');
const managerRoutes = require('./routes/managerRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Mount routes with proper prefixes
app.use('/api/hr', hrRoutes);           // HR Admin endpoints
app.use('/api/auth', authRoutes);       // Authentication endpoints
app.use('/api/manager', managerRoutes); // Manager endpoints
app.use('/api/tasks', taskRoutes);      // Onboarding tasks

// Legacy route for backward compatibility (can be removed later)
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api', employeeRoutes);


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
