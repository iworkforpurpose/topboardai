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

// Routes
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api', employeeRoutes);


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
