// ===================================
// Code.gs - Main API Backend
// ===================================

// ====== MAIN ENTRY POINT ======
function doPost(e) {
  try {
    // Parse request
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('API Call: ' + action);
    
    // Route to appropriate handler
    let response;
    switch (action) {
      // Authentication
      case 'login':
        response = handleLogin(data);
        break;
      case 'logout':
        response = handleLogout(data);
        break;
      case 'getMe':
        response = handleGetMe(data);
        break;
        
      // Attendance
      case 'checkIn':
        response = handleCheckIn(data);
        break;
      case 'checkOut':
        response = handleCheckOut(data);
        break;
      case 'getTodayAttendance':
        response = handleGetTodayAttendance(data);
        break;
      case 'getAttendanceHistory':
        response = handleGetAttendanceHistory(data);
        break;
        
      // Leave
      case 'requestLeave':
        response = handleRequestLeave(data);
        break;
      case 'getMyLeaveRequests':
        response = handleGetMyLeaveRequests(data);
        break;
      case 'getPendingLeaveRequests':
        response = handleGetPendingLeaveRequests(data);
        break;
      case 'approveLeave':
        response = handleApproveLeave(data);
        break;
      case 'rejectLeave':
        response = handleRejectLeave(data);
        break;
      case 'getLeaveBalance':
        response = handleGetLeaveBalance(data);
        break;
        
      // Payroll
      case 'getMySalary':
        response = handleGetMySalary(data);
        break;
      case 'generatePayroll':
        response = handleGeneratePayroll(data);
        break;
        
      // Admin User Management
      case 'registerEmployee':
        response = handleRegisterEmployee(data);
        break;
      case 'getAllEmployees':
        response = handleGetAllEmployees(data);
        break;
      case 'updateEmployee':
        response = handleUpdateEmployee(data);
        break;
      case 'resetPIN':
        response = handleResetPIN(data);
        break;
      case 'deleteEmployee':
        response = handleDeleteEmployee(data);
        break;
        
      default:
        response = { success: false, error: 'Unknown action: ' + action };
    }
    
    return createResponse(response);
    
  } catch (error) {
    Logger.log('Error: ' + error);
    return createResponse({ success: false, error: error.toString() });
  }
}

function doGet(e) {
  return createResponse({ success: true, message: 'HR Attendance API v1.0' });
}

// ====== RESPONSE HELPER ======
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================
// AUTHENTICATION HANDLERS
// ============================

function handleLogin(data) {
  const { empId, pin } = data;
  
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  
  // Find employee
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[1] === empId && row[8].toString() === pin.toString() && row[11] === 'active') {
      return {
        success: true,
        user: {
          id: row[0],
          empCode: row[1],
          name: row[2],
          email: row[3],
          phone: row[4],
          department: row[5],
          position: row[6],
          role: row[9]
        }
      };
    }
  }
  
  return { success: false, error: 'Invalid employee ID or PIN' };
}

function handleLogout(data) {
  return { success: true, message: 'Logged out' };
}

function handleGetMe(data) {
  // In real app, validate session token
  return { success: true, user: data.user };
}

// ============================
// ATTENDANCE HANDLERS
// ============================

function handleCheckIn(data) {
  const { employeeId, lat, lng } = data;
  
  // Validate GPS
  const gpsCheck = validateGPS(lat, lng);
  if (!gpsCheck.isValid) {
    return { 
      success: false, 
      error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${gpsCheck.distance}m)`,
      distance: gpsCheck.distance
    };
  }
  
  // Check if already checked in today
  const today = getCurrentDate();
  const attendanceSheet = getSheet(CONFIG.SHEETS.ATTENDANCE);
  const rows = attendanceSheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === employeeId && rows[i][2] === today) {
      return { success: false, error: 'ມີການກົດເຂົ້າວຽກແລ້ວ' };
    }
  }
  
  // Insert check-in record
  const timestamp = getCurrentTimestamp();
  const time = timestamp.split(' ')[1];
  const status = time <= CONFIG.LATE_THRESHOLD ? 'on_time' : 'late';
  
  attendanceSheet.appendRow([
    generateUUID(),
    employeeId,
    today,
    time,
    '', // check_out
    lat,
    lng,
    '', // check_out_lat
    '', // check_out_lng
    status,
    0, // work_hours
    '',
    timestamp
  ]);
  
  return { 
    success: true, 
    message: 'ບັນທຶກເຂົ້າວຽກສຳເລັດ',
    time: time,
    status: status,
    distance: gpsCheck.distance
  };
}

function handleCheckOut(data) {
  const { employeeId, lat, lng } = data;
  
  // Validate GPS
  const gpsCheck = validateGPS(lat, lng);
  if (!gpsCheck.isValid) {
    return { 
      success: false, 
      error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${gpsCheck.distance}m)` 
    };
  }
  
  // Find today's attendance record
  const today = getCurrentDate();
  const sheet = getSheet(CONFIG.SHEETS.ATTENDANCE);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === employeeId && rows[i][2] === today) {
      if (rows[i][4]) {
        return { success: false, error: 'ມີການກົດອອກວຽກແລ້ວ' };
      }
      
      const timestamp = getCurrentTimestamp();
      const checkOutTime = timestamp.split(' ')[1];
      const checkInTime = rows[i][3];
      
      // Calculate work hours
      const [inH, inM, inS] = checkInTime.split(':').map(Number);
      const [outH, outM, outS] = checkOutTime.split(':').map(Number);
      const workHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60 - CONFIG.LUNCH_BREAK;
      
      // Update row
      sheet.getRange(i + 1, 5).setValue(checkOutTime); // E: check_out
      sheet.getRange(i + 1, 8).setValue(lat); // H: check_out_lat
      sheet.getRange(i + 1, 9).setValue(lng); // I: check_out_lng
      sheet.getRange(i + 1, 11).setValue(workHours.toFixed(2)); // K: work_hours
      
      return { 
        success: true, 
        message: 'ບັນທຶກອອກວຽກສຳເລັດ',
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours: workHours.toFixed(2)
      };
    }
  }
  
  return { success: false, error: 'ບໍ່ພົບການກົດເຂົ້າວຽກ' };
}

function handleGetTodayAttendance(data) {
  const { employeeId } = data;
  const today = getCurrentDate();
  const sheet = getSheet(CONFIG.SHEETS.ATTENDANCE);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === employeeId && rows[i][2] === today) {
      return {
        success: true,
        attendance: {
          date: rows[i][2],
          checkIn: rows[i][3],
          checkOut: rows[i][4],
          status: rows[i][9],
          workHours: rows[i][10]
        }
      };
    }
  }
  
  return { success: true, attendance: null };
}

function handleGetAttendanceHistory(data) {
  const { employeeId, limit = 30 } = data;
  const sheet = getSheet(CONFIG.SHEETS.ATTENDANCE);
  const rows = sheet.getDataRange().getValues();
  
  const history = [];
  for (let i = rows.length - 1; i >= 1 && history.length < limit; i--) {
    if (rows[i][1] === employeeId) {
      history.push({
        date: rows[i][2],
        checkIn: rows[i][3],
        checkOut: rows[i][4],
        status: rows[i][9],
        workHours: rows[i][10]
      });
    }
  }
  
  return { success: true, history: history };
}

// ============================
// LEAVE HANDLERS
// ============================

function handleRequestLeave(data) {
  const { employeeId, leaveType, startDate, endDate, reason } = data;
  
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_REQUESTS);
  const id = generateUUID();
  const timestamp = getCurrentTimestamp();
  
  // Calculate days (simple version - should use NETWORKDAYS)
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  sheet.appendRow([
    id,
    employeeId,
    leaveType,
    startDate,
    endDate,
    days,
    reason,
    'pending',
    '', // approved_by
    '', // approved_at
    '', // rejection_reason
    timestamp
  ]);
  
  return { success: true, message: 'ສົ່ງຄຳຂໍລາສຳເລັດ', requestId: id };
}

function handleGetMyLeaveRequests(data) {
  const { employeeId } = data;
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_REQUESTS);
  const rows = sheet.getDataRange().getValues();
  
  const requests = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === employeeId) {
      requests.push({
        id: rows[i][0],
        leaveType: rows[i][2],
        startDate: rows[i][3],
        endDate: rows[i][4],
        days: rows[i][5],
        reason: rows[i][6],
        status: rows[i][7],
        createdAt: rows[i][11]
      });
    }
  }
  
  return { success: true, requests: requests };
}

function handleGetLeaveBalance(data) {
  const { employeeId } = data;
  const year = new Date().getFullYear();
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_BALANCES);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === employeeId && rows[i][2] === year) {
      return {
        success: true,
        balance: {
          annualQuota: rows[i][3],
          annualUsed: rows[i][4],
          annualRemaining: rows[i][5],
          sickQuota: rows[i][6],
          sickUsed: rows[i][7],
          sickRemaining: rows[i][8]
        }
      };
    }
  }
  
  // Create new balance if not exists
  sheet.appendRow([
    generateUUID(),
    employeeId,
    year,
    CONFIG.ANNUAL_LEAVE_QUOTA,
    0,
    CONFIG.ANNUAL_LEAVE_QUOTA,
    CONFIG.SICK_LEAVE_QUOTA,
    0,
    CONFIG.SICK_LEAVE_QUOTA,
    getCurrentTimestamp()
  ]);
  
  return {
    success: true,
    balance: {
      annualQuota: CONFIG.ANNUAL_LEAVE_QUOTA,
      annualUsed: 0,
      annualRemaining: CONFIG.ANNUAL_LEAVE_QUOTA,
      sickQuota: CONFIG.SICK_LEAVE_QUOTA,
      sickUsed: 0,
      sickRemaining: CONFIG.SICK_LEAVE_QUOTA
    }
  };
}

// Admin-only handlers
function handleGetPendingLeaveRequests(data) {
  // TODO: Verify admin role
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_REQUESTS);
  const rows = sheet.getDataRange().getValues();
  
  const pending = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][7] === 'pending') {
      pending.push({
        id: rows[i][0],
        employeeId: rows[i][1],
        leaveType: rows[i][2],
        startDate: rows[i][3],
        endDate: rows[i][4],
        days: rows[i][5],
        reason: rows[i][6],
        createdAt: rows[i][11]
      });
    }
  }
  
  return { success: true, pending: pending };
}

function handleApproveLeave(data) {
  const { requestId, approvedBy } = data;
  
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_REQUESTS);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === requestId) {
      sheet.getRange(i + 1, 8).setValue('approved');
      sheet.getRange(i + 1, 9).setValue(approvedBy);
      sheet.getRange(i + 1, 10).setValue(getCurrentTimestamp());
      
      return { success: true, message: 'ອະນຸມັດການລາສຳເລັດ' };
    }
  }
  
  return { success: false, error: 'Request not found' };
}

function handleRejectLeave(data) {
  const { requestId, approvedBy, reason } = data;
  
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_REQUESTS);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === requestId) {
      sheet.getRange(i + 1, 8).setValue('rejected');
      sheet.getRange(i + 1, 9).setValue(approvedBy);
      sheet.getRange(i + 1, 10).setValue(getCurrentTimestamp());
      sheet.getRange(i + 1, 11).setValue(reason);
      
      return { success: true, message: 'ປະຕິເສດການລາສຳເລັດ' };
    }
  }
  
  return { success: false, error: 'Request not found' };
}

// ============================
// PAYROLL HANDLERS
// ============================

function handleGetMySalary(data) {
  const { employeeId, month } = data;
  const sheet = getSheet(CONFIG.SHEETS.PAYROLL);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === employeeId && rows[i][2] === month) {
      return {
        success: true,
        payroll: {
          month: rows[i][2],
          baseSalary: rows[i][3],
          allowance: rows[i][4],
          otHours: rows[i][5],
          otAmount: rows[i][6],
          bonus: rows[i][7],
          tax: rows[i][8],
          socialSecurity: rows[i][9],
          otherDeductions: rows[i][10],
          netSalary: rows[i][11],
          status: rows[i][13]
        }
      };
    }
  }
  
  return { success: false, error: 'Payroll not found for this month' };
}

function handleGeneratePayroll(data) {
  // Admin only - Generate payroll for all employees
  // This is a complex function that would:
  // 1. Get all active employees
  // 2. Calculate attendance-based deductions
  // 3. Calculate OT hours from attendance
  // 4. Apply tax and social security
  // 5. Insert into payroll sheet
  
  return { success: true, message: 'Payroll generation not yet implemented' };
}

// ============================
// ADMIN USER MANAGEMENT
// ============================

function handleRegisterEmployee(data) {
  // Verify admin role
  if (!isAdmin(data.currentUserId)) {
    return { success: false, error: 'Unauthorized - Admin only' };
  }
  
  const { empCode, fullName, email, phone, departmentId, position, baseSalary, pin, role } = data;
  
  // Validate inputs
  if (!empCode || !fullName || !pin) {
    return { success: false, error: 'Required fields missing' };
  }
  
  // Check duplicate emp_code
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === empCode) {
      return { success: false, error: 'Employee code already exists' };
    }
  }
  
  // Validate PIN (4 digits)
  if (!/^\d{4}$/.test(pin.toString())) {
    return { success: false, error: 'PIN must be 4 digits' };
  }
  
  // Insert new employee
  const id = generateUUID();
  const timestamp = getCurrentTimestamp();
  
  sheet.appendRow([
    id,
    empCode,
    fullName,
    email || '',
    phone || '',
    departmentId || '',
    position || '',
    baseSalary || 0,
    pin,
    role || 'user',
    getCurrentDate(),
    'active',
    timestamp,
    timestamp
  ]);
  
  // Create leave balance for new employee
  createLeaveBalance(id);
  
  return { 
    success: true, 
    message: 'Employee registered successfully',
    employeeId: id
  };
}

function handleGetAllEmployees(data) {
  // Admin only
  if (!isAdmin(data.currentUserId)) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  
  const employees = [];
  for (let i = 1; i < rows.length; i++) {
    employees.push({
      id: rows[i][0],
      empCode: rows[i][1],
      fullName: rows[i][2],
      email: rows[i][3],
      phone: rows[i][4],
      departmentId: rows[i][5],
      position: rows[i][6],
      baseSalary: rows[i][7],
      role: rows[i][9],
      hireDate: rows[i][10],
      status: rows[i][11]
    });
  }
  
  return { success: true, employees: employees };
}

function handleUpdateEmployee(data) {
  if (!isAdmin(data.currentUserId)) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const { employeeId, fullName, email, phone, position, baseSalary, role, status } = data;
  
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === employeeId) {
      // Update fields
      if (fullName) sheet.getRange(i + 1, 3).setValue(fullName);
      if (email !== undefined) sheet.getRange(i + 1, 4).setValue(email);
      if (phone !== undefined) sheet.getRange(i + 1, 5).setValue(phone);
      if (position !== undefined) sheet.getRange(i + 1, 7).setValue(position);
      if (baseSalary !== undefined) sheet.getRange(i + 1, 8).setValue(baseSalary);
      if (role) sheet.getRange(i + 1, 10).setValue(role);
      if (status) sheet.getRange(i + 1, 12).setValue(status);
      
      // Update timestamp
      sheet.getRange(i + 1, 14).setValue(getCurrentTimestamp());
      
      return { success: true, message: 'Employee updated successfully' };
    }
  }
  
  return { success: false, error: 'Employee not found' };
}

function handleResetPIN(data) {
  if (!isAdmin(data.currentUserId)) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const { employeeId, newPIN } = data;
  
  // Validate PIN
  if (!newPIN || !/^\d{4}$/.test(newPIN.toString())) {
    return { success: false, error: 'PIN must be 4 digits' };
  }
  
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === employeeId) {
      // Update PIN
      sheet.getRange(i + 1, 9).setValue(newPIN);
      sheet.getRange(i + 1, 14).setValue(getCurrentTimestamp());
      
      return { 
        success: true, 
        message: 'PIN reset successfully',
        newPIN: newPIN,
        employeeName: rows[i][2]
      };
    }
  }
  
  return { success: false, error: 'Employee not found' };
}

function handleDeleteEmployee(data) {
  if (!isAdmin(data.currentUserId)) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const { employeeId } = data;
  
  // Soft delete: set status to 'inactive'
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === employeeId) {
      sheet.getRange(i + 1, 12).setValue('inactive');
      sheet.getRange(i + 1, 14).setValue(getCurrentTimestamp());
      return { success: true, message: 'Employee deactivated successfully' };
    }
  }
  
  return { success: false, error: 'Employee not found' };
}

// Helper: Check if user is admin
function isAdmin(userId) {
  const sheet = getSheet(CONFIG.SHEETS.EMPLOYEES);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId && rows[i][11] === 'active') {
      return rows[i][9] === 'admin';
    }
  }
  return false;
}

// Helper: Create initial leave balance
function createLeaveBalance(employeeId) {
  const sheet = getSheet(CONFIG.SHEETS.LEAVE_BALANCES);
  const year = new Date().getFullYear();
  
  sheet.appendRow([
    generateUUID(),
    employeeId,
    year,
    CONFIG.ANNUAL_LEAVE_QUOTA,
    0,
    CONFIG.ANNUAL_LEAVE_QUOTA,
    CONFIG.SICK_LEAVE_QUOTA,
    0,
    CONFIG.SICK_LEAVE_QUOTA,
    getCurrentTimestamp()
  ]);
}
