const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, findById, addItem, updateItem } = require('../fileHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/leave/request
 * Request leave
 */
router.post('/request', (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;

        if (!employeeId || !leaveType || !startDate || !endDate) {
            return res.json({
                success: false,
                error: 'ກະລຸນາໃສ່ຂໍ້ມູນຄົບຖ້ວນ'
            });
        }

        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Create request
        const newRequest = {
            id: uuidv4(),
            employeeId,
            leaveType,
            startDate,
            endDate,
            days,
            reason: reason || '',
            status: 'pending',
            approvedBy: null,
            approvedAt: null,
            rejectionReason: null,
            createdAt: new Date().toISOString()
        };

        const requests = readJSON('leave_requests.json');
        requests.push(newRequest);
        writeJSON('leave_requests.json', requests);

        res.json({
            success: true,
            message: 'ສົ່ງຄຳຂໍລາສຳເລັດ',
            id: newRequest.id
        });

    } catch (error) {
        console.error('Leave request error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/leave/my-requests/:employeeId
 * Get my leave requests
 */
router.get('/my-requests/:employeeId', (req, res) => {
    try {
        const { employeeId } = req.params;

        const requests = readJSON('leave_requests.json');
        const myRequests = requests
            .filter(req => req.employeeId === employeeId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            requests: myRequests
        });

    } catch (error) {
        console.error('Get my requests error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/leave/pending
 * Get pending leave requests (admin)
 */
router.get('/pending', (req, res) => {
    try {
        const requests = readJSON('leave_requests.json');
        const employees = readJSON('employees.json');
        const balances = readJSON('leave_balances.json');
        const year = new Date().getFullYear();

        const pending = requests
            .filter(req => req.status === 'pending')
            .map(req => {
                const employee = employees.find(emp => emp.id === req.employeeId);
                const balance = balances.find(b => b.employeeId === req.employeeId && b.year === year);

                return {
                    ...req,
                    employeeName: employee ? employee.fullName : 'Unknown',
                    employeeDepartment: employee ? employee.department : '-',
                    leaveBalance: balance || null
                };
            });

        res.json({
            success: true,
            requests: pending
        });

    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/leave/approve
 * Approve leave request (admin)
 */
router.post('/approve', (req, res) => {
    try {
        const { leaveId, approvedBy } = req.body;

        const requests = readJSON('leave_requests.json');
        const requestIndex = requests.findIndex(req => req.id === leaveId);

        if (requestIndex === -1) {
            return res.json({
                success: false,
                error: 'ບໍ່ພົບຄຳຂໍ'
            });
        }

        const request = requests[requestIndex];

        // Update request status
        requests[requestIndex] = {
            ...request,
            status: 'approved',
            approvedBy,
            approvedAt: new Date().toISOString()
        };

        writeJSON('leave_requests.json', requests);

        // Update leave balance
        const balances = readJSON('leave_balances.json');
        const year = new Date().getFullYear();
        const balanceIndex = balances.findIndex(b =>
            b.employeeId === request.employeeId && b.year === year
        );

        if (balanceIndex !== -1) {
            const balance = balances[balanceIndex];

            if (request.leaveType === 'annual') {
                balance.annualUsed += request.days;
                balance.annualRemaining = balance.annualQuota - balance.annualUsed;
            } else if (request.leaveType === 'sick') {
                balance.sickUsed += request.days;
                balance.sickRemaining = balance.sickQuota - balance.sickUsed;
            }

            balance.updatedAt = new Date().toISOString();
            balances[balanceIndex] = balance;
            writeJSON('leave_balances.json', balances);
        }

        res.json({
            success: true,
            message: 'ອະນຸມັດສຳເລັດ'
        });

    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/leave/reject
 * Reject leave request (admin)
 */
router.post('/reject', (req, res) => {
    try {
        const { leaveId, approvedBy, reason } = req.body;

        const requests = readJSON('leave_requests.json');
        const requestIndex = requests.findIndex(req => req.id === leaveId);

        if (requestIndex === -1) {
            return res.json({
                success: false,
                error: 'ບໍ່ພົບຄຳຂໍ'
            });
        }

        requests[requestIndex] = {
            ...requests[requestIndex],
            status: 'rejected',
            approvedBy,
            approvedAt: new Date().toISOString(),
            rejectionReason: reason || ''
        };

        writeJSON('leave_requests.json', requests);

        res.json({
            success: true,
            message: 'ປະຕິເສດສຳເລັດ'
        });

    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/leave/balance/:employeeId
 * Get leave balance
 */
router.get('/balance/:employeeId', (req, res) => {
    try {
        const { employeeId } = req.params;
        const year = new Date().getFullYear();

        const balances = readJSON('leave_balances.json');
        let balance = balances.find(b => b.employeeId === employeeId && b.year === year);

        // Create if not exists
        if (!balance) {
            balance = {
                id: uuidv4(),
                employeeId,
                year,
                annualQuota: 15,
                annualUsed: 0,
                annualRemaining: 15,
                sickQuota: 30,
                sickUsed: 0,
                sickRemaining: 30,
                updatedAt: new Date().toISOString()
            };
            balances.push(balance);
            writeJSON('leave_balances.json', balances);
        }

        res.json({
            success: true,
            balance
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/leave
 * Get all leave requests (admin)
 */
router.get('/', (req, res) => {
    try {
        const requests = readJSON('leave_requests.json');
        const employees = readJSON('employees.json');
        const balances = readJSON('leave_balances.json');
        const year = new Date().getFullYear();

        // Enrich requests with employee and balance data
        const enrichedRequests = requests.map(req => {
            const employee = employees.find(emp => emp.id === req.employeeId);
            const balance = balances.find(b => b.employeeId === req.employeeId && b.year === year);

            return {
                ...req,
                employeeName: employee ? employee.fullName : 'Unknown',
                employeeDepartment: employee ? employee.department : '-',
                leaveBalance: balance || null
            };
        });

        res.json(enrichedRequests);
    } catch (error) {
        console.error('Get all leave requests error:', error);
        res.status(500).json([]);
    }
});

module.exports = router;
