const express = require('express');
const router = express.Router();
const path = require('path');
const { exportAttendanceExcel, exportPayslipPDF } = require('../services/export.service');

/**
 * GET /api/export/attendance
 * Export attendance report to Excel
 * Query params: startDate, endDate, employeeId (optional)
 */
router.get('/attendance', async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'ກະລຸນາລະບຸວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ'
            });
        }

        const result = await exportAttendanceExcel(startDate, endDate, employeeId);

        res.download(result.filepath, result.filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({
                    success: false,
                    error: 'ດາວໂຫຼດລົ້ມເຫຼວ'
                });
            }
        });

    } catch (error) {
        console.error('Export attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/export/payslip/:employeeId
 * Export payslip to PDF
 * Query params: month, year
 */
router.get('/payslip/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                error: 'ກະລຸນາລະບຸເດືອນ ແລະ ປີ'
            });
        }

        const result = await exportPayslipPDF(employeeId, parseInt(month), parseInt(year));

        res.download(result.filepath, result.filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({
                    success: false,
                    error: 'ດາວໂຫຼດລົ້ມເຫຼວ'
                });
            }
        });

    } catch (error) {
        console.error('Export payslip error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
