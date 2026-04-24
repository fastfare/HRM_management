// ============ CONFIGURATION ============
const CONFIG = {
    API_URL: window.location.origin,
    OFFICE_LAT: 17.872417,
    OFFICE_LNG: 102.653306
};

const SHIFT_RULES = {
    off: { label: 'ວັນພັກ', inTime: null, outTime: null, lateThreshold: null },
    morning: { label: '08:00 - 17:00', inTime: '08:00:00', outTime: '17:00:00', lateThreshold: '08:15:00' },
    standard: { label: '09:00 - 18:00', inTime: '09:00:00', outTime: '18:00:00', lateThreshold: '09:15:00' },
    evening: { label: '10:00 - 19:00', inTime: '10:00:00', outTime: '19:00:00', lateThreshold: '10:15:00' }
};

const DEFAULT_SHIFT = 'standard';

/*
const EMPLOYEE_SHIFT_ASSIGNMENTS = {
    'SOMPHONE XAYASA': 'off',
    'CHAMPA LUANGAPHAI': 'off',
    'SOUKSAKHONE CHONPATHOUMA': 'off',
    'KHAMLAR CHITTAMANY': 'off',
    'OULAYVANH NGAVINAM': 'off',
    'VILAYPHONE VONGPHACKDE': 'morning',
    'SIVONE MANACHACK': 'standard',
    'SOMPHONE KEOPHILAVANH': 'standard',
    'SONEPHET VIPHOMMA': 'standard',
    'SATHEUAN MEUANGPHAUNE': 'standard',
    'Souksumlar(LOIY)': 'standard',
    'PHONEPASERT MALAVONG': 'evening',
    'THAVONE CHANTHY': 'evening',
    'KHANKHAM MARAVONG': 'evening',
    'SUKAN MUENXAYYAPHOM': 'morning',
    'KITTIPONG SEESOULASACK': 'standard',
    'PHOUTTHASONE SILIPANYA': 'standard',
    'SOUKSAVANH PHANNIVONGSOR': 'standard',
    'DET THESAVONG': 'off'
};
*/

// ============ STATE ============
let state = {    user: null,
    activeMenu: 'dashboard',
    selectedPeriod: 'today',
    employees: [],
    attendance: [],
    leaveRequests: [],
    exportType: 'attendance',
    exportPeriod: 'month',
    stats: {},
    selectedEmployee: null
};

// ============ MENU CONFIGURATION ============
const menus = [
    { id: 'dashboard', icon: 'home', label: 'Dashboard' },
    { id: 'employees', icon: 'users', label: 'ພະນັກງານ' },
    { id: 'attendance', icon: 'clock', label: 'ເຂົ້າ-ອອກວຽກ' },
    {
        id: 'leaves', icon: 'calendar', label: 'ການລາພັກ',
        children: [
            { id: 'leave-request', icon: 'file-plus', label: 'ສະເໜີລາພັກ' },
            { id: 'leave-pending', icon: 'clock', label: 'ລໍຖ້າອະນຸມັດ' },
            { id: 'leave-history', icon: 'history', label: 'ປະຫວັດການລາພັກ' }
        ]
    },
    { id: 'payroll', icon: 'dollar-sign', label: 'ເງິນເດືອນ' },
    {
        id: 'reports', icon: 'bar-chart-3', label: 'ລາຍງານ',
        children: [
            { id: 'report-attendance', icon: 'clock', label: 'ລາຍງານເຂົ້າ-ອອກ', exportType: 'attendance' },
            { id: 'report-attendance-summary', icon: 'calendar-check', label: 'ສະຫຼຸບມື້ເຮັດວຽກ', exportType: 'attendance-summary' },
            { id: 'report-attendance-matrix', icon: 'table', label: 'ຕາຕະລາງການມາວຽກ', exportType: 'attendance-matrix' },
            { id: 'report-employees', icon: 'users', label: 'ຂໍ້ມູນພະນັກງານ', exportType: 'employees' },
            { id: 'report-leaves', icon: 'calendar', label: 'ລາຍງານການລາ', exportType: 'leaves' },
            { id: 'report-payroll', icon: 'dollar-sign', label: 'ລາຍງານເງິນເດືອນ', exportType: 'payroll' },
            { id: 'report-ot', icon: 'clock-3', label: 'ລາຍງານໂມງ OT', exportType: 'ot' },
            { id: 'report-summary', icon: 'pie-chart', label: 'ລາຍງານສະຫຼຸບ', exportType: 'summary' }
        ]
    }
];

const exportOptions = [
    { id: 'attendance', label: 'ລາຍງານເຂົ້າ-ອອກວຽກ', icon: 'clock', desc: 'ບັນທຶກເວລາເຂົ້າ-ອອກທັງໝົດ' },
    { id: 'attendance-summary', label: 'ສະຫຼຸບມື້ເຮັດວຽກ', icon: 'calendar-check', desc: 'ສະຫຼຸບມື້ມາການລວມຂອງພະນັກງານ' },
    { id: 'attendance-matrix', label: 'ຕາຕະລາງການມາວຽກ', icon: 'table', desc: 'ລາຍງານການມາວຽກແບບ Matrix ລາຍເດືອນ' },
    { id: 'employees', label: 'ຂໍ້ມູນພະນັກງານ', icon: 'users', desc: 'ລາຍຊື່ ແລະ ຂໍ້ມູນພະນັກງານ' },
    { id: 'leaves', label: 'ລາຍງານການລາ', icon: 'calendar', desc: 'ປະຫວັດການຂໍລາທັງໝົດ' },
    { id: 'payroll', label: 'ລາຍງານເງິນເດືອນ', icon: 'dollar-sign', desc: 'ສະຫຼຸບເງິນເດືອນປະຈຳເດືອນ' },
    { id: 'ot', label: 'ລາຍງານໂມງ OT', icon: 'clock-3', desc: 'ຄິດໄລ່ຊົ່ວໂມງເຮັດວຽກເກີນກຳນົດ' },
    { id: 'summary', label: 'ລາຍງານສະຫຼຸບ', icon: 'pie-chart', desc: 'ສະຖິຕິລວມທັງໝົດ' }
];

// ============ API HELPER ============

async function callAPI(endpoint, data = {}, method = 'POST') {
    try {
        const url = `${CONFIG.API_URL}${endpoint}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (method === 'POST' || method === 'PUT') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// ============ NOTIFICATION SYSTEM ============

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    notificationText.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);

    lucide.createIcons();
}

// ============ DATE FORMATTING ============

function formatDate(date) {
    const d = new Date(date);
    const days = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'];
    const months = ['ມ.ກ.', 'ກ.ພ.', 'ມີ.ນ.', 'ເມ.ສ.', 'ພ.ພ.', 'ມິ.ຖ.', 'ກ.ລ.', 'ສ.ຫ.', 'ກ.ຍ.', 'ຕ.ລ.', 'ພ.ຈ.', 'ທ.ວ.'];

    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ============ STATISTICS ============

function calculateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = getTodayAttendance();
    const totalActive = state.employees.filter(e => e.status !== 'inactive').length;

    state.stats = {
        totalEmployees: totalActive,
        presentToday: todayAttendance.filter(a => a.checkIn).length,
        lateToday: todayAttendance.filter(a => a.status === 'late').length,
        absentToday: todayAttendance.filter(a => a.status === 'absent').length,
        offToday: todayAttendance.filter(a => a.status === 'off').length,
        pendingLeaves: state.leaveRequests.filter(r => r.status === 'pending').length,
        attendanceRate: Math.round((todayAttendance.filter(a => a.status !== 'off').length / (totalActive || 1)) * 100)
    };
}

function calculateWeeklyData() {
    const weekData = [];
    const today = new Date();
    const dayNames = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'];
    const totalActive = state.employees.filter(e => e.status !== 'inactive').length;

    for (let i = 4; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayAttendance = state.attendance.filter(a => a.date === dateStr);

        weekData.push({
            day: dayNames[date.getDay()],
            present: dayAttendance.filter(a => a.checkIn).length,
            late: dayAttendance.filter(a => {
                if (!a.checkIn) return false;
                const checkIn = new Date(`2000-01-01T${a.checkIn}`);
                return checkIn > new Date('2000-01-01T08:30');
            }).length,
            absent: Math.max(0, totalActive - dayAttendance.length)
        });
    }

    return weekData;
}

function calculateDepartmentData() {
    const deptCount = {};
    state.employees.filter(e => e.status === 'active').forEach(emp => {
        deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
    });

    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    return Object.entries(deptCount).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
    }));
}

function getEmployeeShift(emp) {
    const assigned = emp.shiftType || DEFAULT_SHIFT;
    return SHIFT_RULES[assigned] ? assigned : DEFAULT_SHIFT;
}

function getAttendanceByDate(date) {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;
    return state.employees.filter(e => e.status !== 'inactive').map(emp => {
        const record = state.attendance.find(a => a.employeeId === emp.id && a.date === targetDate);
        const shiftType = record?.shiftType || getEmployeeShift(emp);
        const shift = SHIFT_RULES[shiftType] || SHIFT_RULES.standard;

        let status;
        let forgotCheckOut = false;

        if (!record?.checkIn) {
            status = shiftType === 'off' ? 'off' : 'absent';
        } else {
            status = isLate(record.checkIn, shiftType) ? 'late' : 'working';
            
            // Check if forgot to check out (has check-in, no check-out, and date is in the past)
            if (!record.checkOut && targetDate < today) {
                forgotCheckOut = true;
            }
        }

        return {
            ...emp,
            shiftType,
            shiftLabel: shift.label,
            checkIn: record?.checkIn || null,
            checkOut: record?.checkOut || null,
            status,
            forgotCheckOut,
            avatar: emp.fullName.charAt(0),
            date: targetDate
        };
    });
}

function getTodayAttendance() {
    return getAttendanceByDate();
}

function isLate(checkInTime, shiftType = DEFAULT_SHIFT) {
    if (!checkInTime) return false;
    const shift = SHIFT_RULES[shiftType] || SHIFT_RULES.standard;
    if (!shift.lateThreshold) return false;

    const checkIn = new Date(`2000-01-01T${checkInTime}`);
    const lateTime = new Date(`2000-01-01T${shift.lateThreshold}`);
    return checkIn > lateTime;
}

// ============ CHART RENDERING ============

let weeklyChart = null;
let deptChart = null;

function renderWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    const weeklyData = calculateWeeklyData();

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeklyData.map(d => d.day),
            datasets: [
                {
                    label: 'ມາເຮັດວຽກ',
                    data: weeklyData.map(d => d.present),
                    backgroundColor: '#10b981',
                    borderRadius: 6
                },
                {
                    label: 'ມາສາຍ',
                    data: weeklyData.map(d => d.late),
                    backgroundColor: '#f59e0b',
                    borderRadius: 6
                },
                {
                    label: 'ຂາດ',
                    data: weeklyData.map(d => d.absent),
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff80', font: { size: 12 } }
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ffffff20',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: { color: '#ffffff10' },
                    ticks: { color: '#ffffff80' }
                },
                y: {
                    grid: { color: '#ffffff10' },
                    ticks: { color: '#ffffff80' },
                    beginAtZero: true
                }
            }
        }
    });
}

function renderDeptChart() {
    const ctx = document.getElementById('deptChart');
    if (!ctx) return;

    const deptData = calculateDepartmentData();

    if (deptChart) {
        deptChart.destroy();
    }

    deptChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: deptData.map(d => d.name),
            datasets: [{
                data: deptData.map(d => d.value),
                backgroundColor: deptData.map(d => d.color),
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ffffff20',
                    borderWidth: 1,
                    padding: 12
                }
            }
        }
    });
}

// ============ DATA LOADING ============

async function loadAllData() {
    try {
        const [empResult, attResult, leaveResult] = await Promise.all([
            callAPI('/api/employees', {}, 'GET'),
            callAPI('/api/attendance', {}, 'GET'),
            callAPI('/api/leave', {}, 'GET')
        ]);

        if (empResult && empResult.success !== false) {
            state.employees = Array.isArray(empResult) ? empResult : (empResult.employees || []);
        }
        if (attResult && attResult.success !== false) {
            state.attendance = Array.isArray(attResult) ? attResult : (attResult.attendance || []);
        }
        if (leaveResult && leaveResult.success !== false) {
            state.leaveRequests = Array.isArray(leaveResult) ? leaveResult : (leaveResult.requests || []);
        }

        calculateStats();

        const dot = document.getElementById('notificationDot');
        if (dot) {
            dot.style.display = state.stats.pendingLeaves > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function refreshData() {
    await loadAllData();
    renderCurrentMenu();
    showNotification('ອັບເດຕຂໍ້ມູນແລ້ວ!', 'success');
}

// ============ UI STATE ============

function setPeriod(period) {
    state.selectedPeriod = period;

    document.querySelectorAll('.period-btn').forEach(btn => {
        if (btn.dataset.period === period) {
            btn.className = 'period-btn px-4 py-2 rounded-lg text-sm transition-all bg-violet-600 text-white';
        } else {
            btn.className = 'period-btn px-4 py-2 rounded-lg text-sm transition-all text-white/60 hover:text-white';
        }
    });

    renderCurrentMenu();
}

function setExportPeriod(period) {
    state.exportPeriod = period;

    document.querySelectorAll('.export-period-btn').forEach(btn => {
        if (btn.dataset.period === period) {
            btn.className = 'export-period-btn py-2 px-3 rounded-lg text-sm bg-violet-500 text-white';
        } else {
            btn.className = 'export-period-btn py-2 px-3 rounded-lg text-sm bg-white/10 text-white/70 hover:bg-white/20';
        }
    });
}

// ============ EXPORT MODAL ============

function openExportModal() {
    renderExportOptions();
    document.getElementById('exportModal').classList.add('active');
    lucide.createIcons();
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
    document.getElementById('exportSelection').style.display = 'block';
    document.getElementById('exportLoading').style.display = 'none';
    document.getElementById('exportSuccess').style.display = 'none';
}

function renderExportOptions() {
    const container = document.getElementById('exportOptions');
    container.innerHTML = exportOptions.map(opt => `
        <button onclick="selectExportType('${opt.id}')" class="export-option w-full p-4 rounded-xl border transition-all text-left ${state.exportType === opt.id
            ? 'bg-violet-500/20 border-violet-500'
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }">
            <div class="flex items-center gap-3">
                <i data-lucide="${opt.icon}" class="w-5 h-5 text-violet-400"></i>
                <div class="flex-1">
                    <p class="text-white font-medium">${opt.label}</p>
                    <p class="text-white/60 text-xs mt-0.5">${opt.desc}</p>
                </div>
                ${state.exportType === opt.id ? '<i data-lucide="check-circle" class="w-5 h-5 text-violet-400"></i>' : ''}
            </div>
        </button>
    `).join('');

    lucide.createIcons();
}

function selectExportType(type) {
    state.exportType = type;
    renderExportOptions();
}

// ============ MENU NAVIGATION ============

let expandedMenus = {};

function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = menus.map(menu => {
        const hasChildren = menu.children && menu.children.length > 0;
        const isExpanded = expandedMenus[menu.id];
        const isActive = state.activeMenu === menu.id || (hasChildren && menu.children.some(c => state.activeMenu === c.id));

        let html = `
            <button onclick="${hasChildren ? `toggleMenuExpand('${menu.id}')` : `switchMenu('${menu.id}')`}" class="menu-item flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${isActive && !hasChildren
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : isActive && hasChildren
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
            }">
                <i data-lucide="${menu.icon}" class="w-5 h-5"></i>
                <span class="font-medium">${menu.label}</span>
                ${menu.id === 'leaves' && state.stats.pendingLeaves > 0 && !hasChildren ? `
                    <span class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        ${state.stats.pendingLeaves}
                    </span>
                ` : ''}
                ${hasChildren ? `
                    <i data-lucide="chevron-${isExpanded ? 'down' : 'right'}" class="w-4 h-4 ml-auto transition-transform"></i>
                ` : ''}
            </button>
        `;

        if (hasChildren && isExpanded) {
            html += `<div class="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">`;
            html += menu.children.map(child => {
                const onclick = child.exportType
                    ? `switchSubMenu('${child.id}', '${child.exportType}')`
                    : `switchMenu('${child.id}')`;
                const badge = child.id === 'leave-pending' && state.stats.pendingLeaves > 0
                    ? `<span class="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">${state.stats.pendingLeaves}</span>`
                    : '';
                return `
                <button onclick="${onclick}" class="menu-item flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm ${state.activeMenu === child.id
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }">
                    <i data-lucide="${child.icon}" class="w-4 h-4"></i>
                    <span>${child.label}</span>
                    ${badge}
                </button>
            `;
            }).join('');
            html += `</div>`;
        }

        return html;
    }).join('');

    lucide.createIcons();
}

function toggleMenuExpand(menuId) {
    expandedMenus[menuId] = !expandedMenus[menuId];
    renderMenu();
}

function switchMenu(menuId) {
    state.activeMenu = menuId;
    renderMenu();
    renderCurrentMenu();
}

function switchSubMenu(menuId, exportType) {
    state.activeMenu = menuId;
    if (exportType) state.exportType = exportType;
    renderMenu();
    renderCurrentMenu();
}

function renderCurrentMenu() {
    // Find label from menus or its children
    let label = 'Dashboard';
    for (const menu of menus) {
        if (menu.id === state.activeMenu) {
            label = menu.label;
            break;
        }
        if (menu.children) {
            const child = menu.children.find(c => c.id === state.activeMenu);
            if (child) {
                label = child.label;
                break;
            }
        }
    }
    document.getElementById('pageTitle').textContent = label;

    switch (state.activeMenu) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'employees':
            renderEmployees();
            break;
        case 'attendance':
            renderAttendanceTable();
            break;
        case 'leaves':
            renderLeaves();
            break;
        case 'leave-request':
            renderLeaveRequestForm();
            break;
        case 'leave-pending':
            renderLeavePending();
            break;
        case 'leave-history':
            renderLeaveHistory();
            break;
        case 'payroll':
            renderPayroll();
            break;
        case 'reports':
            renderReports();
            break;
        default:
            // Check if it's a report sub-item
            if (state.activeMenu.startsWith('report-')) {
                renderReportSubItem();
            } else {
                renderDashboard();
            }
    }
}

// ============ REPORT SUB-ITEM RENDERING ============

function renderReportSubItem() {
    const reportMenu = menus.find(m => m.id === 'reports');
    const child = reportMenu.children.find(c => c.id === state.activeMenu);
    if (!child) { renderReports(); return; }

    const content = `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-white text-2xl font-bold flex items-center gap-2">
                        <i data-lucide="${child.icon}" class="w-6 h-6 text-violet-400"></i>
                        ${child.label}
                    </h3>
                    <p class="text-white/60 text-sm mt-1">ກົດປຸ່ມດ້ານລຸ່ມເພື່ອ Export ເປັນ Excel</p>
                </div>
                <button onclick="selectExportType('${child.exportType}'); openExportModal();" class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all">
                    <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                    Export Excel
                </button>
            </div>

            <!-- Preview Data -->
            <div class="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                ${renderReportPreview(child.exportType)}
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function renderReportPreview(exportType) {
    switch (exportType) {
        case 'attendance': {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const startDate = document.getElementById('reportStartDate')?.value || firstDay;
            const endDate = document.getElementById('reportEndDate')?.value || now.toISOString().split('T')[0];

            const filtered = state.attendance.filter(a => a.date >= startDate && a.date <= endDate);

            return `
                <div class="flex flex-wrap items-end gap-3 mb-6">
                    <div>
                        <label class="text-white/70 text-sm block mb-1">ເລີ່ມວັນທີ່</label>
                        <input id="reportStartDate" type="date" value="${startDate}" onchange="renderReportSubItem()" class="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label class="text-white/70 text-sm block mb-1">ຫາວັນທີ່</label>
                        <input id="reportEndDate" type="date" value="${endDate}" onchange="renderReportSubItem()" class="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white" />
                    </div>
                </div>
                <h4 class="text-white font-semibold mb-4">📄 ລາຍລະອຽດການເຂົ້າ-ອອກວຽກ (${filtered.length} ລາຍການ)</h4>
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-left text-sm">
                        <thead class="sticky top-0 bg-[#1a1a2e] text-white/50 border-b border-white/10">
                            <tr>
                                <th class="pb-3">ວັນທີ່</th>
                                <th class="pb-3">ພະນັກງານ</th>
                                <th class="pb-3">ເຂົ້າວຽກ</th>
                                <th class="pb-3">ອອກວຽກ</th>
                                <th class="pb-3">ສະຖານະ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            ${filtered.slice(0, 50).map(a => {
                const emp = state.employees.find(e => e.id === a.employeeId);
                return `
                                <tr>
                                    <td class="py-2 text-white/70">${a.date}</td>
                                    <td class="py-2 text-white font-medium">${emp?.fullName || '-'}</td>
                                    <td class="py-2 text-white">${a.checkIn || '-'}</td>
                                    <td class="py-2 text-white">${a.checkOut || '-'}</td>
                                    <td class="py-2 text-white/70">${isLate(a.checkIn, a.shiftType) ? 'ມາສາຍ' : 'ປົກກະຕິ'}</td>
                                </tr>
                            `;
            }).join('')}
                            ${filtered.length > 50 ? '<tr><td colspan="5" class="py-4 text-center text-white/30 italic">... ແລະ ອີກ ' + (filtered.length - 50) + ' ລາຍການ ...</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            `;
        }
        case 'attendance-summary': {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const startDate = document.getElementById('reportStartDate')?.value || firstDay;
            const endDate = document.getElementById('reportEndDate')?.value || now.toISOString().split('T')[0];

            const filteredAttendance = state.attendance.filter(a => a.date >= startDate && a.date <= endDate);

            const summary = state.employees.filter(e => e.status !== 'inactive').map(emp => {
                const empAtt = filteredAttendance.filter(a => a.employeeId === emp.id);
                const present = empAtt.filter(a => a.checkIn).length;
                const late = empAtt.filter(a => isLate(a.checkIn, a.shiftType)).length;
                const totalHours = empAtt.reduce((sum, a) => sum + (a.workHours || 0), 0);

                return {
                    ...emp,
                    present,
                    late,
                    totalHours: totalHours.toFixed(1)
                };
            }).sort((a, b) => b.present - a.present);

            return `
                <div class="flex flex-wrap items-end gap-3 mb-6">
                    <div>
                        <label class="text-white/70 text-sm block mb-1">ເລີ່ມວັນທີ່</label>
                        <input id="reportStartDate" type="date" value="${startDate}" onchange="renderReportSubItem()" class="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label class="text-white/70 text-sm block mb-1">ຫາວັນທີ່</label>
                        <input id="reportEndDate" type="date" value="${endDate}" onchange="renderReportSubItem()" class="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white" />
                    </div>
                </div>
                <h4 class="text-white font-semibold mb-4">📊 ສະຫຼຸບມື້ມາການລວມ</h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="text-white/50 text-sm border-b border-white/10">
                            <tr>
                                <th class="pb-3">ພະນັກງານ</th>
                                <th class="pb-3">ພະແນກ</th>
                                <th class="pb-3 text-center">ມື້ເຮັດວຽກ</th>
                                <th class="pb-3 text-center">ມາສາຍ</th>
                                <th class="pb-3 text-center">ຊົ່ວໂມງລວມ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            ${summary.map(s => `
                                <tr>
                                    <td class="py-3 text-white font-medium">${s.fullName}</td>
                                    <td class="py-3 text-white/70 text-sm">${s.department}</td>
                                    <td class="py-3 text-center text-green-400 font-bold">${s.present}</td>
                                    <td class="py-3 text-center text-yellow-400">${s.late}</td>
                                    <td class="py-3 text-center text-white/70">${s.totalHours} ຊມ</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        case 'employees': {
            const activeEmps = state.employees.filter(e => e.status !== 'inactive');
            const depts = {};
            activeEmps.forEach(e => { depts[e.department] = (depts[e.department] || 0) + 1; });
            return `
                <h4 class="text-white font-semibold mb-4">👥 ສະຫຼຸບພະນັກງານ</h4>
                <div class="grid grid-cols-2 gap-3">
                    ${Object.entries(depts).map(([dept, count]) => `
                        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span class="text-white/70">${dept}</span>
                            <span class="text-white font-bold">${count} ຄົນ</span>
                        </div>
                    `).join('')}
                </div>
                <p class="text-white/50 text-sm mt-4">ພະນັກງານ active ທັງໝົດ: ${activeEmps.length} ຄົນ</p>
            `;
        }
        case 'leaves': {
            const pending = state.leaveRequests.filter(r => r.status === 'pending').length;
            const approved = state.leaveRequests.filter(r => r.status === 'approved').length;
            const rejected = state.leaveRequests.filter(r => r.status === 'rejected').length;
            return `
                <h4 class="text-white font-semibold mb-4">📋 ສະຫຼຸບການລາ</h4>
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-yellow-500/10 rounded-xl p-4 text-center">
                        <p class="text-yellow-400 text-2xl font-bold">${pending}</p>
                        <p class="text-white/60 text-sm">ລໍຖ້າ</p>
                    </div>
                    <div class="bg-green-500/10 rounded-xl p-4 text-center">
                        <p class="text-green-400 text-2xl font-bold">${approved}</p>
                        <p class="text-white/60 text-sm">ອະນຸມັດ</p>
                    </div>
                    <div class="bg-red-500/10 rounded-xl p-4 text-center">
                        <p class="text-red-400 text-2xl font-bold">${rejected}</p>
                        <p class="text-white/60 text-sm">ປະຕິເສດ</p>
                    </div>
                </div>
            `;
        }
        case 'payroll': {
            const totalSalary = state.employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);
            return `
                <h4 class="text-white font-semibold mb-4">💰 ສະຫຼຸບເງິນເດືອນ</h4>
                <div class="bg-violet-500/10 rounded-xl p-6 text-center">
                    <p class="text-violet-400 text-3xl font-bold">₭ ${totalSalary.toLocaleString()}</p>
                    <p class="text-white/60 text-sm mt-2">ເງິນເດືອນລວມ ${state.employees.length} ພະນັກງານ</p>
                </div>
            `;
        }
        case 'attendance-matrix': {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const startDate = document.getElementById('reportStartDate')?.value || firstDay;
            const endDate = document.getElementById('reportEndDate')?.value || now.toISOString().split('T')[0];
            
            // Calculate all dates in range
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
            
            return `
                <div class="flex flex-wrap items-end gap-3 mb-6">
                    <div>
                        <label class="text-white/70 text-sm block mb-1">ເລີ່ມວັນທີ່</label>
                        <input id="reportStartDate" type="date" value="${startDate}" onchange="renderReportSubItem()" class="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label class="text-white/70 text-sm block mb-1">ຫາວັນທີ່</label>
                        <input id="reportEndDate" type="date" value="${endDate}" onchange="renderReportSubItem()" class="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white" />
                    </div>
                </div>

                <div class="text-center mb-6">
                    <h3 class="text-white text-xl font-bold">ລາຍງານມື້ມາການທັງໝົດຂອງພະນັກງານ</h3>
                    <p class="text-white/60">ຊ່ວງເວລາ: ${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')}</p>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-[10px] text-center border-collapse">
                        <thead>
                            <tr class="bg-white/5 text-white/70">
                                <th class="p-2 border border-white/10 text-left">ລຳດັບ</th>
                                <th class="p-2 border border-white/10 text-left">ລະຫັດ</th>
                                <th class="p-2 border border-white/10 text-left min-w-[120px]">ຊື່ ແລະ ນາມສະກຸນ</th>
                                ${dateRange.map(d => `<th class="p-1 border border-white/10 min-w-[25px]">${d.split('-')[2]}</th>`).join('')}
                                <th class="p-2 border border-white/10 bg-green-500/20 text-green-400">ລວມ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            ${activeEmps.map((emp, idx) => {
                const empAtt = state.attendance.filter(a => a.employeeId === emp.id && a.date >= startDate && a.date <= endDate);
                let total = 0;

                return `
                                    <tr>
                                        <td class="p-2 border border-white/10 text-white/50">${idx + 1}</td>
                                        <td class="p-2 border border-white/10 text-white/50 text-left">${emp.empCode}</td>
                                        <td class="p-2 border border-white/10 text-white text-left font-medium text-xs">${emp.fullName}</td>
                                        ${dateRange.map(d => {
                    const record = empAtt.find(a => a.date === d);
                    const isPresent = record && record.checkIn && record.checkOut;
                    const isIncomplete = record && (!record.checkIn || !record.checkOut);
                    
                    if (isPresent) total++;
                    
                    let cellClass = 'text-white/10';
                    let cellContent = '-';
                    
                    if (isPresent) {
                        cellClass = 'bg-green-500/20 text-green-400';
                        cellContent = '✓';
                    } else if (isIncomplete) {
                        cellClass = 'bg-red-500/20 text-red-400';
                        cellContent = '✕';
                    }

                    return `<td class="p-1 border border-white/10 ${cellClass}">${cellContent}</td>`;
                }).join('')}
                                        <td class="p-2 border border-white/10 bg-green-500/20 text-green-400 font-bold">${total}</td>
                                    </tr>
                                `;
            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        default:
            return '<p class="text-white/50">ບໍ່ມີຂໍ້ມູນ</p>';
    }
}

// ============ LOGOUT ============

function logout() {
    if (confirm('ຢືນຢັນອອກຈາກລະບົບ?')) {
        localStorage.removeItem('hrUser');
        window.location.href = 'index.html';
    }
}

// ============ INITIALIZATION ============

async function init() {
    const userStr = localStorage.getItem('hrUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    state.user = JSON.parse(userStr);

    if (state.user.role !== 'admin') {
        alert('ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້!');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('adminName').textContent = state.user.fullName || state.user.name;
    document.getElementById('adminAvatar').textContent = (state.user.fullName || state.user.name).charAt(0);
    document.getElementById('currentDate').textContent = formatDate(new Date());

    await loadAllData();

    // Auto-expand reports menu
    expandedMenus['reports'] = false;

    renderMenu();
    renderCurrentMenu();

    lucide.createIcons();

    setInterval(async () => {
        await loadAllData();
        if (state.activeMenu === 'dashboard') {
            renderDashboard();
        }
        lucide.createIcons();
    }, 30000);
}

window.addEventListener('DOMContentLoaded', init);
