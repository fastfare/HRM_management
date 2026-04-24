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
 * Check-in with GPS validation and optional photo
 */
router.post('/checkin', uploadAttendancePhoto, (req, res) => {
    try {
        const { employeeId, lat, lng, shiftType = 'standard' } = req.body;

        if (!employeeId || lat === undefined || lng === undefined) {
            return res.json({
                success: false,
                error: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ'
            });
        }

        const shift = SHIFT_RULES[shiftType] || SHIFT_RULES.standard;
        if (shiftType === 'off') {
            return res.json({
                success: false,
                error: 'ພະນັກງານນີ້ໄດ້ວັນພັກ, ບໍ່ສາມາດເຂົ້າວຽກ'
            });
        }

        // Validate GPS
        const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            OFFICE_LAT,
            OFFICE_LNG
        );

        // Bypass GPS for special users
        const employees = readJSON('employees.json');
        const employee = employees.find(e => e.id === employeeId || e.empCode === employeeId);
        const specialCodes = ['dsax001', 'dsax002', 'dsax003', 'dsax004', 'dsax005'];
        const isSpecial = employee && employee.empCode && specialCodes.includes(employee.empCode.toLowerCase().trim());

        if (distance > GEOFENCE_RADIUS && !isSpecial) {
            return res.json({
                success: false,
                error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${Math.round(distance)}m)`,
                distance: Math.round(distance)
            });
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const timeNow = now.toTimeString().split(' ')[0];

        // Check if already checked in today
        const attendance = readJSON('attendance.json');
        const existing = attendance.find(rec =>
            rec.employeeId === employeeId &&
            rec.date === today &&
            rec.checkIn
        );

        if (existing) {
            return res.json({
                success: false,
                error: 'ເຂົ້າວຽກແລ້ວມື້ນີ້'
            });
        }

        // Determine status based on shift
        const lateThreshold = shift.lateThreshold || '09:15:00';
        const status = timeNow <= lateThreshold ? 'on_time' : 'late';

        // Get photo URL if uploaded
        const checkInPhotoUrl = req.file ? `/uploads/attendance/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${req.file.filename}` : null;

        // Create new record
        const newRecord = {
            id: uuidv4(),
            employeeId,
            date: today,
            shiftType,
            checkIn: timeNow,
            checkOut: null,
            checkInLat: parseFloat(lat),
            checkInLng: parseFloat(lng),
            checkOutLat: null,
            checkOutLng: null,
            checkInPhotoUrl,
            checkOutPhotoUrl: null,
            status,
            workHours: 0,
            notes: '',
            createdAt: now.toISOString()
        };

        attendance.push(newRecord);
        writeJSON('attendance.json', attendance);

        res.json({
            success: true,
            message: 'ເຂົ້າວຽກສຳເລັດ',
            checkIn: timeNow,
            status,
            distance: Math.round(distance)
        });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/attendance/checkout
 * Check-out with GPS validation
 */
router.post('/checkout', (req, res) => {
    try {
        const { employeeId, lat, lng } = req.body;

        if (!employeeId || lat === undefined || lng === undefined) {
            return res.json({
                success: false,
                error: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ'
            });
        }

        // Validate GPS
        const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            OFFICE_LAT,
            OFFICE_LNG
        );

        // Bypass GPS for special users
        const employees = readJSON('employees.json');
        const employee = employees.find(e => e.id === employeeId || e.empCode === employeeId);
        const specialCodes = ['dsax001', 'dsax002', 'dsax003', 'dsax004', 'dsax005'];
        const isSpecial = employee && employee.empCode && specialCodes.includes(employee.empCode.toLowerCase().trim());

        if (distance > GEOFENCE_RADIUS && !isSpecial) {
            return res.json({
                success: false,
                error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${Math.round(distance)}m)`
            });
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const timeNow = now.toTimeString().split(' ')[0];

        // Find today's record
        const attendance = readJSON('attendance.json');
        const recordIndex = attendance.findIndex(rec =>
            rec.employeeId === employeeId &&
            rec.date === today
        );

        if (recordIndex === -1) {
            return res.json({
                success: false,
                error: 'ບໍ່ພົບບັນທຶກເຂົ້າວຽກມື້ນີ້'
            });
        }

        const record = attendance[recordIndex];

        if (!record.checkIn) {
            return res.json({
                success: false,
                error: 'ກະລຸນາກົດເຂົ້າວຽກກ່ອນ'
            });
        }

        if (record.checkOut) {
            return res.json({
                success: false,
                error: 'ອອກວຽກແລ້ວມື້ນີ້'
            });
        }

        // Determine shift info for checkout (from the initial checkin record whenever available)
        const shiftType = record.shiftType || 'standard';
        const shift = SHIFT_RULES[shiftType] || SHIFT_RULES.standard;

        // Calculate work hours
        const checkInTime = new Date(`${today} ${record.checkIn}`);
        const checkOutTime = new Date(`${today} ${timeNow}`);
        const diffMs = checkOutTime - checkInTime;
        const diffHrs = (diffMs / (1000 * 60 * 60)) - 1; // minus 1 hour lunch
        const workHours = Math.max(0, diffHrs).toFixed(2);

        // Update record
        attendance[recordIndex] = {
            ...record,
            checkOut: timeNow,
            checkOutLat: parseFloat(lat),
            checkOutLng: parseFloat(lng),
            workHours: parseFloat(workHours),
            shiftType
        };

        writeJSON('attendance.json', attendance);

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
