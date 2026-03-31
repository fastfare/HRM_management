// HR System API Wrapper
// Simplifies API calls for index.html and admin.html

const API = {
    baseURL: window.location.origin,

    // Helper function
    async call(endpoint, data = {}, method = 'POST') {
        try {
            const url = `${this.baseURL}${endpoint}`;
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
    },

    // For backward compatibility with old code
    async callAPI(action, data = {}) {
        // Map old action names to new endpoints
        const endpoints = {
            'login': { url: '/api/auth/login', method: 'POST' },
            'getTodayAttendance': { url: `/api/attendance/today/${data.employeeId}`, method: 'GET' },
            'getAttendanceHistory': { url: `/api/attendance/history/${data.employeeId}?limit=${data.limit || 30}`, method: 'GET' },
            'checkIn': { url: '/api/attendance/checkin', method: 'POST' },
            'checkOut': { url: '/api/attendance/checkout', method: 'POST' },
            'getAllEmployees': { url: '/api/employees', method: 'GET' },
            'registerEmployee': { url: '/api/employees', method: 'POST' },
            'updateEmployee': { url: `/api/employees/${data.employeeId}`, method: 'PUT' },
            'deleteEmployee': { url: `/api/employees/${data.employeeId}`, method: 'DELETE' },
            'resetPIN': { url: `/api/employees/${data.employeeId}/reset-pin`, method: 'POST' }
        };

        const config = endpoints[action];
        if (!config) {
            console.error('Unknown action:', action);
            return { success: false, error: 'Unknown API action' };
        }

        return await this.call(config.url, data, config.method);
    }
};

// Make it available globally
window.API = API;
window.callAPI = (action, data) => API.callAPI(action, data);

console.log('✅ API Wrapper loaded');
