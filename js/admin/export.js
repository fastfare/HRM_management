// ============ EXCEL EXPORT FUNCTIONS ============

async function startExport() {
    // Show loading
    document.getElementById('exportSelection').style.display = 'none';
    document.getElementById('exportLoading').style.display = 'block';

    setTimeout(async () => {
        await performExport();
    }, 2000);
}

async function performExport() {
    let data = [];
    let filename = '';

    switch (state.exportType) {
        case 'attendance':
            data = prepareAttendanceData();
            filename = `attendance_report_${Date.now()}.xlsx`;
            break;
        case 'attendance-summary':
            data = prepareAttendanceSummaryData();
            filename = `attendance_summary_${Date.now()}.xlsx`;
            break;
        case 'attendance-matrix':
            data = prepareAttendanceMatrixData();
            filename = `attendance_matrix_${Date.now()}.xlsx`;
            break;
        case 'employees':
            data = prepareEmployeeData();
            filename = `employees_${Date.now()}.xlsx`;
            break;
        case 'leaves':
            data = prepareLeaveData();
            filename = `leave_report_${state.exportPeriod}_${Date.now()}.xlsx`;
            break;
        case 'payroll':
            data = preparePayrollData();
            filename = `payroll_${state.exportPeriod}_${Date.now()}.xlsx`;
            break;
        case 'ot':
            data = prepareOTData();
            filename = `ot_report_${state.exportPeriod}_${Date.now()}.xlsx`;
            break;
        case 'summary':
            data = prepareSummaryData();
            filename = `summary_report_${state.exportPeriod}_${Date.now()}.xlsx`;
            break;
    }

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    // Auto-size columns
    if (data.length > 0) {
        const max_width = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => (v || '').toString().length)), 10);
        ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: max_width + 5 }));
    }

    // Download
    XLSX.writeFile(wb, filename);

    // Show success
    document.getElementById('exportLoading').style.display = 'none';
    document.getElementById('exportSuccess').style.display = 'block';
    document.getElementById('exportFilename').textContent = filename;

    setTimeout(() => {
        closeExportModal();
    }, 2000);
}

function prepareAttendanceData() {
    const startDate = document.getElementById('reportStartDate')?.value;
    const endDate = document.getElementById('reportEndDate')?.value;
    
    let filtered;
    if (startDate && endDate) {
        filtered = state.attendance.filter(a => a.date >= startDate && a.date <= endDate);
    } else {
        filtered = filterDataByPeriod(state.attendance);
    }

    return filtered.map(record => {
        const emp = state.employees.find(e => e.id === record.employeeId);
        return {
            'ວັນທີ່': record.date,
            'ລະຫັດພະນັກງານ': emp?.empCode || '-',
            'ຊື່-ນາມສະກຸນ': emp?.fullName || '-',
            'ພະແນກ': emp?.department || '-',
            'ເຂົ້າວຽກ': record.checkIn || '-',
            'ອອກວຽກ': record.checkOut || '-',
            'ຊົ່ວໂມງເຮັດວຽກ': record.workHours || 0,
            'ສະຖານະ': record.checkIn ? (isLate(record.checkIn, record.shiftType) ? 'ມາສາຍ' : 'ປົກກະຕິ') : 'ຂາດວຽກ'
        };
    });
}

function prepareAttendanceSummaryData() {
    const startDate = document.getElementById('reportStartDate')?.value;
    const endDate = document.getElementById('reportEndDate')?.value;
    
    let filteredAttendance;
    if (startDate && endDate) {
        filteredAttendance = state.attendance.filter(a => a.date >= startDate && a.date <= endDate);
    } else {
        filteredAttendance = state.attendance; 
    }

    return state.employees.filter(e => e.status !== 'inactive').map(emp => {
        const empAtt = filteredAttendance.filter(a => a.employeeId === emp.id);
        const present = empAtt.filter(a => a.checkIn).length;
        const late = empAtt.filter(a => isLate(a.checkIn, a.shiftType)).length;
        const totalHours = empAtt.reduce((sum, a) => sum + (a.workHours || 0), 0);

        return {
            'ລະຫັດພະນັກງານ': emp.empCode,
            'ຊື່-ນາມສະກຸນ': emp.fullName,
            'ພະແນກ': emp.department,
            'ມື້ເຮັດວຽກທັງໝົດ': present,
            'ມາສາຍ (ຄັ້ງ)': late,
            'ຊົ່ວໂມງລວມ': totalHours.toFixed(2)
        };
    });
}

function prepareEmployeeData() {
    return state.employees.filter(e => e.status !== 'inactive').map(emp => ({
        'ລະຫັດ': emp.empCode,
        'ຊື່-ນາມສະກຸນ': emp.fullName,
        'ອີເມລ': emp.email,
        'ເບີໂທ': emp.phone,
        'ພະແນກ': emp.department,
        'ຕຳແໜ່ງ': emp.position,
        'ເງິນເດືອນ': emp.baseSalary,
        'ວັນທີ່ເຂົ້າວຽກ': emp.hireDate,
        'ມື້ເຮັດວຽກ': (emp.workDays || [1,2,3,4,5,6]).map(d => ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'][d]).join(', '),
        'ສະຖານະ': emp.status
    }));
}

function prepareLeaveData() {
    const filtered = filterDataByPeriod(state.leaveRequests, 'startDate');

    return filtered.map(leave => {
        const emp = state.employees.find(e => e.id === leave.employeeId);
        return {
            'ພະນັກງານ': emp?.fullName || '-',
            'ພະແນກ': emp?.department || '-',
            'ປະເພດການລາ': leave.leaveType,
            'ເລີ່ມວັນທີ່': leave.startDate,
            'ຮອດວັນທີ່': leave.endDate,
            'ຈຳນວນມື້': leave.days,
            'ເຫດຜົນ': leave.reason,
            'ສະຖານະ': leave.status === 'pending' ? 'ລໍຖ້າອະນຸມັດ' : leave.status === 'approved' ? 'ອະນຸມັດແລ້ວ' : 'ປະຕິເສດ',
            'ຜູ້ອະນຸມັດ': leave.approvedBy || '-',
            'ວັນທີ່ອະນຸມັດ': leave.approvedAt || '-'
        };
    });
}

function preparePayrollData() {
    const deptGroups = {};
    state.employees.filter(e => e.status !== 'inactive').forEach(emp => {
        if (!deptGroups[emp.department]) {
            deptGroups[emp.department] = {
                department: emp.department,
                count: 0,
                totalSalary: 0
            };
        }
        deptGroups[emp.department].count++;
        deptGroups[emp.department].totalSalary += emp.baseSalary;
    });

    return Object.values(deptGroups).map(dept => ({
        'ພະແນກ': dept.department,
        'ຈຳນວນພະນັກງານ': dept.count,
        'ເງິນເດືອນລວມ': dept.totalSalary.toLocaleString()
    }));
}

function prepareSummaryData() {
    const stats = state.stats;
    return [
        { 'ລາຍການ': 'ພະນັກງານທັງໝົດ', 'ຈຳນວນ': stats.totalEmployees },
        { 'ລາຍການ': 'ເຂົ້າວຽກມື້ນີ້', 'ຈຳນວນ': stats.presentToday },
        { 'ລາຍການ': 'ມາສາຍມື້ນີ້', 'ຈຳນວນ': stats.lateToday },
        { 'ລາຍການ': 'ຂາດວຽກ/ລາມື້ນີ້', 'ຈຳນວນ': stats.absentToday },
        { 'ລາຍການ': 'ອັດຕາການເຂົ້າວຽກ', 'ຈຳນວນ': `${stats.attendanceRate}%` },
        { 'ລາຍການ': 'ການລາລໍຖ້າອະນຸມັດ', 'ຈຳນວນ': stats.pendingLeaves }
    ];
}

function filterDataByPeriod(data, dateField = 'date') {
    const today = new Date();
    const period = state.exportPeriod;

    if (period === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        return data.filter(item => item[dateField] === todayStr);
    } else if (period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= weekAgo && itemDate <= today;
        });
    } else if (period === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= monthAgo && itemDate <= today;
        });
    }

    return data;
}

function renderPayroll() {
    const content = `
        <div class="space-y-4">
            <div class="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
                <p class="text-sm opacity-80">ເງິນເດືອນລວມປະຈຳເດືອນ</p>
                <p class="text-4xl font-bold mt-2">₭ ${state.employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0).toLocaleString()}</p>
                <p class="text-sm opacity-80 mt-1">${state.employees.length} ພະນັກງານ</p>
            </div>
            
            <div class="bg-[#1a1a2e] rounded-xl p-6 border border-white/10">
                <h3 class="text-white font-bold mb-4">ລາຍການເງິນເດືອນຕາມພະແນກ</h3>
                <div class="space-y-3">
                    ${Object.entries(state.employees.reduce((acc, emp) => {
                        if (!acc[emp.department]) acc[emp.department] = { count: 0, total: 0 };
                        acc[emp.department].count++;
                        acc[emp.department].total += emp.baseSalary || 0;
                        return acc;
                    }, {})).map(([dept, data]) => `
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                                <p class="text-white font-medium">${dept}</p>
                                <p class="text-white/50 text-sm">${data.count} ຄົນ</p>
                            </div>
                            <p class="text-white font-bold">₭ ${data.total.toLocaleString()}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function renderReports() {
    const content = `
        <div class="grid grid-cols-3 gap-4">
            ${exportOptions.map(opt => `
                <button
                    onclick="selectExportType('${opt.id}'); openExportModal();"
                    class="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10 text-left hover:border-violet-500 transition-all group"
                >
                    <div class="p-3 bg-violet-500/20 rounded-xl w-fit group-hover:bg-violet-500/30 transition-colors">
                        <i data-lucide="${opt.icon}" class="w-6 h-6 text-violet-400"></i>
                    </div>
                    <h3 class="text-white font-semibold mt-4">${opt.label}</h3>
                    <p class="text-white/50 text-sm mt-1">${opt.desc}</p>
                    <div class="flex items-center gap-2 mt-4 text-green-400 text-sm">
                        <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                        Export Excel
                    </div>
                </button>
            `).join('')}
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function prepareAttendanceMatrixData() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const startDate = document.getElementById('reportStartDate')?.value || firstDay;
    const endDate = document.getElementById('reportEndDate')?.value || now.toISOString().split('T')[0];
    
    const getDatesInRange = (start, end) => {
        const dates = [];
        let curr = new Date(start);
        const last = new Date(end);
        while (curr <= last) {
            dates.push(new Date(curr).toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }
        return dates;
    };

    const dateRange = getDatesInRange(startDate, endDate);
    const activeEmps = state.employees.filter(e => e.status !== 'inactive');

    return activeEmps.map((emp, idx) => {
        const empAtt = state.attendance.filter(a => a.employeeId === emp.id && a.date >= startDate && a.date <= endDate);
        let total = 0;

        const row = {
            'ລຳດັບ': idx + 1,
            'ລະຫັດພະນັກງານ': emp.empCode,
            'ຊື່ ແລະ ນາມສະກຸນ': emp.fullName
        };

        dateRange.forEach(d => {
            const record = empAtt.find(a => a.date === d);
            const isPresent = record && record.checkIn && record.checkOut;
            const isIncomplete = record && (!record.checkIn || !record.checkOut);
            
            if (isPresent) total++;
            
            const dayNum = d.split('-')[2];
            row[dayNum] = isPresent ? '✓' : (isIncomplete ? '✕' : '');
        });

        row['ລວມ'] = total;
        return row;
    });
}

function prepareOTData() {
    const startDate = document.getElementById('reportStartDate')?.value;
    const endDate = document.getElementById('reportEndDate')?.value;
    
    let filtered;
    if (startDate && endDate) {
        filtered = state.attendance.filter(a => a.date >= startDate && a.date <= endDate && a.checkOut);
    } else {
        filtered = filterDataByPeriod(state.attendance).filter(a => a.checkOut);
    }

    return filtered.map(record => {
        const emp = state.employees.find(e => e.id === record.employeeId);
        const workHours = parseFloat(record.workHours || 0);
        
        // Get day of week (0=Sun, 1=Mon, ..., 6=Sat)
        const dateObj = new Date(record.date);
        const dayOfWeek = dateObj.getDay();
        
        // Check if it's a work day for this employee (Default to Mon-Sat if not set)
        const empWorkDays = emp?.workDays || [1, 2, 3, 4, 5, 6];
        const isWorkDay = empWorkDays.map(Number).includes(dayOfWeek);
        
        let normalHours = 0;
        let otHours = 0;
        
        if (isWorkDay) {
            // On a work day, standard is 8 hours, rest is OT
            normalHours = Math.min(8, workHours);
            otHours = Math.max(0, workHours - 8);
        } else {
            // On an off day, everything is OT
            normalHours = 0;
            otHours = workHours;
        }
        
        return {
            'ວັນທີ່': record.date,
            'ວັນໃນອາທິດ': ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'][dayOfWeek],
            'ລະຫັດພະນັກງານ': emp?.empCode || '-',
            'ຊື່-ນາມສະກຸນ': emp?.fullName || '-',
            'ພະແນກ': emp?.department || '-',
            'ປະເພດມື້': isWorkDay ? 'ມື້ວຽກປົກກະຕິ' : 'ມື້ພັກ (OT)',
            'ເຂົ້າວຽກ': record.checkIn || '-',
            'ອອກວຽກ': record.checkOut || '-',
            'ຊົ່ວໂມງເຮັດວຽກລວມ': workHours,
            'ຊົ່ວໂມງປົກກະຕິ': normalHours,
            'ໂມງ OT': parseFloat(otHours.toFixed(2))
        };
    });
}
