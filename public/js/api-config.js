// API Configuration for Local Server
const API_CONFIG = {
    // Base URL - Auto-detect current host
    BASE_URL: window.location.origin,

    // API Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/api/auth/login',

        // Attendance
        CHECKIN: '/api/attendance/checkin',
        CHECKOUT: '/api/attendance/checkout',
        TODAY_ATTENDANCE: (id) => `/api/attendance/today/${id}`,
        ATTENDANCE_HISTORY: (id) => `/api/attendance/history/${id}`,

        // Employees
        EMPLOYEES: '/api/employees',
        EMPLOYEE_BY_ID: (id) => `/api/employees/${id}`,
        RESET_PIN: (id) => `/api/employees/${id}/reset-pin`,

        // Leave
        REQUEST_LEAVE: '/api/leave/request',
        MY_REQUESTS: (id) => `/api/leave/my-requests/${id}`,
        PENDING_REQUESTS: '/api/leave/pending',
        APPROVE_LEAVE: '/api/leave/approve',
        REJECT_LEAVE: '/api/leave/reject',
        LEAVE_BALANCE: (id) => `/api/leave/balance/${id}`
    },

    // Office GPS Coordinates
    OFFICE_LAT: 17.872417,
    OFFICE_LNG: 102.653306,
    RADIUS: 100 // meters
};

// API Client Function
async function callAPIEndpoint(endpoint, data = {}, method = 'POST') {
    try {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (method === 'POST' || method === 'PUT') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Wrapper functions for easier API calls
const API = {
    // Auth
    login: (empId, pin) => callAPIEndpoint(API_CONFIG.ENDPOINTS.LOGIN, { empId, pin }),

    // Attendance
    checkin: (employeeId, lat, lng) => callAPIEndpoint(API_CONFIG.ENDPOINTS.CHECKIN, { employeeId, lat, lng }),
    checkout: (employeeId, lat, lng) => callAPIEndpoint(API_CONFIG.ENDPOINTS.CHECKOUT, { employeeId, lat, lng }),
    getTodayAttendance: (employeeId) => callAPIEndpoint(API_CONFIG.ENDPOINTS.TODAY_ATTENDANCE(employeeId), {}, 'GET'),
    getAttendanceHistory: (employeeId, limit = 30) => callAPIEndpoint(`${API_CONFIG.ENDPOINTS.ATTENDANCE_HISTORY(employeeId)}?limit=${limit}`, {}, 'GET'),

    // Employees
    getEmployees: () => callAPIEndpoint(API_CONFIG.ENDPOINTS.EMPLOYEES, {}, 'GET'),
    registerEmployee: (data) => callAPIEndpoint(API_CONFIG.ENDPOINTS.EMPLOYEES, data),
    updateEmployee: (id, data) => callAPIEndpoint(API_CONFIG.ENDPOINTS.EMPLOYEE_BY_ID(id), data, 'PUT'),
    resetPIN: (id, newPIN) => callAPIEndpoint(API_CONFIG.ENDPOINTS.RESET_PIN(id), { newPIN }),

    // Leave
    requestLeave: (data) => callAPIEndpoint(API_CONFIG.ENDPOINTS.REQUEST_LEAVE, data),
    getMyRequests: (employeeId) => callAPIEndpoint(API_CONFIG.ENDPOINTS.MY_REQUESTS(employeeId), {}, 'GET'),
    getPendingRequests: () => callAPIEndpoint(API_CONFIG.ENDPOINTS.PENDING_REQUESTS, {}, 'GET'),
    approveLeave: (leaveId, approvedBy) => callAPIEndpoint(API_CONFIG.ENDPOINTS.APPROVE_LEAVE, { leaveId, approvedBy }),
    rejectLeave: (leaveId, approvedBy, reason) => callAPIEndpoint(API_CONFIG.ENDPOINTS.REJECT_LEAVE, { leaveId, approvedBy, reason }),
    getLeaveBalance: (employeeId) => callAPIEndpoint(API_CONFIG.ENDPOINTS.LEAVE_BALANCE(employeeId), {}, 'GET')
};

console.log('✅ API Client loaded:', API_CONFIG.BASE_URL);
