const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, findById, addItem, updateItem, deleteItem } = require('../fileHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/employees
 * Get all employees (admin only)
 */
router.get('/', (req, res) => {
    try {
        const employees = readJSON('employees.json');

        // Remove PIN from response
        const safeEmployees = employees.map(emp => {
            const { pin, ...safe } = emp;
            return safe;
        });

        res.json({
            success: true,
            employees: safeEmployees
        });

    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/employees
 * Register new employee (admin only)
 */
router.post('/', (req, res) => {
    try {
        const { empCode, fullName, email, phone, department, position, baseSalary, pin, role } = req.body;

        if (!empCode || !fullName || !pin) {
            return res.json({
                success: false,
                error: 'ກະລຸນາໃສ່ຂໍ້ມູນຄົບຖ້ວນ'
            });
        }

        // Check duplicate emp_code
        const employees = readJSON('employees.json');
        const exists = employees.find(emp => emp.empCode === empCode);

        if (exists) {
            return res.json({
                success: false,
                error: 'ລະຫັດພະນັກງານນີ້ມີແລ້ວ'
            });
        }

        // Create new employee
        const now = new Date().toISOString();
        const newEmployee = {
            id: uuidv4(),
            empCode,
            fullName,
            email: email || '',
            phone: phone || '',
            department: department || '',
            position: position || '',
            baseSalary: parseFloat(baseSalary) || 0,
            pin: pin.toString(),
            role: role || 'user',
            shiftType: req.body.shiftType || 'standard',
            hireDate: new Date().toISOString().split('T')[0],
            status: 'active',
            createdAt: now,
            updatedAt: now
        };

        employees.push(newEmployee);
        writeJSON('employees.json', employees);

        // Create leave balance for new employee
        const balances = readJSON('leave_balances.json');
        balances.push({
            id: uuidv4(),
            employeeId: newEmployee.id,
            year: new Date().getFullYear(),
            annualQuota: 15,
            annualUsed: 0,
            annualRemaining: 15,
            sickQuota: 30,
            sickUsed: 0,
            sickRemaining: 30,
            updatedAt: now
        });
        writeJSON('leave_balances.json', balances);

        res.json({
            success: true,
            message: 'ລົງທະບຽນສຳເລັດ',
            employeeId: newEmployee.id
        });

    } catch (error) {
        console.error('Register employee error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/employees/:id
 * Update employee (admin only)
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, department, position, baseSalary, hireDate, role, status } = req.body;

        const updates = {
            ...(fullName && { fullName }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone }),
            ...(department !== undefined && { department }),
            ...(position !== undefined && { position }),
            ...(baseSalary !== undefined && { baseSalary: parseFloat(baseSalary) }),
            ...(hireDate !== undefined && { hireDate }),
            ...(role && { role }),
            ...(req.body.shiftType && { shiftType: req.body.shiftType }),
            ...(status && { status }),
            updatedAt: new Date().toISOString()
        };

        const success = updateItem('employees.json', id, updates);

        if (success) {
            res.json({
                success: true,
                message: 'ອັບເດດສຳເລັດ'
            });
        } else {
            res.json({
                success: false,
                error: 'ບໍ່ພົບພະນັກງານ'
            });
        }

    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/employees/:id/reset-pin
 * Reset employee PIN (admin or self-service with current PIN verification)
 */
router.post('/:id/reset-pin', (req, res) => {
    try {
        const { id } = req.params;
        const { newPin, currentPin } = req.body;

        if (!newPin || !/^\d{4}$/.test(newPin)) {
            return res.json({
                success: false,
                error: 'PIN ຕ້ອງເປັນຕົວເລກ 4 ໂຕ'
            });
        }

        const employees = readJSON('employees.json');
        const employee = employees.find(emp => emp.id === id);

        if (!employee) {
            return res.json({
                success: false,
                error: 'ບໍ່ພົບພະນັກງານ'
            });
        }

        // If currentPin is provided, verify it (employee self-service)
        if (currentPin !== undefined) {
            if (employee.pin !== currentPin.toString()) {
                return res.json({
                    success: false,
                    error: 'PIN ປັດຈຸບັນບໍ່ຖືກຕ້ອງ'
                });
            }
        }

        const success = updateItem('employees.json', id, { pin: newPin.toString() });

        if (success) {
            res.json({
                success: true,
                message: 'ລີເຊັດ PIN ສຳເລັດ',
                employeeName: employee.fullName,
                newPin
            });
        } else {
            res.json({
                success: false,
                error: 'ລີເຊັດ PIN ບໍ່ສຳເລັດ'
            });
        }

    } catch (error) {
        console.error('Reset PIN error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/employees/:id
 * Soft delete employee (admin only)
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const success = deleteItem('employees.json', id);

        if (success) {
            res.json({
                success: true,
                message: 'ປິດການໃຊ້ງານສຳເລັດ'
            });
        } else {
            res.json({
                success: false,
                error: 'ບໍ່ພົບພະນັກງານ'
            });
        }

    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
