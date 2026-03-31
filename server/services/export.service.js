const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { readJSON } = require('../fileHandler');

const EXPORT_DIR = path.join(__dirname, '../../exports');

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Export attendance report to Excel
 */
async function exportAttendanceExcel(startDate, endDate, employeeId = null) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'HR System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Attendance Report');

    // Header styling
    sheet.columns = [
        { header: 'ລຳດັບ', key: 'no', width: 8 },
        { header: 'ລະຫັດ', key: 'empCode', width: 12 },
        { header: 'ຊື່-ນາມສະກຸນ', key: 'fullName', width: 25 },
        { header: 'ວັນທີ', key: 'date', width: 12 },
        { header: 'ເຂົ້າວຽກ', key: 'checkIn', width: 10 },
        { header: 'ອອກວຽກ', key: 'checkOut', width: 10 },
        { header: 'ຊົ່ວໂມງ', key: 'workHours', width: 10 },
        { header: 'ສະຖານະ', key: 'status', width: 12 }
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '6366F1' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Fetch data
    const attendance = readJSON('attendance.json');
    const employees = readJSON('employees.json');

    let records = attendance.filter(rec => {
        const recDate = new Date(rec.date);
        const inRange = recDate >= new Date(startDate) && recDate <= new Date(endDate);
        const matchEmployee = !employeeId || rec.employeeId === employeeId;
        return inRange && matchEmployee;
    });

    // Sort by date
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Add data rows
    records.forEach((record, index) => {
        const employee = employees.find(emp => emp.id === record.employeeId);

        const row = sheet.addRow({
            no: index + 1,
            empCode: employee?.empCode || '-',
            fullName: employee?.fullName || '-',
            date: formatDate(record.date),
            checkIn: record.checkIn || '-',
            checkOut: record.checkOut || '-',
            workHours: record.workHours || '-',
            status: translateStatus(record.status)
        });

        // Color code status
        const statusCell = row.getCell('status');
        if (record.status === 'late') {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        } else if (record.status === 'absent') {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        } else if (record.status === 'on_time') {
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
        }
    });

    // Add summary
    sheet.addRow([]);
    sheet.addRow(['ສະຫຼຸບ:']);
    sheet.addRow(['ລວມທັງໝົດ:', records.length]);
    sheet.addRow(['ຕົງເວລາ:', records.filter(r => r.status === 'on_time').length]);
    sheet.addRow(['ມາສາຍ:', records.filter(r => r.status === 'late').length]);

    // Generate file
    const filename = `attendance_${startDate}_${endDate}.xlsx`;
    const filepath = path.join(EXPORT_DIR, filename);

    await workbook.xlsx.writeFile(filepath);

    return {
        filepath,
        filename,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
}

/**
 * Export payslip to PDF
 */
async function exportPayslipPDF(employeeId, month, year) {
    const employees = readJSON('employees.json');
    const payroll = readJSON('payroll.json');

    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) throw new Error('Employee not found');

    // For now, create a basic payslip with sample data
    // In real implementation, calculate from attendance data

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `payslip_${employee.empCode}_${year}-${String(month).padStart(2, '0')}.pdf`;
    const filepath = path.join(EXPORT_DIR, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Title
    doc.fontSize(20).text('ໃບສະລິບເງິນເດືອນ', { align: 'center' });
    doc.moveDown();

    // Employee info
    doc.fontSize(12);
    doc.text(`ລະຫັດພະນັກງານ: ${employee.empCode}`);
    doc.text(`ຊື່-ນາມສະກຸນ: ${employee.fullName}`);
    doc.text(`ຕຳແໜ່ງ: ${employee.position || '-'}`);
    doc.text(`ເດືອນ: ${month}/${year}`);
    doc.moveDown();

    // Table (simplified)
    doc.text('ລາຍຮັບ:', { underline: true });
    doc.text(`  ເງິນເດືອນພື້ນຖານ: ${formatCurrency(employee.baseSalary || 0)}`);
    doc.text(`  ລວມລາຍຮັບ: ${formatCurrency(employee.baseSalary || 0)}`);
    doc.moveDown();

    doc.text('ລາຍຈ່າຍ/ຫັກ:', { underline: true });
    doc.text(`  ປະກັນສັງຄົມ: 0 LAK`);
    doc.moveDown();

    doc.fontSize(14).text(`ສຸດທິ: ${formatCurrency(employee.baseSalary || 0)}`, {
        underline: true,
        bold: true
    });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
            resolve({
                filepath,
                filename,
                mimetype: 'application/pdf'
            });
        });
        stream.on('error', reject);
    });
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function translateStatus(status) {
    const map = {
        'on_time': 'ຕົງເວລາ',
        'late': 'ມາສາຍ',
        'absent': 'ຂາດວຽກ',
        'leave': 'ລາພັກ'
    };
    return map[status] || status;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('lo-LA').format(amount) + ' LAK';
}

module.exports = {
    exportAttendanceExcel,
    exportPayslipPDF
};
