// ===================================
// Config.gs - Configuration File
// ===================================

// ====== SPREADSHEET SETUP ======
const CONFIG = {
  // Spreadsheet ID (ດຶງຈາກ URL ຂອງທ່ານ)
  SPREADSHEET_ID: '1W06LSdqJcCCwMPeM-0b3wXvKprMdMBRcqne8Fc3Mkd4',
  
  // Sheet Names
  SHEETS: {
    EMPLOYEES: 'employees',
    ATTENDANCE: 'attendance',
    LEAVE_REQUESTS: 'leave_requests',
    LEAVE_BALANCES: 'leave_balances',
    PAYROLL: 'payroll',
    DEPARTMENTS: 'departments',
    CONFIG: 'config'
  },
  
  // GPS Settings (ອ່ານຈາກ config sheet ຫຼື hardcode)
  OFFICE_LAT: 17.962501366620828,
  OFFICE_LNG: 102.64169714794403,
  GPS_RADIUS: 100, // meters
  
  // Work Time Settings
  WORK_START: '08:00:00',
  WORK_END: '17:00:00',
  LUNCH_BREAK: 1, // hours
  LATE_THRESHOLD: '08:15:00',
  
  // Payroll Settings
  OT_RATE: 1.5,
  STANDARD_WORK_HOURS_MONTH: 176, // 22 days * 8 hours
  TAX_THRESHOLD: 4500000, // LAK
  TAX_RATE: 0.10,
  SOCIAL_SECURITY_RATE: 0.055,
  
  // Leave Settings
  ANNUAL_LEAVE_QUOTA: 15,
  SICK_LEAVE_QUOTA: 30,
  
  // CORS Settings
  ALLOWED_ORIGINS: [
    'https://your-pwa-domain.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ]
};

// ====== HELPER: Get Spreadsheet ======
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

// ====== HELPER: Get Sheet ======
function getSheet(sheetName) {
  return getSpreadsheet().getSheetByName(sheetName);
}

// ====== HELPER: Load Config from Sheet ======
function loadConfig() {
  const sheet = getSheet(CONFIG.SHEETS.CONFIG);
  const data = sheet.getDataRange().getValues();
  
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const [key, value] = data[i];
    config[key] = value;
  }
  
  return config;
}

// ====== HELPER: Generate UUID ======
function generateUUID() {
  return Utilities.getUuid();
}

// ====== HELPER: Get Current Timestamp ======
function getCurrentTimestamp() {
  return Utilities.formatDate(new Date(), 'Asia/Vientiane', 'yyyy-MM-dd HH:mm:ss');
}

// ====== HELPER: Get Current Date ======
function getCurrentDate() {
  return Utilities.formatDate(new Date(), 'Asia/Vientiane', 'yyyy-MM-dd');
}

// ====== HELPER: Calculate Distance (Haversine) ======
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// ====== HELPER: Validate GPS ======
function validateGPS(lat, lng) {
  const distance = calculateDistance(lat, lng, CONFIG.OFFICE_LAT, CONFIG.OFFICE_LNG);
  return {
    isValid: distance <= CONFIG.GPS_RADIUS,
    distance: Math.round(distance)
  };
}
