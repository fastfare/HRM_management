const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leave');
const exportRoutes = require('./routes/export');

const app = express();
// change default port here:
const PORT = process.env.PORT || 4000; // <-- set to non-3000 port

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '..'))); // For root level files

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HR Attendance API v2.0 - Local JSON Database',
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 HR Attendance System - Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Local:   http://localhost:${PORT}`);
    console.log(`🌐 Network: http://192.168.x.x:${PORT}`);
    console.log('='.repeat(50));
    console.log('✅ API Endpoints:');
    console.log('   POST   /api/auth/login');
    console.log('   POST   /api/attendance/checkin');
    console.log('   POST   /api/attendance/checkout');
    console.log('   GET    /api/attendance/today/:id');
    console.log('   GET    /api/employees');
    console.log('   POST   /api/employees');
    console.log('   POST   /api/leave/request');
    console.log('='.repeat(50));
    console.log('📊 Database: JSON Files in /data folder');
    console.log('='.repeat(50));
});

module.exports = app;
