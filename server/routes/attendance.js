const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, addItem, updateItem, filterItems } = require('../fileHandler');
const { v4: uuidv4 } = require('uuid');
const { uploadAttendancePhoto } = require('../middleware/upload');

// GPS Config
const OFFICE_LAT = 17.872417;
const OFFICE_LNG = 102.653306;
const GEOFENCE_RADIUS = 100; // meters

// Shift rules from schedule image (default is 09:00-18:00)
const SHIFT_RULES = {
    off: { label: 'ไม่มีตารางงาน', in: null, out: null, lateThreshold: null },
    morning: { label: '08:00 - 17:00', in: '08:00:00', out: '17:00:00', lateThreshold: '08:15:00' },
    standard: { label: '09:00 - 18:00', in: '09:00:00', out: '18:00:00', lateThreshold: '09:15:00' },
    evening: { label: '10:00 - 19:00', in: '10:00:00', out: '19:00:00', lateThreshold: '10:15:00' }
};

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * POST /api/attendance/checkin
 */
router.post('/checkin', uploadAttendancePhoto, (req, res) => {
    try {
        const { employeeId, lat, lng, shiftType = 'standard' } = req.body;
        console.log('--- API CHECKIN ATTEMPT ---');
        console.log('Payload:', { employeeId, lat, lng, shiftType });

        if (!employeeId) return res.json({ success: false, error: 'ບໍ່ພົບລະຫັດພະນັກງານ' });

        const employees = readJSON('employees.json');
        const employee = employees.find(e => e.id === employeeId || e.empCode === employeeId);
        
        if (!employee) {
            console.error('Check-in error: Employee not found');
            return res.json({ success: false, error: 'ບໍ່ພົບຂໍ້ມູນພະນັກງານໃນລະບົບ' });
        }

        const specialCodes = ['dsax001', 'dsax002', 'dsax003', 'dsax004', 'dsax005'];
        const isSpecial = employee.empCode && specialCodes.includes(employee.empCode.toLowerCase().trim());
        const currentEmpCode = employee.empCode || 'N/A';
        
        const distance = calculateDistance(parseFloat(lat || 0), parseFloat(lng || 0), OFFICE_LAT, OFFICE_LNG);
        console.log(`User: ${employee.fullName}, Distance: ${Math.round(distance)}m, Special: ${isSpecial}`);

        if (distance > GEOFENCE_RADIUS && !isSpecial) {
            console.warn(`Check-in rejected: Out of range for user ${currentEmpCode}`);
            return res.json({
                success: false,
                error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${Math.round(distance)}m) [User: ${currentEmpCode}]`
            });
        }
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const timeNow = now.toTimeString().split(' ')[0];
        const actualEmployeeId = employee.id; // Always use UUID

        const attendance = readJSON('attendance.json');
        const existing = attendance.find(rec => rec.employeeId === actualEmployeeId && rec.date === today && rec.checkIn);

        if (existing) {
            return res.json({ success: false, error: 'ທ່ານໄດ້ເຂົ້າວຽກແລ້ວມື້ນີ້' });
        }

        const shift = SHIFT_RULES[shiftType] || SHIFT_RULES.standard;
        const status = timeNow <= (shift.lateThreshold || '09:15:00') ? 'on_time' : 'late';

        const newRecord = {
            id: uuidv4(),
            employeeId: actualEmployeeId,
            date: today,
            shiftType,
            checkIn: timeNow,
            checkOut: null,
            checkInLat: parseFloat(lat || 0),
            checkInLng: parseFloat(lng || 0),
            checkOutLat: null,
            checkOutLng: null,
            checkInPhotoUrl: req.file ? `/uploads/attendance/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${req.file.filename}` : null,
            status,
            workHours: 0,
            createdAt: now.toISOString()
        };

        attendance.push(newRecord);
        const saveSuccess = writeJSON('attendance.json', attendance);
        
        if (!saveSuccess) {
            console.error('DATABASE ERROR: Could not write attendance.json');
            return res.json({ success: false, error: 'ບໍ່ສາມາດບັນທຶກລົງຖານຂໍ້ມູນໄດ້ (Database Write Error)' });
        }

        console.log('Check-in successful saved.');

        res.json({ success: true, message: 'ເຂົ້າວຽກສຳເລັດ', checkIn: timeNow, status });

    } catch (error) {
        console.error('Check-in Critical Error:', error);
        res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
    }
});

/**
 * POST /api/attendance/checkout
 */
router.post('/checkout', (req, res) => {
    try {
        const { employeeId, lat, lng } = req.body;
        console.log('--- API CHECKOUT ATTEMPT ---');
        
        const employees = readJSON('employees.json');
        const employee = employees.find(e => e.id === employeeId || e.empCode === employeeId);
        if (!employee) return res.json({ success: false, error: 'ບໍ່ພົບພະນັກງານ' });

        const specialCodes = ['dsax001', 'dsax002', 'dsax003', 'dsax004', 'dsax005'];
        const isSpecial = employee.empCode && specialCodes.includes(employee.empCode.toLowerCase().trim());
        const distance = calculateDistance(parseFloat(lat || 0), parseFloat(lng || 0), OFFICE_LAT, OFFICE_LNG);

        if (distance > GEOFENCE_RADIUS && !isSpecial) {
            return res.json({ 
                success: false, 
                error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${Math.round(distance)}m) [User: ${employee.empCode}]` 
            });
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const timeNow = now.toTimeString().split(' ')[0];
        const actualEmployeeId = employee.id;

        const attendance = readJSON('attendance.json');
        const recordIndex = attendance.findIndex(rec => rec.employeeId === actualEmployeeId && rec.date === today);

        if (recordIndex === -1) return res.json({ success: false, error: 'ບໍ່ພົບບັນທຶກເຂົ້າວຽກມື້ນີ້' });
        if (attendance[recordIndex].checkOut) return res.json({ success: false, error: 'ທ່ານໄດ້ອອກວຽກແລ້ວ' });

        const record = attendance[recordIndex];
        const checkInTime = new Date(`${today} ${record.checkIn}`);
        const checkOutTime = new Date(`${today} ${timeNow}`);
        const workHours = Math.max(0, (checkOutTime - checkInTime) / (1000 * 60 * 60) - 1).toFixed(2);

        attendance[recordIndex] = {
            ...record,
            checkOut: timeNow,
            checkOutLat: parseFloat(lat || 0),
            checkOutLng: parseFloat(lng || 0),
            workHours: parseFloat(workHours)
        };

        const saveSuccess = writeJSON('attendance.json', attendance);
        if (!saveSuccess) {
            console.error('DATABASE ERROR: Could not write attendance.json (checkout)');
            return res.json({ success: false, error: 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນອອກວຽກໄດ້' });
        }

        console.log('Check-out successful saved.');
        res.json({ success: true, message: 'ອອກວຽກສຳເລັດ', checkOut: timeNow, workHours });

    } catch (error) {
        console.error('Check-out Critical Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

        res.json({
            success: true,
            message: 'ອອກວຽກສຳເລັດ',
            checkOut: timeNow,
            workHours: parseFloat(workHours)
        });

    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/attendance/today/:employeeId
 * Get today's attendance record
 */
router.get('/today/:employeeId', (req, res) => {
    try {
        const { employeeId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const attendance = readJSON('attendance.json');
        const todayRecord = attendance.find(rec =>
            rec.employeeId === employeeId &&
            rec.date === today
        );

        res.json({
            success: true,
            attendance: todayRecord || null
        });

    } catch (error) {
        console.error('Get today attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/attendance/history/:employeeId?limit=30
 * Get attendance history
 */
router.get('/history/:employeeId', (req, res) => {
    try {
        const { employeeId } = req.params;
        const limit = parseInt(req.query.limit) || 30;

        const attendance = readJSON('attendance.json');
        const history = attendance
            .filter(rec => rec.employeeId === employeeId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/attendance
 * Get all attendance records (admin)
 */
router.get('/', (req, res) => {
    try {
        const attendance = readJSON('attendance.json');
        res.json(attendance);
    } catch (error) {
        console.error('Get all attendance error:', error);
        res.status(500).json([]);
    }
});

/**
 * PUT /api/attendance/:id
 * Update attendance record (admin)
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut, date, shiftType } = req.body;

        const attendance = readJSON('attendance.json');
        const recordIndex = attendance.findIndex(rec => rec.id === id);

        if (recordIndex === -1) {
            return res.json({
                success: false,
                error: 'ບໍ່ພົບບັນທຶກ'
            });
        }

        const record = attendance[recordIndex];
        const updatedDate = date || record.date;
        const updatedCheckIn = checkIn || record.checkIn;
        const updatedCheckOut = checkOut || record.checkOut;
        const updatedShiftType = shiftType || record.shiftType || 'standard';

        // Recalculate work hours
        let workHours = 0;
        if (updatedCheckIn && updatedCheckOut) {
            const start = new Date(`${updatedDate} ${updatedCheckIn}`);
            const end = new Date(`${updatedDate} ${updatedCheckOut}`);
            const diffMs = end - start;
            const diffHrs = (diffMs / (1000 * 60 * 60)) - 1; // minus 1 hour lunch
            workHours = parseFloat(Math.max(0, diffHrs).toFixed(2));
        }

        // Recalculate status
        const shift = SHIFT_RULES[updatedShiftType] || SHIFT_RULES.standard;
        const lateThreshold = shift.lateThreshold || '09:15:00';
        const status = updatedCheckIn <= lateThreshold ? 'on_time' : 'late';

        attendance[recordIndex] = {
            ...record,
            date: updatedDate,
            checkIn: updatedCheckIn,
            checkOut: updatedCheckOut,
            shiftType: updatedShiftType,
            workHours,
            status,
            updatedAt: new Date().toISOString()
        };

        writeJSON('attendance.json', attendance);

        res.json({
            success: true,
            message: 'ອັບເດດສຳເລັດ',
            record: attendance[recordIndex]
        });

    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
