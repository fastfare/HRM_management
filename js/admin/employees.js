// ============ EMPLOYEE MANAGEMENT MODULE ============

// Render Employee Management Section
function renderEmployees() {
    const activeEmployees = state.employees.filter(e => e.status === 'active');

    const content = `
        <div class="space-y-4">
            <!-- Header with Actions -->
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-white text-2xl font-bold">ຈັດການພະນັກງານ</h3>
                    <p class="text-white/60 text-sm">ລົງທະບຽນ, ແກ້ໄຂ, ລຶບ ແລະ ຈັດການພະນັກງານ</p>
                </div>
                <button onclick="openRegisterModal()" class="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all">
                    <i data-lucide="user-plus" class="w-5 h-5"></i>
                    ລົງທະບຽນພະນັກງານໃໝ່
                </button>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-4 gap-4 mb-6">
                <div class="bg-[#1a1a2e] rounded-xl p-4 border border-white/10">
                    <p class="text-white/60 text-sm">ພະນັກງານທັງໝົດ</p>
                    <p class="text-white text-3xl font-bold">${activeEmployees.length}</p>
                </div>
                ${Object.entries(activeEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {})).slice(0, 3).map(([dept, count]) => `
                    <div class="bg-[#1a1a2e] rounded-xl p-4 border border-white/10">
                        <p class="text-white/60 text-sm">${dept}</p>
                        <p class="text-white text-3xl font-bold">${count}</p>
                    </div>
                `).join('')}
            </div>
            
            <!-- Employee Table -->
            <div class="bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                <div class="p-4 border-b border-white/10">
                    <div class="flex items-center gap-3">
                        <div class="relative flex-1">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"></i>
                            <input id="empSearchInput" onkeyup="filterEmployees()" placeholder="ຄົ້ນຫາພະນັກງານ..." class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-violet-500" />
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-white/5">
                            <tr>
                                <th class="px-4 py-3 text-left text-white/60 text-sm font-medium">ລະຫັດ</th>
                                <th class="px-4 py-3 text-left text-white/60 text-sm font-medium">ຊື່-ນາມສະກຸນ</th>
                                <th class="px-4 py-3 text-left text-white/60 text-sm font-medium">ພະແນກ</th>
                                <th class="px-4 py-3 text-left text-white/60 text-sm font-medium">ຕຳແໜ່ງ</th>
                                <th class="px-4 py-3 text-left text-white/60 text-sm font-medium">ອີເມລ</th>
                                <th class="px-4 py-3 text-left text-white/60 text-sm font-medium">ເບີໂທ</th>
                                <th class="px-4 py-3 text-center text-white/60 text-sm font-medium">ຈັດການ</th>
                            </tr>
                        </thead>
                        <tbody id="employeeTableBody">
                            ${activeEmployees.map(emp => renderEmployeeRow(emp)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById('contentArea').innerHTML = content;
    lucide.createIcons();
}

function renderEmployeeRow(emp) {
    return `
        <tr class="border-t border-white/10 hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-white">${emp.empCode}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        ${emp.fullName.charAt(0)}
                    </div>
                    <span class="text-white">${emp.fullName}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-white">${emp.department}</td>
            <td class="px-4 py-3 text-white">${emp.position}</td>
            <td class="px-4 py-3 text-white/70 text-sm">${emp.email || '-'}</td>
            <td class="px-4 py-3 text-white/70">${emp.phone || '-'}</td>
            <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="openEditModal('${emp.id}')" class="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors" title="ແກ້ໄຂ">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="openResetPINModal('${emp.id}')" class="p-2 hover:bg-yellow-500/20 rounded-lg text-yellow-400 transition-colors" title="Reset PIN">
                        <i data-lucide="key" class="w-4 h-4"></i>
                    </button>
                    <button onclick="confirmDelete('${emp.id}')" class="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="ລຶບ">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function filterEmployees() {
    const searchTerm = document.getElementById('empSearchInput').value.toLowerCase();
    const activeEmployees = state.employees.filter(e => e.status === 'active');

    const filtered = activeEmployees.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.empCode.toLowerCase().includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm) ||
        (emp.email && emp.email.toLowerCase().includes(searchTerm))
    );

    document.getElementById('employeeTableBody').innerHTML = filtered.map(emp => renderEmployeeRow(emp)).join('');
    lucide.createIcons();
}

// ============ REGISTER MODAL ============

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.innerHTML = `
        <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-2xl border border-white/10 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-white text-xl font-bold flex items-center gap-2">
                    <i data-lucide="user-plus" class="w-6 h-6 text-violet-400"></i>
                    ລົງທະບຽນພະນັກງານໃໝ່
                </h3>
                <button onclick="closeModal('registerModal')" class="text-white/50 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ລະຫັດພະນັກງານ <span class="text-red-400">*</span></label>
                    <input id="regEmpCode" type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">PIN (4 ຕົວເລກ) <span class="text-red-400">*</span></label>
                    <input id="regPin" type="password" maxlength="4" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div class="col-span-2">
                    <label class="text-white/70 text-sm mb-1 block">ຊື່-ນາມສະກຸນ <span class="text-red-400">*</span></label>
                    <input id="regFullName" type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ພະແນກ <span class="text-red-400">*</span></label>
                    <select id="regDepartment" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500">
                        <option value="">-- ເລືອກພະແນກ --</option>
                        <option>IT</option>
                        <option>HR</option>
                        <option>Finance</option>
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>Operations</option>
                        <option>Technician</option>
                    </select>
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ຕຳແໜ່ງ <span class="text-red-400">*</span></label>
                    <select id="regPosition" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500">
                        <option value="">-- ເລືອກຕຳແໜ່ງ --</option>
                        <option>ຜູ້ຈັດການ</option>
                        <option>ພະນັກງານ</option>
                        <option>ຊ່າງ</option>
                        <option>ບັນຊີ</option>
                    </select>
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ອີເມລ</label>
                    <input id="regEmail" type="email" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ເບີໂທ</label>
                    <input id="regPhone" type="tel" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ເງິນເດືອນພື້ນຖານ</label>
                    <input id="regSalary" type="number" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ວັນທີ່ເຂົ້າວຽກ</label>
                    <input id="regHireDate" type="date" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500" />
                </div>
            </div>
            
            <div class="flex gap-3">
                <button onclick="handleRegister()" class="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all">
                    ລົງທະບຽນ
                </button>
                <button onclick="closeModal('registerModal')" class="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                    ຍົກເລີກ
                </button>
            </div>
        </div>
    `;
    modal.classList.add('active');
    lucide.createIcons();
}

async function handleRegister() {
    const empCode = document.getElementById('regEmpCode').value.trim();
    const pin = document.getElementById('regPin').value.trim();
    const fullName = document.getElementById('regFullName').value.trim();
    const department = document.getElementById('regDepartment').value;
    const position = document.getElementById('regPosition').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const baseSalary = parseFloat(document.getElementById('regSalary').value) || 0;
    const hireDate = document.getElementById('regHireDate').value;

    if (!empCode || !pin || !fullName || !department || !position) {
        showNotification('ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ', 'error');
        return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        showNotification('PIN ຕ້ອງເປັນຕົວເລກ 4 ຫຼັກ', 'error');
        return;
    }

    const data = {
        empCode,
        pin,
        fullName,
        department,
        position,
        email,
        phone,
        baseSalary,
        hireDate,
        role: 'employee'
    };

    const result = await callAPI('/api/employees', data, 'POST');

    if (result.success) {
        showNotification('ລົງທະບຽນສຳເລັດ!', 'success');
        closeModal('registerModal');
        await loadAllData();
        renderEmployees();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

// ============ EDIT MODAL ============

function openEditModal(empId) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    state.selectedEmployee = emp;

    const modal = document.getElementById('editModal');
    modal.innerHTML = `
        <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-2xl border border-white/10 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-white text-xl font-bold flex items-center gap-2">
                    <i data-lucide="edit" class="w-6 h-6 text-blue-400"></i>
                    ແກ້ໄຂຂໍ້ມູນ: ${emp.fullName}
                </h3>
                <button onclick="closeModal('editModal')" class="text-white/50 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="col-span-2">
                    <label class="text-white/70 text-sm mb-1 block">ຊື່-ນາມສະກຸນ</label>
                    <input id="editFullName" value="${emp.fullName}" type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ພະແນກ</label>
                    <select id="editDepartment" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500">
                        <option ${emp.department === 'IT' ? 'selected' : ''}>IT</option>
                        <option ${emp.department === 'HR' ? 'selected' : ''}>HR</option>
                        <option ${emp.department === 'Finance' ? 'selected' : ''}>Finance</option>
                        <option ${emp.department === 'Sales' ? 'selected' : ''}>Sales</option>
                        <option ${emp.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                        <option ${emp.department === 'Operations' ? 'selected' : ''}>Operations</option>
                        <option ${emp.department === 'Technician' ? 'selected' : ''}>Technician</option>
                    </select>
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ຕຳແໜ່ງ</label>
                    <select id="editPosition" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500">
                        <option ${emp.position === 'ຜູ້ຈັດການ' ? 'selected' : ''}>ຜູ້ຈັດການ</option>
                        <option ${emp.position === 'ພະນັກງານ' ? 'selected' : ''}>ພະນັກງານ</option>
                        <option ${emp.position === 'ຊ່າງ' ? 'selected' : ''}>ຊ່າງ</option>
                        <option ${emp.position === 'ບັນຊີ' ? 'selected' : ''}>ບັນຊີ</option>
                        ${!['ຜູ້ຈັດການ', 'ພະນັກງານ', 'ຊ່າງ', 'ບັນຊີ'].includes(emp.position) ? `<option selected>${emp.position}</option>` : ''}
                    </select>
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ອີເມລ</label>
                    <input id="editEmail" value="${emp.email || ''}" type="email" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ເບີໂທ</label>
                    <input id="editPhone" value="${emp.phone || ''}" type="tel" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ເງິນເດືອນພື້ນຖານ</label>
                    <input id="editSalary" value="${emp.baseSalary || 0}" type="number" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label class="text-white/70 text-sm mb-1 block">ວັນທີ່ເຂົ້າວຽກ</label>
                    <input id="editHireDate" value="${emp.hireDate || ''}" type="date" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                </div>
            </div>
            
            <div class="flex gap-3">
                <button onclick="handleEdit()" class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                    ບັນທຶກການແກ້ໄຂ
                </button>
                <button onclick="closeModal('editModal')" class="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors">
                    ຍົກເລີກ
                </button>
            </div>
        </div>
    `;
    modal.classList.add('active');
    lucide.createIcons();
}

async function handleEdit() {
    const empId = state.selectedEmployee.id;
    const data = {
        fullName: document.getElementById('editFullName').value.trim(),
        department: document.getElementById('editDepartment').value,
        position: document.getElementById('editPosition').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        baseSalary: parseFloat(document.getElementById('editSalary').value) || 0,
        hireDate: document.getElementById('editHireDate').value
    };

    const result = await callAPI(`/api/employees/${empId}`, data, 'PUT');

    if (result.success) {
        showNotification('ແກ້ໄຂສຳເລັດ!', 'success');
        closeModal('editModal');
        await loadAllData();
        renderEmployees();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

// ============ RESET PIN MODAL ============

function openResetPINModal(empId) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    state.selectedEmployee = emp;

    const modal = document.getElementById('resetPINModal');
    modal.innerHTML = `
        <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-white text-xl font-bold flex items-center gap-2">
                    <i data-lucide="key" class="w-6 h-6 text-yellow-400"></i>
                    Reset PIN
                </h3>
                <button onclick="closeModal('resetPINModal')" class="text-white/50 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="mb-6">
                <div class="bg-white/5 rounded-xl p-4 mb-4">
                    <p class="text-white font-medium">${emp.fullName}</p>
                    <p class="text-white/60 text-sm">${emp.empCode}</p>
                </div>
                
                <label class="text-white/70 text-sm mb-1 block">PIN ໃໝ່ (4 ຕົວເລກ)</label>
                <input id="newPin" type="password" maxlength="4" placeholder="1234" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl focus:outline-none focus:border-yellow-500" />
            </div>
            
            <button onclick="handleResetPIN()" class="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
                Reset PIN
            </button>
        </div>
    `;
    modal.classList.add('active');
    lucide.createIcons();
}

async function handleResetPIN() {
    const newPin = document.getElementById('newPin').value.trim();

    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        showNotification('PIN ຕ້ອງເປັນຕົວເລກ 4 ຫຼັກ', 'error');
        return;
    }

    const empId = state.selectedEmployee.id;

    const result = await callAPI(`/api/employees/${empId}/reset-pin`, { newPin }, 'POST');

    if (result.success) {
        showNotification('Reset PIN ສຳເລັດ!', 'success');
        closeModal('resetPINModal');
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

// ============ DELETE EMPLOYEE ============

async function confirmDelete(empId) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    if (!confirm(`ຢືນຢັນການລຶບພະນັກງານ: ${emp.fullName}?\n\nການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້!`)) {
        return;
    }

    const result = await callAPI(`/api/employees/${empId}`, {}, 'DELETE');

    if (result.success) {
        showNotification('ລຶບສຳເລັດ!', 'success');
        await loadAllData();
        renderEmployees();
    } else {
        showNotification(result.error || 'ເກີດຂໍ້ຜິດພາດ', 'error');
    }
}

// ============ HELPER FUNCTIONS ============

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    state.selectedEmployee = null;
}
