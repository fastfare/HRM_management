// ====================================
// HR Management System - Backend API v2
// Google Apps Script (CORS Fixed)
// ====================================

// ⚠️ ສຳຄັນ: ປ່ຽນ SPREADSHEET_ID ເປັນຂອງທ່ານ
const SPREADSHEET_ID = '1W06LSdqJcCCwMPeM-0b3wXvKprMdMBRcqne8Fc3Mkd4';

const SHEETS = {
  employees: 'employees',
  departments: 'departments', 
  attendance: 'attendance',
  leave_requests: 'leave_requests',
  leave_balances: 'leave_balances',
  payroll: 'payroll',
  config: 'config'
};

// GPS Config (ປ່ຽນຕາມຫ້ອງການຂອງທ່ານ)
const OFFICE_LAT = 17.962501366620828;
const OFFICE_LNG = 102.64169714794403;
const GEOFENCE_RADIUS = 100; // meters

// ====== MAIN HANDLERS ======

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function handleRequest(e, method) {
  try {
    let data = {};
    let action = '';
    
    // Parse request data
    if (method === 'POST' && e.postData) {
      const payload = JSON.parse(e.postData.contents);
      data = payload;
      action = payload.action || e.parameter.action || '';
    } else {
      data = e.parameter || {};
      action = e.parameter.action || '';
    }
    
    let result;

    switch(action) {
      // ===== AUTH =====
      case 'login': 
        result = login(data); 
        break;
      
      // ===== EMPLOYEES =====
      case 'getEmployees': 
        result = getEmployees(); 
        break;
      case 'getEmployee': 
        result = getEmployee(data.id || data.employee_id); 
        break;
      case 'registerEmployee':
        result = registerEmployee(data);
        break;
      case 'updateEmployee':
        result = updateEmployee(data);
        break;
      case 'deleteEmployee':
        result = deleteEmployee(data);
        break;
      case 'resetPIN':
        result = resetPIN(data);
        break;
      case 'getAllEmployees':
        result = getAllEmployees();
        break;
      
      // ===== ATTENDANCE =====
      case 'checkIn': 
        result = checkIn(data); 
        break;
      case 'checkOut': 
        result = checkOut(data); 
        break;
      case 'getTodayAttendance': 
        result = getTodayAttendance(data.employeeId || data.employee_id); 
        break;
      case 'getAttendanceHistory': 
        result = getAttendanceHistory(data.employeeId || data.employee_id, data.limit); 
        break;
      case 'getAllAttendanceToday': 
        result = getAllAttendanceToday(); 
        break;
      
      // ===== LEAVE =====
      case 'requestLeave': 
        result = requestLeave(data); 
        break;
      case 'getMyLeaveRequests': 
        result = getMyLeaves(data.employeeId || data.employee_id); 
        break;
      case 'getPendingLeaveRequests': 
        result = getPendingLeaves(); 
        break;
      case 'approveLeave': 
        result = approveLeave(data); 
        break;
      case 'rejectLeave': 
        result = rejectLeave(data); 
        break;
      case 'getLeaveBalance': 
        result = getLeaveBalance(data.employeeId || data.employee_id); 
        break;
      
      // ===== PAYROLL =====
      case 'getMySalary': 
        result = getMyPayroll(data.employeeId || data.employee_id); 
        break;
      case 'getAllPayroll': 
        result = getAllPayroll(data.month, data.year); 
        break;
      case 'generatePayroll':
        result = generatePayroll(data);
        break;
      
      // ===== DASHBOARD =====
      case 'getDashboardStats': 
        result = getDashboardStats(); 
        break;
      
      // ===== CONFIG =====
      case 'getConfig': 
        result = getConfig(); 
        break;
      
      default: 
        result = { success: true, message: 'HR Attendance API v1.0', action: action };
    }

    return jsonResponse(result);
    
  } catch(error) {
    Logger.log('Error in handleRequest: ' + error.message);
    return jsonResponse({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====== HELPER FUNCTIONS ======

function getSheet(name) {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  } catch(e) {
    throw new Error('Cannot open sheet: ' + name + '. Error: ' + e.message);
  }
}

function getSheetData(name) {
  const sheet = getSheet(name);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Vientiane', 'yyyy-MM-dd');
}

function formatTime(date) {
  return Utilities.formatDate(date, 'Asia/Vientiane', 'HH:mm:ss');
}

function formatDateTime(date) {
  return Utilities.formatDate(date, 'Asia/Vientiane', 'yyyy-MM-dd HH:mm:ss');
}

function generateUUID() {
  return Utilities.getUuid();
}

// ====== AUTH ======

function login(data) {
  try {
    const empId = data.empId || data.emp_code;
    const pin = data.pin ? data.pin.toString() : '';
    
    if (!empId || !pin) {
      return { success: false, error: 'ກະລຸນາໃສ່ລະຫັດພະນັກງານແລະ PIN' };
    }
    
    const sheet = getSheet(SHEETS.employees);
    const rows = sheet.getDataRange().getValues();
    
    // Find employee (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowEmpCode = row[1] ? row[1].toString() : '';
      const rowPin = row[8] ? row[8].toString() : '';
      const rowStatus = row[11] ? row[11].toString() : '';
      
      if (rowEmpCode === empId && rowPin === pin && rowStatus === 'active') {
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
            baseSalary: row[7],
            role: row[9],
            status: row[11]
          }
        };
      }
    }
    
    return { success: false, error: 'ລະຫັດພະນັກງານ ຫຼື PIN ບໍ່ຖືກຕ້ອງ' };
    
  } catch(error) {
    return { success: false, error: 'Login error: ' + error.message };
  }
}

// ====== EMPLOYEES ======

function getAllEmployees() {
  try {
    const sheet = getSheet(SHEETS.employees);
    const rows = sheet.getDataRange().getValues();
    const employees = [];
    
    // Skip header
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      employees.push({
        id: row[0],
        empCode: row[1],
        fullName: row[2],
        email: row[3],
        phone: row[4],
        department: row[5],
        position: row[6],
        baseSalary: row[7],
        role: row[9],
        hireDate: row[10],
        status: row[11]
      });
    }
    
    return { success: true, employees: employees };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function registerEmployee(data) {
  try {
    const sheet = getSheet(SHEETS.employees);
    const id = generateUUID();
    const now = formatDateTime(new Date());
    
    // Check duplicate emp_code
    const existing = sheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][1] === data.empCode) {
        return { success: false, error: 'ລະຫັດພະນັກງານນີ້ມີແລ້ວ' };
      }
    }
    
    sheet.appendRow([
      id,
      data.empCode,
      data.fullName,
      data.email || '',
      data.phone || '',
      data.department || '',
      data.position || '',
      data.baseSalary || 0,
      data.pin,
      data.role || 'user',
      formatDate(new Date()),
      'active',
      now,
      now
    ]);
    
    // Create leave balance
    createLeaveBalance(id);
    
    return { success: true, message: 'ລົງທະບຽນສຳເລັດ', employeeId: id };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function updateEmployee(data) {
  try {
    const sheet = getSheet(SHEETS.employees);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.employeeId) {
        // Update row
        if (data.fullName) sheet.getRange(i + 1, 3).setValue(data.fullName);
        if (data.email) sheet.getRange(i + 1, 4).setValue(data.email);
        if (data.phone) sheet.getRange(i + 1, 5).setValue(data.phone);
        if (data.position) sheet.getRange(i + 1, 7).setValue(data.position);
        if (data.baseSalary) sheet.getRange(i + 1, 8).setValue(data.baseSalary);
        if (data.role) sheet.getRange(i + 1, 10).setValue(data.role);
        if (data.status) sheet.getRange(i + 1, 12).setValue(data.status);
        sheet.getRange(i + 1, 14).setValue(formatDateTime(new Date()));
        
        return { success: true, message: 'ອັບເດດສຳເລັດ' };
      }
    }
    
    return { success: false, error: 'ບໍ່ພົບພະນັກງານ' };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function deleteEmployee(data) {
  try {
    const sheet = getSheet(SHEETS.employees);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.employeeId) {
        sheet.getRange(i + 1, 12).setValue('inactive');
        return { success: true, message: 'ປິດການໃຊ້ງານສຳເລັດ' };
      }
    }
    
    return { success: false, error: 'ບໍ່ພົບພະນັກງານ' };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function resetPIN(data) {
  try {
    const sheet = getSheet(SHEETS.employees);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.employeeId) {
        sheet.getRange(i + 1, 9).setValue(data.newPIN);
        return { 
          success: true, 
          message: 'ລີເຊັດ PIN ສຳເລັດ',
          employeeName: rows[i][2],
          newPIN: data.newPIN
        };
      }
    }
    
    return { success: false, error: 'ບໍ່ພົບພະນັກງານ' };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getEmployees() {
  return getAllEmployees();
}

function getEmployee(id) {
  const result = getAllEmployees();
  if (result.success) {
    const emp = result.employees.find(e => e.id === id);
    return emp || { error: 'Employee not found' };
  }
  return result;
}

// ====== ATTENDANCE ======

function checkIn(data) {
  try {
    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);
    const employeeId = data.employeeId || data.employee_id;
    
    // Validate GPS
    const distance = calculateDistance(lat, lng, OFFICE_LAT, OFFICE_LNG);
    
    if (distance > GEOFENCE_RADIUS) {
      return { 
        success: false, 
        error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${Math.round(distance)}m)`,
        distance: Math.round(distance)
      };
    }
    
    const now = new Date();
    const today = formatDate(now);
    const timeNow = formatTime(now);
    
    // Check if already checked in
    const sheet = getSheet(SHEETS.attendance);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId && rows[i][2] === today) {
        if (rows[i][3]) { // check_in exists
          return { success: false, error: 'ເຂົ້າວຽກແລ້ວມື້ນີ້' };
        }
      }
    }
    
    // Determine status
    const lateThreshold = '08:15:00';
    const status = timeNow <= lateThreshold ? 'on_time' : 'late';
    
    // Add record
    const id = generateUUID();
    sheet.appendRow([
      id,
      employeeId,
      today,
      timeNow,
      '', // check_out
      lat,
      lng,
      '', // check_out_lat
      '', // check_out_lng
      status,
      0, // work_hours
      '', // notes
      formatDateTime(now)
    ]);
    
    return { 
      success: true, 
      message: 'ເຂົ້າວຽກສຳເລັດ',
      checkIn: timeNow,
      status: status,
      distance: Math.round(distance)
    };
    
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function checkOut(data) {
  try {
    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);
    const employeeId = data.employeeId || data.employee_id;
    
    // Validate GPS
    const distance = calculateDistance(lat, lng, OFFICE_LAT, OFFICE_LNG);
    
    if (distance > GEOFENCE_RADIUS) {
      return { 
        success: false, 
        error: `ຢູ່ນອກຂອບເຂດຫ້ອງການ (${Math.round(distance)}m)` 
      };
    }
    
    const now = new Date();
    const today = formatDate(now);
    const timeNow = formatTime(now);
    
    // Find today's record
    const sheet = getSheet(SHEETS.attendance);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId && rows[i][2] === today) {
        const checkInTime = rows[i][3];
        
        if (!checkInTime) {
          return { success: false, error: 'ກະລຸນາກົດເຂົ້າວຽກກ່ອນ' };
        }
        
        if (rows[i][4]) {
          return { success: false, error: 'ອອກວຽກແລ້ວມື້ນີ້' };
        }
        
        // Calculate work hours
        const checkIn = new Date(today + ' ' + checkInTime);
        const checkOut = new Date(today + ' ' + timeNow);
        const diffMs = checkOut - checkIn;
        const diffHrs = (diffMs / (1000 * 60 * 60)) - 1; // minus lunch break
        const workHours = Math.max(0, diffHrs).toFixed(2);
        
        // Update record
        sheet.getRange(i + 1, 5).setValue(timeNow); // check_out
        sheet.getRange(i + 1, 8).setValue(lat); // check_out_lat
        sheet.getRange(i + 1, 9).setValue(lng); // check_out_lng
        sheet.getRange(i + 1, 11).setValue(workHours); // work_hours
        
        return { 
          success: true, 
          message: 'ອອກວຽກສຳເລັດ',
          checkOut: timeNow,
          workHours: parseFloat(workHours)
        };
      }
    }
    
    return { success: false, error: 'ບໍ່ພົບບັນທຶກເຂົ້າວຽກມື້ນີ້' };
    
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getTodayAttendance(employeeId) {
  try {
    const today = formatDate(new Date());
    const sheet = getSheet(SHEETS.attendance);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId && rows[i][2] === today) {
        return {
          success: true,
          attendance: {
            id: rows[i][0],
            employeeId: rows[i][1],
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
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getAttendanceHistory(employeeId, limit) {
  try {
    const sheet = getSheet(SHEETS.attendance);
    const rows = sheet.getDataRange().getValues();
    const history = [];
    
    for (let i = 1; i < rows.length; i++) {
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
    
    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit results
    const maxLimit = limit ? parseInt(limit) : 30;
    const limitedHistory = history.slice(0, maxLimit);
    
    return { success: true, history: limitedHistory };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getAllAttendanceToday() {
  try {
    const today = formatDate(new Date());
    const attSheet = getSheet(SHEETS.attendance);
    const empSheet = getSheet(SHEETS.employees);
    
    const attRows = attSheet.getDataRange().getValues();
    const empRows = empSheet.getDataRange().getValues();
    
    const result = [];
    
    for (let i = 1; i < empRows.length; i++) {
      const emp = empRows[i];
      if (emp[11] !== 'active') continue;
      
      let attendance = null;
      for (let j = 1; j < attRows.length; j++) {
        if (attRows[j][1] === emp[0] && attRows[j][2] === today) {
          attendance = {
            checkIn: attRows[j][3],
            checkOut: attRows[j][4],
            status: attRows[j][9]
          };
          break;
        }
      }
      
      result.push({
        id: emp[0],
        name: emp[2],
        position: emp[6],
        attendance: attendance,
        status: attendance ? attendance.status : 'absent'
      });
    }
    
    return { success: true, data: result };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

// ====== LEAVE ======

function createLeaveBalance(employeeId) {
  try {
    const sheet = getSheet(SHEETS.leave_balances);
    const year = new Date().getFullYear();
    const id = generateUUID();
    
    sheet.appendRow([
      id,
      employeeId,
      year,
      15, // annual_quota
      0,  // annual_used
      15, // annual_remaining
      30, // sick_quota
      0,  // sick_used
      30, // sick_remaining
      formatDateTime(new Date())
    ]);
    
    return true;
  } catch(error) {
    Logger.log('Error creating leave balance: ' + error.message);
    return false;
  }
}

function requestLeave(data) {
  try {
    const sheet = getSheet(SHEETS.leave_requests);
    const id = generateUUID();
    
    // Calculate days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    sheet.appendRow([
      id,
      data.employeeId,
      data.leaveType,
      data.startDate,
      data.endDate,
      days,
      data.reason || '',
      'pending',
      '', // approved_by
      '', // approved_at
      '', // rejection_reason
      formatDateTime(new Date())
    ]);
    
    return { success: true, message: 'ສົ່ງຄຳຂໍລາສຳເລັດ', id: id };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getMyLeaves(employeeId) {
  try {
    const sheet = getSheet(SHEETS.leave_requests);
    const rows = sheet.getDataRange().getValues();
    const leaves = [];
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId) {
        leaves.push({
          id: rows[i][0],
          leaveType: rows[i][2],
          startDate: rows[i][3],
          endDate: rows[i][4],
          days: rows[i][5],
          reason: rows[i][6],
          status: rows[i][7],
          approvedBy: rows[i][8],
          approvedAt: rows[i][9]
        });
      }
    }
    
    leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, leaves: leaves };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getPendingLeaves() {
  try {
    const leaveSheet = getSheet(SHEETS.leave_requests);
    const empSheet = getSheet(SHEETS.employees);
    
    const leaveRows = leaveSheet.getDataRange().getValues();
    const empRows = empSheet.getDataRange().getValues();
    
    const pending = [];
    
    for (let i = 1; i < leaveRows.length; i++) {
      if (leaveRows[i][7] === 'pending') {
        const employeeId = leaveRows[i][1];
        let employeeName = 'Unknown';
        
        for (let j = 1; j < empRows.length; j++) {
          if (empRows[j][0] === employeeId) {
            employeeName = empRows[j][2];
            break;
          }
        }
        
        pending.push({
          id: leaveRows[i][0],
          employeeId: employeeId,
          employeeName: employeeName,
          leaveType: leaveRows[i][2],
          startDate: leaveRows[i][3],
          endDate: leaveRows[i][4],
          days: leaveRows[i][5],
          reason: leaveRows[i][6],
          status: leaveRows[i][7]
        });
      }
    }
    
    return { success: true, requests: pending };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function approveLeave(data) {
  return updateLeaveStatus(data.leaveId, 'approved', data.approvedBy);
}

function rejectLeave(data) {
  return updateLeaveStatus(data.leaveId, 'rejected', data.approvedBy, data.reason);
}

function updateLeaveStatus(leaveId, status, approvedBy, rejectionReason) {
  try {
    const sheet = getSheet(SHEETS.leave_requests);
    const rows = sheet.getDataRange().getValues();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === leaveId) {
        sheet.getRange(i + 1, 8).setValue(status);
        sheet.getRange(i + 1, 9).setValue(approvedBy);
        sheet.getRange(i + 1, 10).setValue(formatDateTime(new Date()));
        if (rejectionReason) {
          sheet.getRange(i + 1, 11).setValue(rejectionReason);
        }
        
        // Update balance if approved
        if (status === 'approved') {
          updateLeaveBalance(rows[i][1], rows[i][2], rows[i][5]);
        }
        
        return { 
          success: true, 
          message: status === 'approved' ? 'ອະນຸມັດສຳເລັດ' : 'ປະຕິເສດສຳເລັດ' 
        };
      }
    }
    
    return { success: false, error: 'ບໍ່ພົບຄຳຂໍ' };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function updateLeaveBalance(employeeId, leaveType, days) {
  try {
    const sheet = getSheet(SHEETS.leave_balances);
    const rows = sheet.getDataRange().getValues();
    const year = new Date().getFullYear();
    
    const colMap = { 
      annual: { used: 5, remaining: 6 }, 
      sick: { used: 8, remaining: 9 } 
    };
    
    if (!colMap[leaveType]) return;
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId && rows[i][2] == year) {
        const currentUsed = rows[i][colMap[leaveType].used - 1] || 0;
        const currentRemaining = rows[i][colMap[leaveType].remaining - 1] || 0;
        
        sheet.getRange(i + 1, colMap[leaveType].used).setValue(currentUsed + days);
        sheet.getRange(i + 1, colMap[leaveType].remaining).setValue(Math.max(0, currentRemaining - days));
        sheet.getRange(i + 1, 10).setValue(formatDateTime(new Date()));
        return;
      }
    }
  } catch(error) {
    Logger.log('Error updating leave balance: ' + error.message);
  }
}

function getLeaveBalance(employeeId) {
  try {
    const sheet = getSheet(SHEETS.leave_balances);
    const rows = sheet.getDataRange().getValues();
    const year = new Date().getFullYear();
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId && rows[i][2] == year) {
        return {
          success: true,
          balance: {
            year: rows[i][2],
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
    
    // Create if not exists
    createLeaveBalance(employeeId);
    
    return {
      success: true,
      balance: {
        year: year,
        annualQuota: 15,
        annualUsed: 0,
        annualRemaining: 15,
        sickQuota: 30,
        sickUsed: 0,
        sickRemaining: 30
      }
    };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

// ====== PAYROLL ======

function getMyPayroll(employeeId) {
  try {
    const sheet = getSheet(SHEETS.payroll);
    const rows = sheet.getDataRange().getValues();
    const payrolls = [];
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === employeeId) {
        payrolls.push({
          id: rows[i][0],
          month: rows[i][2],
          baseSalary: rows[i][3],
          allowance: rows[i][4],
          OTHours: rows[i][5],
          OTAmount: rows[i][6],
          bonus: rows[i][7],
          tax: rows[i][8],
          socialSecurity: rows[i][9],
          otherDeductions: rows[i][10],
          netSalary: rows[i][11],
          paymentDate: rows[i][12],
          status: rows[i][13]
        });
      }
    }
    
    payrolls.sort((a, b) => new Date(b.month) - new Date(a.month));
    return { success: true, payrolls: payrolls };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function getAllPayroll(month, year) {
  try {
    const sheet = getSheet(SHEETS.payroll);
    const empSheet = getSheet(SHEETS.employees);
    
    const payrollRows = sheet.getDataRange().getValues();
    const empRows = empSheet.getDataRange().getValues();
    
    const payrolls = [];
    
    for (let i = 1; i < payrollRows.length; i++) {
      const payrollMonth = payrollRows[i][2];
      if (month && year && payrollMonth !== `${year}-${month.toString().padStart(2, '0')}`) {
        continue;
      }
      
      const employeeId = payrollRows[i][1];
      let employeeName = 'Unknown';
      
      for (let j = 1; j < empRows.length; j++) {
        if (empRows[j][0] === employeeId) {
          employeeName = empRows[j][2];
          break;
        }
      }
      
      payrolls.push({
        id: payrollRows[i][0],
        employeeId: employeeId,
        employeeName: employeeName,
        month: payrollRows[i][2],
        netSalary: payrollRows[i][11],
        status: payrollRows[i][13]
      });
    }
    
    return { success: true, payrolls: payrolls };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

function generatePayroll(data) {
  // Future implementation
  return { success: false, error: 'Not implemented yet' };
}

// ====== DASHBOARD ======

function getDashboardStats() {
  try {
    const empSheet = getSheet(SHEETS.employees);
    const attSheet = getSheet(SHEETS.attendance);
    const leaveSheet = getSheet(SHEETS.leave_requests);
    
    const empRows = empSheet.getDataRange().getValues();
    const attRows = attSheet.getDataRange().getValues();
    const leaveRows = leaveSheet.getDataRange().getValues();
    
    const today = formatDate(new Date());
    const activeEmployees = empRows.filter((r, i) => i > 0 && r[11] === 'active').length;
    
    let checkedIn = 0, onTime = 0, late = 0;
    for (let i = 1; i < attRows.length; i++) {
      if (attRows[i][2] === today) {
        checkedIn++;
        if (attRows[i][9] === 'on_time') onTime++;
        if (attRows[i][9] === 'late') late++;
      }
    }
    
    let pendingLeaves = 0;
    for (let i = 1; i < leaveRows.length; i++) {
      if (leaveRows[i][7] === 'pending') pendingLeaves++;
    }
    
    return {
      success: true,
      stats: {
        totalEmployees: activeEmployees,
        checkedIn: checkedIn,
        onTime: onTime,
        late: late,
        absent: activeEmployees - checkedIn,
        pendingLeaves: pendingLeaves,
        attendanceRate: activeEmployees > 0 ? Math.round((checkedIn / activeEmployees) * 100) : 0
      }
    };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

// ====== CONFIG ======

function getConfig() {
  try {
    return {
      success: true,
      config: {
        officeLat: OFFICE_LAT,
        officeLng: OFFICE_LNG,
        geofenceRadius: GEOFENCE_RADIUS,
        lateThreshold: '08:15:00',
        workStart: '08:00:00',
        workEnd: '17:00:00'
      }
    };
  } catch(error) {
    return { success: false, error: error.message };
  }
}

// ====== GPS CALCULATION ======

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distance in meters
}
