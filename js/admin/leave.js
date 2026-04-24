// ============ LEAVE MANAGEMENT MODULE ============

// Leave state
let leaveState = {
    activeTab: 'pending',
    searchQuery: '',
    selectedEmployee: null,
    historyFilter: 'all',
    selectedType: 'all'
};

// ============ MAIN RENDER (redirects to pending) ============

function renderLeaves() {
    renderLeavePending();
}

// ============ 1. ສະເໜີລາພັກ (Submit Leave Request) ============

function renderLeaveRequestForm() {
    const activeEmployees = state.employees.filter(e => e.status !== 'inactive');

    const content = `
        <div class="max-w-2xl mx-auto space-y-6">
            <!-- Header -->
            <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="file-plus" class="w-8 h-8 text-white"></i>
                </div>
                <h2 class="text-white text-2xl font-bold">ສະເໜີລາພັກ</h2>
                <p class="text-white/60 text-sm mt-1">ກະລຸນາເລືອກພະນັກງານແລະປ້ອນຂໍ້ມູນ</p>
            </div>

            <!-- Form -->
            <div class="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10 space-y-5">
                <!-- Employee Selection -->
                <div>
                    <label class="block text-white/70 text-sm font-medium mb-2">ເລືອກພະນັກງານ</label>
                    <select id="leaveEmpId" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" onchange="onLeaveEmployeeChange(this.value)">
                        <option value="">-- ເລືອກພະນັກງານ --</option>
                        ${activeEmployees.map(emp => `
                            <option value="${emp.id}">${emp.fullName} (${emp.empCode}) - ${emp.department}</option>
                        `).join('')}
                    </select>
                </div>

                <!-- Leave Balance Preview -->
                <div id="leaveBalancePreview" class="hidden">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <p class="text-blue-400 text-xs mb-1">ລາພັກຜ່ອນ</p>
                            <p class="text-white font-bold text-lg" id="annualBalanceText">-</p>
                        </div>
                        <div class="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                            <p class="text-orange-400 text-xs mb-1">ລາເຈັບປ່ວຍ</p>
                            <p class="text-white font-bold text-lg" id="sickBalanceText">-</p>
                        </div>
                    </div>
                </div>

                <!-- Leave Type -->
                <div>
                    <label class="block text-white/70 text-sm font-medium mb-2">ປະເພດການລາ</label>
                    <select id="leaveType" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                        <option value="annual">ລາພັກຜ່ອນ</option>
                        <option value="sick">ລາເຈັບປ່ວຍ</option>
                        <option value="personal">ລາກິດສ່ວນຕົວ</option>
                    </select>
                </div>

                <!-- Dates -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-white/70 text-sm font-medium mb-2">ເລີ່ມວັນທີ</label>
                        <input type="date" id="leaveStartDate" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
                    </div>
                    <div>
                        <label class="block text-white/70 text-sm font-medium mb-2">ຮອດວັນທີ</label>
                        <input type="date" id="leaveEndDate" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors" />
                    </div>
                </div>

                <!-- Reason -->
                <div>
                    <label class="block text-white/70 text-sm font-medium mb-2">ເຫດຜົນ</label>
                    <textarea id="leaveReason" rows="3" placeholder="ລະບຸເຫດຜົນການລາ..." class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors resize-none"></textarea>
                </div>

                <!-- Submit Button -->
                <button onclick="submitAdminLeaveRequest()" class="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all">
                    <i data-lucide="send" class="w-5 h-5"></i>
                    ສົ່ງຄຳຂໍລາ
                </button>
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

async function onLeaveEmployeeChange(empId) {
    const preview = document.getElementById('leaveBalancePreview');
    if (!empId) {
        preview.classList.add('hidden');
        return;
    }

    try {
        const result = await callAPI(`/api/leave/balance/${empId}`, {}, 'GET');
        if (result.success && result.balance) {
            document.getElementById('annualBalanceText').textContent = `${result.balance.annualRemaining}/${result.balance.annualQuota} ວັນ`;
            document.getElementById('sickBalanceText').textContent = `${result.balance.sickRemaining}/${result.balance.sickQuota} ວັນ`;
            preview.classList.remove('hidden');
        }
    } catch (e) {
        console.error('Error loading balance:', e);
    }
}

async function submitAdminLeaveRequest() {
    const employeeId = document.getElementById('leaveEmpId').value;
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;

    if (!employeeId || !startDate || !endDate) {
        showNotification('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ', 'error');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showNotification('ວັນທີເລີ່ມຕ້ອງກ່ອນວັນທີສິ້ນສຸດ', 'error');
        return;
    }

    const result = await callAPI('/api/leave/request', {
        employeeId, leaveType, startDate, endDate, reason
    }, 'POST');

    if (result.success) {
        showNotification('ສົ່ງຄຳຂໍລາສຳເລັດ!', 'success');
        await loadAllData();
        renderLeaveRequestForm();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

// ============ 2. ລໍຖ້າອະນຸມັດ (Pending Approvals) ============

function renderLeavePending() {
    const pendingLeaves = state.leaveRequests.filter(r => r.status === 'pending');

    const content = `
        <div class="space-y-6">
            <!-- Header Stats -->
            <div class="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-80">ຄຳຂໍລາທີ່ລໍຖ້າອະນຸມັດ</p>
                    <p class="text-4xl font-bold mt-1">${pendingLeaves.length}</p>
                    <p class="text-sm opacity-80 mt-1">ຄຳຂໍ</p>
                </div>
                <i data-lucide="clock" class="w-16 h-16 opacity-30"></i>
            </div>

            <!-- Search -->
            <div class="bg-[#1a1a2e] rounded-2xl p-4 border border-white/10">
                <div class="relative">
                    <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40"></i>
                    <input 
                        type="text" 
                        placeholder="ຄົ້ນຫາຕາມຊື່ພະນັກງານ..."
                        class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                        oninput="handlePendingSearch(this.value)"
                    />
                </div>
            </div>

            <!-- Pending List -->
            <div id="pendingListContainer">
                ${renderPendingList(pendingLeaves)}
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function handlePendingSearch(query) {
    const q = query.toLowerCase();
    let pendingLeaves = state.leaveRequests.filter(r => r.status === 'pending');
    if (q) {
        pendingLeaves = pendingLeaves.filter(leave => {
            const emp = state.employees.find(e => e.id === leave.employeeId);
            return emp?.fullName.toLowerCase().includes(q);
        });
    }
    document.getElementById('pendingListContainer').innerHTML = renderPendingList(pendingLeaves);
    lucide.createIcons();
}

function renderPendingList(leaves) {
    if (leaves.length === 0) {
        return `
            <div class="bg-[#1a1a2e] rounded-2xl p-12 border border-white/10 text-center">
                <i data-lucide="check-circle-2" class="w-16 h-16 text-green-400/30 mx-auto mb-4"></i>
                <p class="text-white/60 text-lg">ບໍ່ມີຄຳຂໍລາລໍຖ້າອະນຸມັດ</p>
                <p class="text-white/40 text-sm mt-1">ຄຳຂໍທັງໝົດໄດ້ຮັບການດຳເນີນການແລ້ວ</p>
            </div>
        `;
    }

    const sorted = leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return `
        <div class="grid grid-cols-2 gap-4">
            ${sorted.map(leave => renderLeaveCard(leave)).join('')}
        </div>
    `;
}

// ============ 3. ປະຫວັດການລາພັກ (Full Leave History) ============

function renderLeaveHistory() {
    const allLeaves = state.leaveRequests;
    const approved = allLeaves.filter(r => r.status === 'approved');
    const rejected = allLeaves.filter(r => r.status === 'rejected');
    const pending = allLeaves.filter(r => r.status === 'pending');

    const totalApprovedDays = approved.reduce((sum, l) => sum + (l.days || 0), 0);
    const totalRejectedDays = rejected.reduce((sum, l) => sum + (l.days || 0), 0);

    // Get leave breakdown by type
    const typeBreakdown = {};
    allLeaves.forEach(l => {
        const typeName = { 'annual': 'ລາພັກຜ່ອນ', 'sick': 'ລາເຈັບປ່ວຍ', 'personal': 'ລາກິດ' }[l.leaveType] || l.leaveType;
        if (!typeBreakdown[typeName]) typeBreakdown[typeName] = { total: 0, approved: 0, rejected: 0, pending: 0 };
        typeBreakdown[typeName].total++;
        typeBreakdown[typeName][l.status]++;
    });

    const content = `
        <div class="space-y-6">
            <!-- Summary Stats -->
            <div class="grid grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="calendar" class="w-5 h-5 opacity-80"></i>
                        <p class="text-sm opacity-80">ທັງໝົດ</p>
                    </div>
                    <p class="text-3xl font-bold">${allLeaves.length}</p>
                    <p class="text-xs opacity-70 mt-1">ລາຍການ</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="check-circle" class="w-5 h-5 opacity-80"></i>
                        <p class="text-sm opacity-80">ອະນຸມັດ</p>
                    </div>
                    <p class="text-3xl font-bold">${approved.length}</p>
                    <p class="text-xs opacity-70 mt-1">${totalApprovedDays} ວັນລວມ</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="x-circle" class="w-5 h-5 opacity-80"></i>
                        <p class="text-sm opacity-80">ປະຕິເສດ</p>
                    </div>
                    <p class="text-3xl font-bold">${rejected.length}</p>
                    <p class="text-xs opacity-70 mt-1">${totalRejectedDays} ວັນລວມ</p>
                </div>
                <div class="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-5 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="clock" class="w-5 h-5 opacity-80"></i>
                        <p class="text-sm opacity-80">ລໍຖ້າ</p>
                    </div>
                    <p class="text-3xl font-bold">${pending.length}</p>
                    <p class="text-xs opacity-70 mt-1">ລາຍການ</p>
                </div>
            </div>

            <!-- Type Breakdown -->
            <div class="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
                <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                    <i data-lucide="pie-chart" class="w-5 h-5 text-violet-400"></i>
                    ສະຫຼຸບຕາມປະເພດ
                </h3>
                <div class="grid grid-cols-3 gap-4">
                    ${Object.entries(typeBreakdown).map(([type, data]) => `
                        <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p class="text-white font-semibold mb-2">${type}</p>
                            <div class="flex items-center gap-3 text-sm">
                                <span class="text-white/60">ທັງໝົດ: <span class="text-white font-bold">${data.total}</span></span>
                                <span class="text-green-400">${data.approved} ອະນຸມັດ</span>
                                <span class="text-red-400">${data.rejected} ປະຕິເສດ</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-[#1a1a2e] rounded-2xl p-4 border border-white/10">
                <div class="flex items-center gap-3 flex-wrap">
                    <div class="flex-1 relative">
                        <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40"></i>
                        <input 
                            type="text" 
                            placeholder="ຄົ້ນຫາຕາມຊື່..." 
                            class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                            oninput="handleHistorySearch(this.value)"
                        />
                    </div>
                    <select onchange="handleHistoryFilter(this.value)" class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                        <option value="all">ທັງໝົດ</option>
                        <option value="approved">ອະນຸມັດແລ້ວ</option>
                        <option value="rejected">ປະຕິເສດແລ້ວ</option>
                        <option value="pending">ລໍຖ້າ</option>
                    </select>
                    <select onchange="handleHistoryTypeFilter(this.value)" class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
                        <option value="all">ທຸກປະເພດ</option>
                        <option value="annual">ລາພັກຜ່ອນ</option>
                        <option value="sick">ລາເຈັບປ່ວຍ</option>
                        <option value="personal">ລາກິດ</option>
                    </select>
                </div>
            </div>

            <!-- History Table -->
            <div class="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-white/5 border-b border-white/10">
                            <tr>
                                <th class="px-4 py-3 text-white/60 font-medium">ພະນັກງານ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ພະແນກ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ປະເພດ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ວັນທີ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ຈຳນວນມື້</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ເຫດຜົນ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ສະຖານະ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ຜູ້ອະນຸມັດ</th>
                                <th class="px-4 py-3 text-white/60 font-medium">ວັນທີອະນຸມັດ</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody">
                            ${renderHistoryRows(allLeaves)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function renderHistoryRows(leaves) {
    const sorted = leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (sorted.length === 0) {
        return `<tr><td colspan="9" class="px-4 py-12 text-center text-white/40">ບໍ່ມີຂໍ້ມູນ</td></tr>`;
    }

    return sorted.map(leave => {
        const emp = state.employees.find(e => e.id === leave.employeeId);
        const approver = leave.approvedBy ? state.employees.find(e => e.id === leave.approvedBy) : null;

        const typeLabel = { 'annual': 'ລາພັກຜ່ອນ', 'sick': 'ລາເຈັບປ່ວຍ', 'personal': 'ລາກິດ' }[leave.leaveType] || leave.leaveType;

        const statusBadge = {
            'pending': '<span class="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">ລໍຖ້າ</span>',
            'approved': '<span class="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">ອະນຸມັດ</span>',
            'rejected': '<span class="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">ປະຕິເສດ</span>'
        }[leave.status] || '';

        return `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center text-violet-300 text-xs font-bold">
                            ${emp?.fullName?.charAt(0) || '?'}
                        </div>
                        <span class="text-white font-medium">${emp?.fullName || 'Unknown'}</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-white/60">${emp?.department || '-'}</td>
                <td class="px-4 py-3 text-white/80">${typeLabel}</td>
                <td class="px-4 py-3 text-white/80">${formatDateShort(leave.startDate)} - ${formatDateShort(leave.endDate)}</td>
                <td class="px-4 py-3 text-white font-bold text-center">${leave.days}</td>
                <td class="px-4 py-3 text-white/60 max-w-[150px] truncate" title="${leave.reason || ''}">${leave.reason || '-'}</td>
                <td class="px-4 py-3">${statusBadge}</td>
                <td class="px-4 py-3 text-white/60">${approver?.fullName || '-'}</td>
                <td class="px-4 py-3 text-white/60">${leave.approvedAt ? formatDateShort(leave.approvedAt) : '-'}</td>
            </tr>
        `;
    }).join('');
}

// History filter handlers
function handleHistorySearch(query) {
    leaveState.searchQuery = query.toLowerCase();
    refreshHistoryTable();
}

function handleHistoryFilter(status) {
    leaveState.historyFilter = status;
    refreshHistoryTable();
}

function handleHistoryTypeFilter(type) {
    leaveState.selectedType = type;
    refreshHistoryTable();
}

function refreshHistoryTable() {
    let leaves = [...state.leaveRequests];

    if (leaveState.historyFilter && leaveState.historyFilter !== 'all') {
        leaves = leaves.filter(l => l.status === leaveState.historyFilter);
    }

    if (leaveState.selectedType && leaveState.selectedType !== 'all') {
        leaves = leaves.filter(l => l.leaveType === leaveState.selectedType);
    }

    if (leaveState.searchQuery) {
        leaves = leaves.filter(leave => {
            const emp = state.employees.find(e => e.id === leave.employeeId);
            return emp?.fullName.toLowerCase().includes(leaveState.searchQuery);
        });
    }

    const tbody = document.getElementById('historyTableBody');
    if (tbody) {
        tbody.innerHTML = renderHistoryRows(leaves);
    }
}

// ============ RENDER LEAVE CARD ============

function renderLeaveCard(leave) {
    const emp = state.employees.find(e => e.id === leave.employeeId);
    const approver = leave.approvedBy ? state.employees.find(e => e.id === leave.approvedBy) : null;

    const leaveTypeLabel = {
        'annual': 'ລາພັກຜ່ອນ',
        'sick': 'ລາເຈັບປ່ວຍ',
        'personal': 'ລາກິດ'
    }[leave.leaveType] || leave.leaveType;

    const statusBadge = {
        'pending': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: 'clock', label: 'ລໍຖ້າອະນຸມັດ' },
        'approved': { bg: 'bg-green-500/20', text: 'text-green-400', icon: 'check-circle', label: 'ອະນຸມັດແລ້ວ' },
        'rejected': { bg: 'bg-red-500/20', text: 'text-red-400', icon: 'x-circle', label: 'ປະຕິເສດແລ້ວ' }
    }[leave.status];

    return `
        <div class="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10 hover:border-violet-500/30 transition-all">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        ${emp?.fullName.charAt(0) || '?'}
                    </div>
                    <div>
                        <p class="text-white font-semibold">${emp?.fullName || 'Unknown'}</p>
                        <p class="text-white/50 text-sm">${emp?.department || '-'}</p>
                    </div>
                </div>
                <span class="px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1.5">
                    <i data-lucide="${statusBadge.icon}" class="w-3.5 h-3.5"></i>
                    ${statusBadge.label}
                </span>
            </div>

            <!-- Leave Info -->
            <div class="space-y-3 mb-4">
                <div class="flex items-center gap-2 text-sm">
                    <i data-lucide="tag" class="w-4 h-4 text-violet-400"></i>
                    <span class="text-white/60">ປະເພດ:</span>
                    <span class="text-white font-medium">${leaveTypeLabel}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <i data-lucide="calendar" class="w-4 h-4 text-violet-400"></i>
                    <span class="text-white/60">ວັນທີ່:</span>
                    <span class="text-white">${formatDateShort(leave.startDate)} - ${formatDateShort(leave.endDate)}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                    <i data-lucide="hash" class="w-4 h-4 text-violet-400"></i>
                    <span class="text-white/60">ຈຳນວນ:</span>
                    <span class="text-white font-bold">${leave.days} ວັນ</span>
                </div>
                ${leave.reason ? `
                    <div class="flex items-start gap-2 text-sm">
                        <i data-lucide="message-square" class="w-4 h-4 text-violet-400 mt-0.5"></i>
                        <div class="flex-1">
                            <span class="text-white/60">ເຫດຜົນ:</span>
                            <p class="text-white/80 mt-1">${leave.reason}</p>
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Leave Balance -->
            ${renderLeaveBalance(leave)}

            <!-- Approval Info -->
            ${leave.status !== 'pending' ? `
                <div class="pt-4 border-t border-white/10">
                    <div class="flex items-center gap-2 text-sm text-white/60">
                        <i data-lucide="user-check" class="w-4 h-4"></i>
                        <span>${leave.status === 'approved' ? 'ອະນຸມັດໂດຍ' : 'ປະຕິເສດໂດຍ'}:</span>
                        <span class="text-white">${approver?.fullName || 'Unknown'}</span>
                    </div>
                    ${leave.approvedAt ? `
                        <div class="flex items-center gap-2 text-sm text-white/50 mt-1">
                            <i data-lucide="calendar-check" class="w-4 h-4"></i>
                            <span>ວັນທີ: ${formatDateShort(leave.approvedAt)}</span>
                        </div>
                    ` : ''}
                    ${leave.status === 'rejected' && leave.rejectionReason ? `
                        <p class="text-red-400 text-sm mt-2">📝 ${leave.rejectionReason}</p>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Action Buttons -->
            ${leave.status === 'pending' ? `
                <div class="flex gap-3 mt-4 pt-4 border-t border-white/10">
                    <button 
                        onclick="approveLeave('${leave.id}')" 
                        class="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/30 transition-all"
                    >
                        <i data-lucide="check" class="w-5 h-5"></i>
                        ອະນຸມັດ
                    </button>
                    <button 
                        onclick="rejectLeave('${leave.id}')" 
                        class="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all"
                    >
                        <i data-lucide="x" class="w-5 h-5"></i>
                        ປະຕິເສດ
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// ============ RENDER LEAVE BALANCE ============

function renderLeaveBalance(leave) {
    const leaveBalance = leave.leaveBalance;
    if (!leaveBalance) return '';

    const balanceMapping = {
        'annual': {
            quota: leaveBalance.annualQuota,
            used: leaveBalance.annualUsed,
            remaining: leaveBalance.annualRemaining,
            label: 'ລາພັກຜ່ອນ'
        },
        'sick': {
            quota: leaveBalance.sickQuota,
            used: leaveBalance.sickUsed,
            remaining: leaveBalance.sickRemaining,
            label: 'ລາເຈັບປ່ວຍ'
        }
    };

    const currentBalance = balanceMapping[leave.leaveType];
    if (!currentBalance) return '';

    const percentage = (currentBalance.remaining / currentBalance.quota) * 100;
    const barColor = percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500';

    return `
        <div class="bg-white/5 rounded-xl p-3 border border-white/10">
            <div class="flex items-center justify-between mb-2">
                <span class="text-white/60 text-xs">${currentBalance.label} - ຍອດຄົງເຫຼືອ</span>
                <span class="text-white font-bold text-sm">${currentBalance.remaining}/${currentBalance.quota} ວັນ</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="${barColor} h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// ============ HELPER FUNCTIONS ============

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// ============ LEAVE ACTIONS ============

async function approveLeave(leaveId) {
    if (!confirm('ຢືນຢັນການອະນຸມັດການລາ?')) return;

    const result = await callAPI('/api/leave/approve', {
        leaveId,
        approvedBy: state.user.id
    }, 'POST');

    if (result.success) {
        showNotification('ອະນຸມັດສຳເລັດ!', 'success');
        await loadAllData();
        renderCurrentMenu();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

async function rejectLeave(leaveId) {
    const reason = prompt('ກະລຸນາລະບຸເຫດຜົນໃນການປະຕິເສດ:');
    if (!reason) return;

    const result = await callAPI('/api/leave/reject', {
        leaveId,
        approvedBy: state.user.id,
        reason
    }, 'POST');

    if (result.success) {
        showNotification('ປະຕິເສດສຳເລັດ', 'success');
        await loadAllData();
        renderCurrentMenu();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}
