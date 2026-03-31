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
            filename = `attendance_report_${state.exportPeriod}_${Date.now()}.xlsx`;
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
    const max_width = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => v.toString().length)), 10);
    ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: max_width }));

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
    const filtered = filterDataByPeriod(state.attendance);

    return filtered.map(record => {
        const emp = state.employees.find(e => e.id === record.employeeId);
        return {
            'ລະຫັດພະນັກງານ': emp?.empCode || '-',
            'ຊື່-ນາມສະກຸນ': emp?.fullName || '-',
            'ພະແນກ': emp?.department || '-',
            'ວັນທີ່': record.date,
            'ເຂົ້າວຽກ': record.checkIn || '-',
            'ອອກວຽກ': record.checkOut || '-',
            'ສະຖານທີ່ເຂົ້າ': `${record.checkInLat}, ${record.checkInLng}`,
            'ສະຖານທີ່ອອກ': record.checkOutLat ? `${record.checkOutLat}, ${record.checkOutLng}` : '-',
            'ສະຖານະ': record.checkIn ? (isLate(record.checkIn) ? 'ມາສາຍ' : 'ປົກກະຕິ') : 'ຂາດວຽກ'
        };
    });
}

function prepareEmployeeData() {
    return state.employees.filter(e => e.status === 'active').map(emp => ({
        'ລະຫັດ': emp.empCode,
        'ຊື່-ນາມສະກຸນ': emp.fullName,
        'ອີເມລ': emp.email,
        'ເບີໂທ': emp.phone,
        'ພະແນກ': emp.department,
        'ຕຳແໜ່ງ': emp.position,
        'ເງິນເດືອນ': emp.baseSalary,
        'ວັນທີ່ເຂົ້າວຽກ': emp.hireDate,
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
    // Group by department
    const deptGroups = {};
    state.employees.filter(e => e.status === 'active').forEach(emp => {
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

// ============ OTHER MENU SECTIONS ============

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
