// ============ DASHBOARD RENDERING ============

function renderDashboard() {
    const stats = state.stats;
    const todayAttendance = getTodayAttendance().slice(0, 5);
    const pendingLeaves = state.leaveRequests.filter(r => r.status === 'pending');
    const deptData = calculateDepartmentData();
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    // --- Early Bird Ranking ---
    const earlyBirds = getTodayAttendance()
        .filter(emp => emp.checkIn)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
        .slice(0, 5);

    // --- Top Workers Today ---
    const topWorkersToday = getTodayAttendance()
        .filter(emp => emp.checkIn && emp.checkOut)
        .map(emp => ({
            ...emp,
            hoursNum: getWorkingHoursNumber(emp.checkIn, emp.checkOut),
            hoursStr: calculateWorkingHours(emp.checkIn, emp.checkOut)
        }))
        .sort((a, b) => b.hoursNum - a.hoursNum)
        .slice(0, 5);

    // --- Top Workers This Month ---
    const nowMonth = new Date().toISOString().slice(0, 7);
    const monthAttMap = {};
    state.attendance
        .filter(a => a.date && a.date.startsWith(nowMonth) && a.checkIn && a.checkOut)
        .forEach(a => {
            const h = getWorkingHoursNumber(a.checkIn, a.checkOut);
            monthAttMap[a.employeeId] = (monthAttMap[a.employeeId] || 0) + h;
        });
    const topWorkersMonth = Object.entries(monthAttMap)
        .map(([empId, totalH]) => {
            const emp = state.employees.find(e => e.id === empId);
            return {
                fullName: emp ? emp.fullName : empId,
                department: emp ? emp.department : '-',
                avatar: emp ? emp.fullName.charAt(0) : '?',
                hoursNum: totalH,
                hoursStr: totalH.toFixed(1) + ' ຊມ'
            };
        })
        .sort((a, b) => b.hoursNum - a.hoursNum)
        .slice(0, 5);

    // Pre-build ranking row HTML strings (avoids nested template literal issues)
    function buildRankRows(list, valKey, accent, emptyMsg) {
        if (list.length === 0) return '<p class="text-white/50 text-center py-8">' + emptyMsg + '</p>';
        return list.map(function (emp, idx) {
            var rowBg = idx === 0 ? 'bg-' + accent + '-500/10 border border-' + accent + '-500/30' : 'bg-white/5';
            var valColor = idx === 0 ? 'text-' + accent + '-400' : 'text-white';
            return '<div class="flex items-center gap-3 p-3 rounded-xl ' + rowBg + '">' +
                '<span class="text-2xl w-8 text-center">' + medals[idx] + '</span>' +
                '<div class="w-9 h-9 rounded-full bg-' + accent + '-500/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">' + emp.avatar + '</div>' +
                '<div class="flex-1 min-w-0">' +
                '<p class="text-white text-sm font-medium truncate">' + emp.fullName + '</p>' +
                '<p class="text-white/50 text-xs truncate">' + emp.department + '</p>' +
                '</div>' +
                '<div class="text-right"><p class="text-sm font-bold ' + valColor + '">' + emp[valKey] + '</p></div>' +
                '</div>';
        }).join('');
    }

    var earlyBirdRows = buildRankRows(earlyBirds.map(function (e) { return Object.assign({}, e, { checkIn: e.checkIn }); }), 'checkIn', 'yellow', 'ຍັງບໍ່ມີໃຜເຂົ້າວຽກ');
    var todayRows = buildRankRows(topWorkersToday, 'hoursStr', 'blue', 'ຍັງບໍ່ມີໃຜ Check-out');
    var monthRows = buildRankRows(topWorkersMonth, 'hoursStr', 'purple', 'ຍັງບໍ່ມີຂໍ້ມູນເດືອນນີ້');

    var pendingLeaveCards = pendingLeaves.length === 0
        ? '<p class="text-white/50 text-center py-8">ບໍ່ມີລາຍການລໍຖ້າອະນຸມັດ</p>'
        : pendingLeaves.slice(0, 3).map(function (leave) {
            var emp = state.employees.find(function (e) { return e.id === leave.employeeId; });
            return '<div class="p-4 bg-white/5 rounded-xl border border-white/10">' +
                '<div class="flex items-start justify-between mb-2">' +
                '<div><p class="text-white font-medium">' + (emp ? emp.fullName : 'Unknown') + '</p>' +
                '<p class="text-purple-400 text-sm">' + leave.type + '</p></div>' +
                '<span class="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">ລໍຖ້າ</span>' +
                '</div>' +
                '<p class="text-white/60 text-sm mb-3">📅 ' + leave.startDate + ' - ' + leave.endDate + ' (' + leave.days + ' ມື້)</p>' +
                '<div class="flex gap-2">' +
                '<button onclick="approveLeave(\'' + leave.id + '\')" class="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"><i data-lucide="check" class="w-4 h-4"></i> ອະນຸມັດ</button>' +
                '<button onclick="rejectLeave(\'' + leave.id + '\')" class="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"><i data-lucide="x" class="w-4 h-4"></i> ປະຕິເສດ</button>' +
                '</div></div>';
        }).join('');

    var liveCards = todayAttendance.map(function (emp) {
        var bg = emp.status === 'working' ? 'bg-green-500' : emp.status === 'late' ? 'bg-yellow-500' : 'bg-red-500';
        var bc = emp.status === 'working' ? 'bg-green-500/20 text-green-400' : emp.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';
        var lb = emp.status === 'working' ? 'ເຮັດວຽກ' : emp.status === 'late' ? 'ສາຍ' : 'ຂາດ';
        return '<div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">' +
            '<div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ' + bg + '">' + emp.avatar + '</div>' +
            '<div class="flex-1"><p class="text-white text-sm font-medium">' + emp.fullName + '</p><p class="text-white/50 text-xs">' + emp.department + '</p></div>' +
            '<div class="text-right"><p class="text-white text-sm">' + (emp.checkIn || '-') + '</p>' +
            '<span class="text-xs px-2 py-0.5 rounded-full ' + bc + '">' + lb + '</span></div>' +
            '</div>';
    }).join('');

    const content = `
        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-start justify-between">
                    <div class="p-3 rounded-xl bg-blue-500/20"><i data-lucide="users" class="w-6 h-6 text-blue-400"></i></div>
                    <span class="text-sm text-white/50">+0</span>
                </div>
                <p class="text-3xl font-bold text-white mt-3">${stats.totalEmployees}</p>
                <p class="text-white/50 text-sm mt-1">ພະນັກງານທັງໝົດ</p>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-start justify-between">
                    <div class="p-3 rounded-xl bg-green-500/20"><i data-lucide="check-circle" class="w-6 h-6 text-green-400"></i></div>
                    <div class="flex items-center gap-1 text-sm text-green-400"><i data-lucide="trending-up" class="w-4 h-4"></i><span>${stats.attendanceRate}%</span></div>
                </div>
                <p class="text-3xl font-bold text-white mt-3">${stats.presentToday}</p>
                <p class="text-white/50 text-sm mt-1">ເຂົ້າວຽກມື້ນີ້</p>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-start justify-between">
                    <div class="p-3 rounded-xl bg-yellow-500/20"><i data-lucide="alert-triangle" class="w-6 h-6 text-yellow-400"></i></div>
                    <span class="text-sm text-white/50">-1</span>
                </div>
                <p class="text-3xl font-bold text-white mt-3">${stats.lateToday}</p>
                <p class="text-white/50 text-sm mt-1">ມາສາຍ</p>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-start justify-between">
                    <div class="p-3 rounded-xl bg-red-500/20"><i data-lucide="x-circle" class="w-6 h-6 text-red-400"></i></div>
                    <span class="text-sm text-white/50">0</span>
                </div>
                <p class="text-3xl font-bold text-white mt-3">${stats.absentToday}</p>
                <p class="text-white/50 text-sm mt-1">ຂາດວຽກ/ລາ</p>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="col-span-2 bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <h3 class="text-white font-semibold mb-4">📊 ສະຖິຕິປະຈຳອາທິດ</h3>
                <div class="chart-container"><canvas id="weeklyChart"></canvas></div>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <h3 class="text-white font-semibold mb-4">👥 ພະນັກງານຕາມພະແນກ</h3>
                <div style="height: 180px;"><canvas id="deptChart"></canvas></div>
                <div class="grid grid-cols-2 gap-2 mt-4">
                    ${deptData.map(d => `<div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full" style="background-color: ${d.color}"></div><span class="text-white/70 text-xs">${d.name}: ${d.value}</span></div>`).join('')}
                </div>
            </div>
        </div>

        <!-- Row 1: Rankings + Live + Pending -->
        <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold flex items-center gap-2"><i data-lucide="trophy" class="w-5 h-5 text-yellow-400"></i> ມາໄວທີ່ສຸດ</h3>
                    <span class="text-white/40 text-xs">ມື້ນີ້</span>
                </div>
                <div class="space-y-3 max-h-64 overflow-auto">${earlyBirdRows}</div>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold flex items-center gap-2"><i data-lucide="activity" class="w-5 h-5 text-green-400"></i> ສະຖານະ Real-time</h3>
                    <span class="text-green-400 text-sm animate-pulse">● Live</span>
                </div>
                <div class="space-y-3 max-h-64 overflow-auto">${liveCards}</div>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold flex items-center gap-2"><i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-400"></i> ລໍຖ້າອະນຸມັດ</h3>
                    <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">${pendingLeaves.length} ລາຍການ</span>
                </div>
                <div class="space-y-3 max-h-64 overflow-auto">${pendingLeaveCards}</div>
            </div>
        </div>

        <!-- Row 2: Working Hours Rankings -->
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold flex items-center gap-2"><i data-lucide="timer" class="w-5 h-5 text-blue-400"></i> ເຮັດວຽກຫຼາຍທີ່ສຸດ (ມື້ນີ້)</h3>
                    <span class="text-white/40 text-xs">ຊົ່ວໂມງ / ມື້ນີ້</span>
                </div>
                <div class="space-y-3 max-h-64 overflow-auto">${todayRows}</div>
            </div>
            <div class="bg-[#1a1a2e] rounded-2xl p-5 border border-white/10">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold flex items-center gap-2"><i data-lucide="calendar-clock" class="w-5 h-5 text-purple-400"></i> ເຮັດວຽກຫຼາຍທີ່ສຸດ (ເດືອນນີ້)</h3>
                    <span class="text-white/40 text-xs">ຊົ່ວໂມງລວມ</span>
                </div>
                <div class="space-y-3 max-h-64 overflow-auto">${monthRows}</div>
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();

    setTimeout(() => {
        renderWeeklyChart();
        renderDeptChart();
    }, 100);
}

// ============ ATTENDANCE TABLE ============

function renderAttendanceTable() {
    const activeDate = document.getElementById('attendanceDateInput')?.value || new Date().toISOString().split('T')[0];
    const todayAttendance = getAttendanceByDate(activeDate);

    // Sort by earliest check-in first
    const sortedAttendance = todayAttendance.sort((a, b) => {
        if (a.checkIn && !b.checkIn) return -1;
        if (!a.checkIn && b.checkIn) return 1;
        if (!a.checkIn && !b.checkIn) return 0;
        return a.checkIn.localeCompare(b.checkIn);
    });

    const content = `
        <!-- Filters -->
        <div class="flex gap-3 mb-4 flex-wrap">
            <div class="w-56">
                <label for="attendanceDateInput" class="text-white/70 text-xs">ເລືອກວັນທີ່</label>
                <input
                    id="attendanceDateInput"
                    type="date"
                    value="${new Date().toISOString().split('T')[0]}"
                    class="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    onchange="filterAttendance()"
                />
            </div>
            <div class="flex-1 relative">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"></i>
                <input 
                    id="searchInput"
                    placeholder="ຄົ້ນຫາພະນັກງານ..." 
                    class="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-violet-500"
                    oninput="filterAttendance()"
                />
            </div>
            <button onclick="openExportModal()" class="px-4 py-3 bg-green-500 text-white rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors">
                <i data-lucide="download" class="w-5 h-5"></i>
                Export Excel
            </button>
        </div>
        
        <!-- Table -->
        <div class="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
            <div class="grid grid-cols-8 gap-4 p-4 bg-white/5 text-white/60 text-sm font-medium">
                <span>ພະນັກງານ</span>
                <span>ພະແນກ</span>
                <span>ຊິຟ໌</span>
                <span>ເຂົ້າວຽກ</span>
                <span>ອອກວຽກ</span>
                <span>ຊົ່ວໂມງ</span>
                <span>ສະຖານະ</span>
                <span class="text-center">ຈັດການ</span>
            </div>
            <div id="attendanceTableBody">
                ${sortedAttendance.map(emp => renderAttendanceRow(emp)).join('')}
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function renderAttendanceRow(emp) {
    const workingHours = emp.checkIn && emp.checkOut ? calculateWorkingHours(emp.checkIn, emp.checkOut) : '-';
    // Find the original attendance record ID from state.attendance
    const record = state.attendance.find(a => a.employeeId === emp.id && a.date === emp.date);

    let statusLabel = emp.status === 'working' ? 'ປົກກະຕິ' : emp.status === 'late' ? 'ມາສາຍ' : emp.status === 'absent' ? 'ຂາດວຽກ' : 'ພັກ';
    let statusClass = emp.status === 'working' ? 'bg-green-500/20 text-green-400' : emp.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';
    let avatarBg = emp.status === 'working' ? 'bg-green-500' : emp.status === 'late' ? 'bg-yellow-500' : 'bg-red-500';

    if (emp.forgotCheckOut) {
        statusLabel = 'ລືມກົດອອກ';
        statusClass = 'bg-orange-500/20 text-orange-400';
        avatarBg = 'bg-orange-500';
    }

    return `
        <div class="grid grid-cols-8 gap-4 p-4 border-t border-white/10 items-center hover:bg-white/5 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${avatarBg}">
                    ${emp.avatar}
                </div>
                <span class="text-white">${emp.fullName}</span>
            </div>
            <span class="text-white/70">${emp.department}</span>
            <span class="text-white/70">${emp.shiftLabel || 'standard'}</span>
            <span class="text-white">${emp.checkIn || '-'}</span>
            <span class="text-white ${emp.forgotCheckOut ? 'text-orange-400 italic' : ''}">${emp.checkOut || (emp.forgotCheckOut ? 'ລືມກົດອອກ' : '-')}</span>
            <span class="text-white">${workingHours}</span>
            <span class="px-3 py-1 rounded-full text-xs w-fit ${statusClass}">
                ${statusLabel}
            </span>
            <div class="flex justify-center gap-2">
                <button onclick="openEditAttendanceModal('${record ? record.id : ''}', '${emp.id}', '${emp.date}')" class="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors" title="ແກ້ໄຂ">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                </button>
                <button class="p-2 hover:bg-white/10 rounded-lg text-white/50 transition-colors">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;
}

// ============ ATTENDANCE EDIT MODAL ============

function openEditAttendanceModal(recordId, employeeId, date) {
    const emp = state.employees.find(e => e.id === employeeId);
    const record = state.attendance.find(a => a.id === recordId) || {
        id: null,
        employeeId,
        date,
        checkIn: '',
        checkOut: '',
        shiftType: getEmployeeShift(emp)
    };

    const modal = document.getElementById('editAttendanceModal');
    modal.innerHTML = `
        <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-white text-xl font-bold flex items-center gap-2">
                    <i data-lucide="clock" class="w-6 h-6 text-blue-400"></i>
                    ແກ້ໄຂເວລາ: ${emp.fullName}
                </h3>
                <button onclick="closeModal('editAttendanceModal')" class="text-white/50 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="space-y-4 mb-6">
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ວັນທີ່</label>
                    <input id="editAttDate" type="date" value="${date}" disabled class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 focus:outline-none" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-white/70 text-sm mb-1 block">ເວລາເຂົ້າວຽກ</label>
                        <input id="editAttCheckIn" type="time" step="1" value="${record.checkIn || ''}" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label class="text-white/70 text-sm mb-1 block">ເວລາອອກວຽກ</label>
                        <input id="editAttCheckOut" type="time" step="1" value="${record.checkOut || ''}" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    </div>
                </div>

                <div>
                    <label class="text-white/70 text-sm mb-1 block">ປະເພດກະ (Shift)</label>
                    <select id="editAttShift" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500">
                        ${Object.entries(SHIFT_RULES).map(([key, val]) => `
                            <option value="${key}" ${record.shiftType === key ? 'selected' : ''}>${val.label}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p class="text-yellow-400 text-xs flex items-center gap-1">
                        <i data-lucide="info" class="w-3 h-3"></i>
                        ໝາຍເຫດ: ພາກເຊົ້າຫ້າມເກີນ 11:59, 12:00 ຂຶ້ນໄປແມ່ນພາກແລງ.
                    </p>
                    <p class="text-red-400 text-[10px] mt-1">* ຫາກຂໍ້ມູນບໍ່ຄົບ (ຂາດ Check-in ຫຼື Check-out) ຈະຖືກໄລ່ເປັນ "ຂາດວຽກ".</p>
                </div>
            </div>
            
            <div class="flex gap-3">
                <button onclick="handleEditAttendance('${recordId}', '${employeeId}', '${date}')" class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                    ບັນທຶກການແກ້ໄຂ
                </button>
                <button onclick="closeModal('editAttendanceModal')" class="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                    ຍົກເລີກ
                </button>
            </div>
        </div>
    `;
    modal.classList.add('active');
    lucide.createIcons();
}

async function handleEditAttendance(recordId, employeeId, date) {
    const checkIn = document.getElementById('editAttCheckIn').value;
    const checkOut = document.getElementById('editAttCheckOut').value;
    const shiftType = document.getElementById('editAttShift').value;

    // Add seconds if not present
    const formatTime = (t) => {
        if (!t) return null;
        return t.split(':').length === 2 ? t + ':00' : t;
    };

    if (checkIn && checkIn > "11:59") {
        showNotification('ຄຳເຕືອນ: ເວລາເຂົ້າວຽກ (ພາກເຊົ້າ) ກາຍ 11:59', 'warning');
    }
    
    if (checkOut && checkOut < "12:00") {
        showNotification('ຄຳເຕືອນ: ເວລາອອກວຽກ ຄວນເປັນພາກແລງ (ຫຼັງ 12:00)', 'warning');
    }

    const data = {
        employeeId,
        date,
        checkIn: formatTime(checkIn),
        checkOut: formatTime(checkOut),
        shiftType
    };

    let result;
    if (recordId && recordId !== 'null' && recordId !== '') {
        result = await callAPI(`/api/attendance/${recordId}`, data, 'PUT');
    } else {
        // If no record exists, we might want to create one
        // For now, let's just show an error if recordId is missing, 
        // or we could implement a POST /api/attendance/manual
        showNotification('ບໍ່ພົບບັນທຶກເດີມ, ບໍ່ສາມາດແກ້ໄຂໄດ້', 'error');
        return;
    }

    if (result.success) {
        showNotification('ແກ້ໄຂເວລາສຳເລັດ!', 'success');
        closeModal('editAttendanceModal');
        await loadAllData();
        renderAttendanceTable();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

function getWorkingHoursNumber(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diff = (end - start) / 1000 / 60 / 60;
    return diff;
}

function calculateWorkingHours(checkIn, checkOut) {
    const hours = getWorkingHoursNumber(checkIn, checkOut);
    if (hours === 0) return '-';
    return `${hours.toFixed(1)} ຊມ`;
}

function filterAttendance() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedDate = document.getElementById('attendanceDateInput')?.value || new Date().toISOString().split('T')[0];
    const todayAttendance = getAttendanceByDate(selectedDate);

    const filtered = todayAttendance.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.empCode.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm)
    );

    // Sort by earliest check-in first
    const sorted = filtered.sort((a, b) => {
        if (a.checkIn && !b.checkIn) return -1;
        if (!a.checkIn && b.checkIn) return 1;
        if (!a.checkIn && !b.checkIn) return 0;
        return a.checkIn.localeCompare(b.checkIn);
    });

    document.getElementById('attendanceTableBody').innerHTML = sorted.map(emp => renderAttendanceRow(emp)).join('');
    lucide.createIcons();
}

// Continue in next file...
