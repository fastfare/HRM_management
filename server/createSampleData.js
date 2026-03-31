const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

// Sample employees data
const employees = [
    {
        id: uuidv4(),
        empCode: 'EMP001',
        fullName: 'Panoy',
        email: 'panoy@company.la',
        phone: '020XXXXXXXX',
        department: 'Accounting',
        position: 'Accountant',
        baseSalary: 5000000,
        pin: '1111',
        role: 'admin',
        hireDate: '2024-01-01',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        empCode: 'EMP002',
        fullName: 'Add',
        email: 'add@company.la',
        phone: '020YYYYYYYY',
        department: 'Operations',
        position: 'Driver',
        baseSalary: 3000000,
        pin: '2222',
        role: 'user',
        hireDate: '2024-02-01',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: uuidv4(),
        empCode: 'EMP003',
        fullName: 'Souk',
        email: 'souk@company.la',
        phone: '020ZZZZZZZZ',
        department: 'Sales',
        position: 'Sales Representative',
        baseSalary: 4000000,
        pin: '3333',
        role: 'user',
        hireDate: '2024-03-01',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Sample shift assignment from schedule (demo)
const shiftAssignments = {
    'Panoy': 'morning',
    'Add': 'standard',
    'Souk': 'evening'
};

// Create leave balances for each employee
const leaveBalances = employees.map(emp => ({
    id: uuidv4(),
    employeeId: emp.id,
    year: 2026,
    annualQuota: 15,
    annualUsed: 0,
    annualRemaining: 15,
    sickQuota: 30,
    sickUsed: 0,
    sickRemaining: 30,
    updatedAt: new Date().toISOString()
}));

// Sample attendance records (last 3 days)
const attendance = [];
const today = new Date();
for (let i = 2; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    employees.forEach(emp => {
        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
        const checkInMin = Math.floor(Math.random() * 30);
        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const checkOutMin = Math.floor(Math.random() * 30);

        const checkIn = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00`;
        const checkOut = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}:00`;

        const workHours = (checkOutHour - checkInHour - 1) + ((60 - checkInMin + checkOutMin) / 60);
        const shiftType = shiftAssignments[emp.fullName] || 'standard';
        const shiftLateAllowance = shiftType === 'morning' ? '08:15:00' : shiftType === 'evening' ? '10:15:00' : '09:15:00';
        const status = checkIn <= shiftLateAllowance ? 'on_time' : 'late';

        attendance.push({
            id: uuidv4(),
            employeeId: emp.id,
            date: dateStr,
            shiftType,
            checkIn,
            checkOut,
            checkInLat: 17.962501,
            checkInLng: 102.641697,
            checkOutLat: 17.962501,
            checkOutLng: 102.641697,
            status,
            workHours: parseFloat(workHours.toFixed(2)),
            notes: '',
            createdAt: new Date(dateStr).toISOString()
        });
    });
}

// Write sample data
console.log('📝 Creating sample data...\n');

fs.writeFileSync(
    path.join(DATA_DIR, 'employees.json'),
    JSON.stringify(employees, null, 2),
    'utf8'
);
console.log(`✅ Created ${employees.length} employees`);

fs.writeFileSync(
    path.join(DATA_DIR, 'attendance.json'),
    JSON.stringify(attendance, null, 2),
    'utf8'
);
console.log(`✅ Created ${attendance.length} attendance records`);

fs.writeFileSync(
    path.join(DATA_DIR, 'leave_balances.json'),
    JSON.stringify(leaveBalances, null, 2),
    'utf8'
);
console.log(`✅ Created ${leaveBalances.length} leave balances`);

fs.writeFileSync(
    path.join(DATA_DIR, 'leave_requests.json'),
    JSON.stringify([], null, 2),
    'utf8'
);
console.log('✅ Created empty leave requests');

fs.writeFileSync(
    path.join(DATA_DIR, 'payroll.json'),
    JSON.stringify([], null, 2),
    'utf8'
);
console.log('✅ Created empty payroll\n');

console.log('='.repeat(50));
console.log('🎉 Sample data created successfully!');
console.log('='.repeat(50));
console.log('\n📋 Test Accounts:');
console.log('   EMP001 / PIN: 1111 (Panoy - Admin)');
console.log('   EMP002 / PIN: 2222 (Add - User)');
console.log('   EMP003 / PIN: 3333 (Souk - User)');
console.log('\n💡 Run: node server/server.js to start the server');
console.log('='.repeat(50));
