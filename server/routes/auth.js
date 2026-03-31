const express = require('express');
const router = express.Router();
const { readJSON, findById, addItem, updateItem } = require('../fileHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/login
 * Authenticate user with employee code and PIN
 */
router.post('/login', (req, res) => {
    try {
        const { empId, pin } = req.body;

        if (!empId || !pin) {
            return res.json({
                success: false,
                error: 'ກະລຸນາໃສ່ລະຫັດພະນັກງານແລະ PIN'
            });
        }

        // Read employees
        const employees = readJSON('employees.json');

        // Find matching employee
        const user = employees.find(emp =>
            emp.empCode === empId &&
            emp.pin === pin.toString() &&
            emp.status === 'active'
        );

        if (user) {
            // Remove sensitive data
            const { pin: _, ...userData } = user;

            return res.json({
                success: true,
                user: userData
            });
        }

        return res.json({
            success: false,
            error: 'ລະຫັດພະນັກງານ ຫຼື PIN ບໍ່ຖືກຕ້ອງ'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
