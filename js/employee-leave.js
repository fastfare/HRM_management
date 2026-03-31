// ============ EMPLOYEE LEAVE & PROFILE MODULE ============

// ============ LEAVE TAB ============

function renderLeaveTab() {
  const pending = state.myLeaves.filter(l => l.status === 'pending');
  const approved = state.myLeaves.filter(l => l.status === 'approved');
  const rejected = state.myLeaves.filter(l => l.status === 'rejected');

  return `
    <div class="space-y-4">
      <!-- Leave Balance Card -->
      <div id="leaveBalanceCard" class="glass rounded-2xl p-5 border border-white/20">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-white font-bold flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-5 h-5 text-purple-400"></i>
            ໂຄຕ້າລາພັກ
          </h3>
          <button onclick="refreshLeaveBalance()" class="text-purple-300 text-xs hover:text-white transition">ໂຫຼດໃໝ່</button>
        </div>
        <div class="grid grid-cols-2 gap-3" id="balanceCards">
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p class="text-blue-400 text-xs mb-1">🌴 ລາພັກຜ່ອນ</p>
            <p class="text-white font-bold text-lg" id="empAnnualBal">-/-</p>
            <p class="text-blue-300/60 text-xs">ວັນຄົງເຫຼືອ</p>
          </div>
          <div class="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <p class="text-orange-400 text-xs mb-1">🏥 ລາເຈັບປ່ວຍ</p>
            <p class="text-white font-bold text-lg" id="empSickBal">-/-</p>
            <p class="text-orange-300/60 text-xs">ວັນຄົງເຫຼືອ</p>
          </div>
        </div>
      </div>

      <!-- Request Leave Button -->
      <button onclick="openLeaveRequestModal()" class="touch-btn w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20">
        <i data-lucide="file-plus" class="w-5 h-5"></i>
        ສະເໜີລາພັກ
      </button>

      <!-- Status Summary -->
      <div class="grid grid-cols-3 gap-3">
        <div class="glass rounded-xl p-3 border border-yellow-400/20 text-center">
          <p class="text-yellow-400 text-xl font-bold">${pending.length}</p>
          <p class="text-yellow-300/60 text-xs">ລໍຖ້າ</p>
        </div>
        <div class="glass rounded-xl p-3 border border-green-400/20 text-center">
          <p class="text-green-400 text-xl font-bold">${approved.length}</p>
          <p class="text-green-300/60 text-xs">ອະນຸມັດ</p>
        </div>
        <div class="glass rounded-xl p-3 border border-red-400/20 text-center">
          <p class="text-red-400 text-xl font-bold">${rejected.length}</p>
          <p class="text-red-300/60 text-xs">ປະຕິເສດ</p>
        </div>
      </div>

      <!-- My Leave History -->
      <div>
        <h3 class="text-white font-bold mb-3 flex items-center gap-2">
          <i data-lucide="history" class="w-5 h-5 text-purple-400"></i>
          ປະຫວັດການລາ
        </h3>

        ${state.myLeaves.length === 0 ? `
          <div class="glass rounded-xl p-8 border border-white/20 text-center">
            <i data-lucide="inbox" class="w-12 h-12 text-purple-300/30 mx-auto mb-3"></i>
            <p class="text-purple-300/60">ຍັງບໍ່ມີປະຫວັດການລາ</p>
          </div>
        ` : state.myLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(leave => {
    const typeLabel = { 'annual': '🌴 ລາພັກຜ່ອນ', 'sick': '🏥 ລາເຈັບປ່ວຍ', 'personal': '📋 ລາກິດ' }[leave.leaveType] || leave.leaveType;

    const statusMap = {
      'pending': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'ລໍຖ້າ' },
      'approved': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'ອະນຸມັດ' },
      'rejected': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'ປະຕິເສດ' }
    };
    const st = statusMap[leave.status] || statusMap.pending;

    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const dateStr = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()} - ${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`;

    return `
            <div class="glass rounded-xl p-4 border border-white/20 mb-3">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="text-white font-medium text-sm">${typeLabel}</p>
                  <p class="text-purple-300/60 text-xs mt-0.5">${dateStr} (${leave.days} ວັນ)</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}">${st.label}</span>
              </div>
              ${leave.reason ? `<p class="text-white/60 text-xs mt-1">📝 ${leave.reason}</p>` : ''}
              ${leave.status === 'rejected' && leave.rejectionReason ? `
                <p class="text-red-400/80 text-xs mt-2 bg-red-500/10 rounded-lg p-2">❌ ${leave.rejectionReason}</p>
              ` : ''}
              ${leave.status === 'approved' && leave.approvedAt ? `
                <p class="text-green-400/60 text-xs mt-1">✅ ອະນຸມັດວັນທີ: ${new Date(leave.approvedAt).toLocaleDateString('lo-LA')}</p>
              ` : ''}
              <p class="text-purple-500/40 text-xs mt-1">ສະເໜີວັນທີ: ${new Date(leave.createdAt).toLocaleDateString('lo-LA')}</p>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;
}

// Load balance into the leave tab
async function refreshLeaveBalance() {
  if (!state.user) return;
  try {
    const result = await callAPI(`/api/leave/balance/${state.user.id}`, {}, 'GET');
    if (result.success && result.balance) {
      const ab = document.getElementById('empAnnualBal');
      const sb = document.getElementById('empSickBal');
      if (ab) ab.textContent = `${result.balance.annualRemaining}/${result.balance.annualQuota}`;
      if (sb) sb.textContent = `${result.balance.sickRemaining}/${result.balance.sickQuota}`;
    }
  } catch (e) {
    console.error('Error refreshing balance:', e);
  }
}

// Auto-load balance when leave tab opens
const origRender = window._origRender;
// We'll hook into the render cycle via MutationObserver
const balanceObserver = new MutationObserver(() => {
  if (state.tab === 'leave' && document.getElementById('empAnnualBal')) {
    refreshLeaveBalance();
    balanceObserver.disconnect();
    // Reconnect after brief delay to allow future tab switches
    setTimeout(() => balanceObserver.observe(document.getElementById('app'), { childList: true, subtree: true }), 500);
  }
});
// Start observing after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) balanceObserver.observe(app, { childList: true, subtree: true });
});

// ============ LEAVE REQUEST MODAL ============

function openLeaveRequestModal() {
  const modal = document.getElementById('leaveRequestModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-lg border border-white/10 shadow-2xl mx-4">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-white text-xl font-bold flex items-center gap-2">
          <i data-lucide="file-plus" class="w-6 h-6 text-purple-400"></i>
          ສະເໜີລາພັກ
        </h3>
        <button onclick="closeLeaveRequestModal()" class="text-white/50 hover:text-white transition-colors">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>

      <form id="leaveRequestForm" class="space-y-4">
        <div>
          <label class="text-purple-200 text-sm mb-2 block">ປະເພດການລາ</label>
          <select id="leaveType" required
            class="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            style="color-scheme: dark;">
            <option value="" style="background-color: #1e293b; color: #94a3b8;">ເລືອກປະເພດ...</option>
            <option value="annual" style="background-color: #1e293b; color: white;">🌴 ລາພັກຜ່ອນ (Annual Leave)</option>
            <option value="sick" style="background-color: #1e293b; color: white;">🏥 ລາເຈັບປ່ວຍ (Sick Leave)</option>
            <option value="personal" style="background-color: #1e293b; color: white;">📋 ລາກິດສ່ວນຕົວ (Personal Leave)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-purple-200 text-sm mb-2 block">ວັນທີ່ເລີ່ມ</label>
            <input type="date" id="startDate" required
              class="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style="color-scheme: dark;">
          </div>
          <div>
            <label class="text-purple-200 text-sm mb-2 block">ວັນທີ່ສິ້ນສຸດ</label>
            <input type="date" id="endDate" required
              class="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style="color-scheme: dark;">
          </div>
        </div>

        <div id="leaveDaysDisplay" class="hidden bg-purple-500/20 border border-purple-500/30 rounded-xl p-3">
          <p class="text-purple-300 text-sm text-center">ຈຳນວນ: <span id="leaveDaysCount" class="font-bold text-white text-lg">0</span> ວັນ</p>
        </div>

        <div>
          <label class="text-purple-200 text-sm mb-2 block">ເຫດຜົນ</label>
          <textarea id="leaveReason" rows="3" required placeholder="ກະລຸນາລະບຸເຫດຜົນໃນການລາ..."
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"></textarea>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeLeaveRequestModal()"
            class="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all">
            ຍົກເລີກ
          </button>
          <button type="submit"
            class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <i data-lucide="send" class="w-4 h-4"></i>
            ສົ່ງຄຳຂໍ
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons();

  // Setup form
  const form = document.getElementById('leaveRequestForm');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  const updateDays = () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (days > 0) {
        document.getElementById('leaveDaysCount').textContent = days;
        document.getElementById('leaveDaysDisplay').classList.remove('hidden');
      } else {
        document.getElementById('leaveDaysDisplay').classList.add('hidden');
        endDateInput.value = '';
      }
    }
  };

  startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value;
    updateDays();
  });
  endDateInput.addEventListener('change', updateDays);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitLeaveRequest();
  });
}

async function submitLeaveRequest() {
  const leaveType = document.getElementById('leaveType').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const reason = document.getElementById('leaveReason').value;

  if (!leaveType || !startDate || !endDate || !reason) {
    showToast('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'error');
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) {
    showToast('ວັນທີເລີ່ມຕ້ອງກ່ອນວັນທີສິ້ນສຸດ', 'error');
    return;
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  state.loading = true;
  render();

  const result = await callAPI('/api/leave/request', {
    employeeId: state.user.id,
    leaveType, startDate, endDate, days, reason
  });

  state.loading = false;

  if (result.success) {
    closeLeaveRequestModal();
    showToast('✅ ສົ່ງຄຳຂໍລາສຳເລັດ! ລໍຖ້າການອະນຸມັດ', 'success');
    await loadMyLeaves();
    state.tab = 'leave';
  } else {
    showToast('❌ ' + (result.error || 'ບໍ່ສາມາດສົ່ງຄຳຂໍໄດ້'), 'error');
  }

  render();
}

function closeLeaveRequestModal() {
  const modal = document.getElementById('leaveRequestModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.innerHTML = '';
  }
}

// ============ CHANGE PIN MODAL ============

function openChangePINModal() {
  const modal = document.getElementById('leaveBalanceModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl mx-4">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-white text-lg font-bold flex items-center gap-2">
          <i data-lucide="key" class="w-5 h-5 text-purple-400"></i>
          ປ່ຽນ PIN
        </h3>
        <button onclick="closeChangePINModal()" class="text-white/50 hover:text-white transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="changePinForm" class="space-y-4">
        <div>
          <label class="text-purple-200 text-sm mb-2 block">PIN ປັດຈຸບັນ</label>
          <input type="password" id="currentPin" maxlength="4" placeholder="PIN ເກົ່າ 4 ໂຕ" required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl tracking-widest"
            style="letter-spacing: 0.5em;">
        </div>
        <div>
          <label class="text-purple-200 text-sm mb-2 block">PIN ໃໝ່</label>
          <input type="password" id="newPin" maxlength="4" placeholder="PIN ໃໝ່ 4 ໂຕ" required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl tracking-widest"
            style="letter-spacing: 0.5em;">
        </div>
        <div>
          <label class="text-purple-200 text-sm mb-2 block">ຢືນຢັນ PIN ໃໝ່</label>
          <input type="password" id="confirmPin" maxlength="4" placeholder="ຢືນຢັນ PIN ໃໝ່" required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xl tracking-widest"
            style="letter-spacing: 0.5em;">
        </div>

        <div id="pinError" class="hidden bg-red-500/20 border border-red-500/30 rounded-xl p-3">
          <p class="text-red-400 text-sm text-center" id="pinErrorText"></p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeChangePINModal()"
            class="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all">
            ຍົກເລີກ
          </button>
          <button type="submit"
            class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-all">
            ບັນທຶກ
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons();

  document.getElementById('changePinForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPin = document.getElementById('currentPin').value;
    const newPin = document.getElementById('newPin').value;
    const confirmPin = document.getElementById('confirmPin').value;

    const errorDiv = document.getElementById('pinError');
    const errorText = document.getElementById('pinErrorText');

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      errorText.textContent = 'PIN ຕ້ອງເປັນໂຕເລກ 4 ໂຕ';
      errorDiv.classList.remove('hidden');
      return;
    }

    if (newPin !== confirmPin) {
      errorText.textContent = 'PIN ໃໝ່ບໍ່ກົງກັນ';
      errorDiv.classList.remove('hidden');
      return;
    }

    errorDiv.classList.add('hidden');

    const result = await callAPI(`/api/employees/${state.user.id}/reset-pin`, {
      currentPin,
      newPin
    }, 'POST');

    if (result.success) {
      closeChangePINModal();
      showToast('✅ ປ່ຽນ PIN ສຳເລັດ!', 'success');
    } else {
      errorText.textContent = result.error || 'PIN ປັດຈຸບັນບໍ່ຖືກຕ້ອງ';
      errorDiv.classList.remove('hidden');
    }
  });
}

function closeChangePINModal() {
  const modal = document.getElementById('leaveBalanceModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.innerHTML = '';
  }
}

// ============ EDIT PROFILE MODAL ============

function openEditProfileModal() {
  const modal = document.getElementById('salaryModal');
  if (!modal) return;
  const u = state.user || {};

  modal.innerHTML = `
    <div class="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-lg border border-white/10 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-white text-lg font-bold flex items-center gap-2">
          <i data-lucide="edit-3" class="w-5 h-5 text-purple-400"></i>
          ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວ
        </h3>
        <button onclick="closeEditProfileModal()" class="text-white/50 hover:text-white transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="editProfileForm" class="space-y-4">
        <!-- Editable fields -->
        <div>
          <label class="text-purple-200 text-sm mb-2 block">ຊື່ ແລະ ນາມສະກຸນ</label>
          <input type="text" id="editFullName" value="${u.fullName || u.name || ''}" required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500">
        </div>

        <div>
          <label class="text-purple-200 text-sm mb-2 block">ອີເມວ</label>
          <input type="email" id="editEmail" value="${u.email || ''}" placeholder="example@email.com"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500">
        </div>

        <div>
          <label class="text-purple-200 text-sm mb-2 block">ເບີໂທ</label>
          <input type="tel" id="editPhone" value="${u.phone || ''}" placeholder="020 XXXX XXXX"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500">
        </div>

        <!-- Read-only fields (admin manages these) -->
        <div class="bg-white/5 rounded-xl p-4 space-y-3">
          <p class="text-purple-400/60 text-xs flex items-center gap-1">
            <i data-lucide="lock" class="w-3 h-3"></i>
            ຂໍ້ມູນຕໍ່ໄປນີ້ແກ້ໄຂໂດຍຜູ້ບໍລິຫານເທົ່ານັ້ນ
          </p>
          <div class="flex items-center justify-between py-1">
            <span class="text-purple-300/50 text-sm">ລະຫັດພະນັກງານ</span>
            <span class="text-white/60 text-sm">${u.empCode || '-'}</span>
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-purple-300/50 text-sm">ພະແນກ</span>
            <span class="text-white/60 text-sm">${u.department || u.dept || '-'}</span>
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-purple-300/50 text-sm">ຕຳແໜ່ງ</span>
            <span class="text-white/60 text-sm">${u.position || '-'}</span>
          </div>
        </div>

        <div id="editProfileError" class="hidden bg-red-500/20 border border-red-500/30 rounded-xl p-3">
          <p class="text-red-400 text-sm text-center" id="editProfileErrorText"></p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeEditProfileModal()"
            class="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all">
            ຍົກເລີກ
          </button>
          <button type="submit"
            class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <i data-lucide="check" class="w-4 h-4"></i>
            ບັນທຶກ
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons();

  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('editFullName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const phone = document.getElementById('editPhone').value.trim();

    const errorDiv = document.getElementById('editProfileError');
    const errorText = document.getElementById('editProfileErrorText');

    if (!fullName) {
      errorText.textContent = 'ກະລຸນາໃສ່ຊື່';
      errorDiv.classList.remove('hidden');
      return;
    }

    errorDiv.classList.add('hidden');

    const result = await callAPI(`/api/employees/${state.user.id}`, {
      fullName, email, phone
    }, 'PUT');

    if (result.success) {
      // Update local state
      state.user.fullName = fullName;
      state.user.name = fullName;
      state.user.email = email;
      state.user.phone = phone;
      localStorage.setItem('hrUser', JSON.stringify(state.user));

      closeEditProfileModal();
      showToast('✅ ບັນທຶກຂໍ້ມູນສຳເລັດ!', 'success');
      render();
    } else {
      errorText.textContent = result.error || 'ບໍ່ສາມາດບັນທຶກໄດ້';
      errorDiv.classList.remove('hidden');
    }
  });
}

function closeEditProfileModal() {
  const modal = document.getElementById('salaryModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.innerHTML = '';
  }
}

// ============ TOAST NOTIFICATION ============

function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.getElementById('toastNotification');
  if (existing) existing.remove();

  const colors = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-rose-600',
    info: 'from-purple-500 to-pink-500'
  };

  const toast = document.createElement('div');
  toast.id = 'toastNotification';
  toast.className = `fixed top-4 left-4 right-4 bg-gradient-to-r ${colors[type] || colors.info} text-white px-4 py-3 rounded-xl shadow-2xl z-[100] text-center font-medium text-sm animate-bounce`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Stop bounce after 1s
  setTimeout(() => {
    toast.classList.remove('animate-bounce');
  }, 1000);

  // Remove after 4s
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Legacy function compatibility
function viewLeaveBalance() {
  state.tab = 'leave';
  render();
}

function openSalaryModal() {
  showToast('💰 ໃບຮັບເງິນເດືອນ - ກຳລັງພັດທະນາ', 'info');
}
