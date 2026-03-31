# HR Attendance Management System

ລະບົບບໍລິຫານການເຂົ້າ-ອອກວຽກ ແລະ ຈັດການພະນັກງານ

## ✨ Features

- ✅ Login ດ້ວຍລະຫັດພະນັກງານ + PIN
- ✅ ບັນທຶກເຂົ້າ-ອອກວຽກດ້ວຍ GPS
- ✅ ຂໍລາພັກ (ລາປົກກະຕິ, ລາປ່ວຍ)
- ✅ Admin: ຈັດການພະນັກງານ, ອະນຸມັດລາ
- ✅ ບໍ່ຕ້ອງອິນເຕີເນັດ - ໃຊ້ Local Network
- ✅ ຂໍ້ມູນຢູ່ໃນເຄື່ອງ - ປອດໄພ

## 🏗️ Technology Stack

- **Frontend:** HTML, CSS (Tailwind), JavaScript
- **Backend:** Node.js + Express
- **Database:** JSON Files
- **GPS:** Geolocation API

## 📁 Project Structure

```
d:\Dsax_HRM\
├── server/                 # Backend
│   ├── server.js          # Main server
│   ├── fileHandler.js     # Database operations
│   ├── routes/
│   │   ├── auth.js        # Authentication
│   │   ├── attendance.js  # Attendance management
│   │   ├── employees.js   # Employee CRUD
│   │   └── leave.js       # Leave management
│   └── createSampleData.js # Sample data generator
├── data/                   # JSON Database
│   ├── employees.json
│   ├── attendance.json
│   ├── leave_requests.json
│   ├── leave_balances.json
│   └── payroll.json
├── public/                 # Frontend (optional folder)
├── index.html             # Main interface
├── admin.html             # Admin panel
└── package.json           # Dependencies

```

## 🚀 Quick Start

### 1. ຕິດຕັ້ງ Node.js
Download from: https://nodejs.org/ (LTS version)

### 2. ຕິດຕັ້ງ Dependencies
```bash
npm install
```

### 3. ສ້າງຂໍ້ມູນຕົວຢ່າງ
```bash
node server/createSampleData.js
```

### 4. ລັນ Server
```bash
node server/server.js
# ຫຼື
npm start
```

### 5. ເປີດ Browser
```
http://localhost:3000
```

## 👥 Test Accounts

| Employee Code | PIN | Role | Name |
|---------------|-----|------|------|
| EMP001 | 1111 | Admin | Panoy |
| EMP002 | 2222 | User | Add |
| EMP003 | 3333 | User | Souk |

## 🌐 Network Access

### ໃຊ້ງານຈາກເຄື່ອງອື່ນ:

1. ຫາ IP ຂອງເຄື່ອງ Server:
   ```bash
   ipconfig
   # ຊອກ IPv4 Address: 192.168.x.x
   ```

2. ພະນັກງານເຂົ້າຫາດ້ວຍ:
   ```
   http://192.168.x.x:3000
   ```

## 📖 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - ຄູ່ມືຕິດຕັ້ງລະອຽດ
- [FLOW_OPTION_B_JSON.md](FLOW_OPTION_B_JSON.md) - Architecture diagram
- [implementation_plan.md](.gemini/antiguravity/brain/.../implementation_plan.md) - Technical plan

## 🔧 Development

### Run with auto-restart:
```bash
npm run dev
```

### API Endpoints:
```
POST   /api/auth/login
POST   /api/attendance/checkin
POST   /api/attendance/checkout
GET    /api/attendance/today/:id
GET    /api/employees
POST   /api/employees
POST   /api/leave/request
GET    /api/leave/pending
```

## 💾 Backup

### Git Method (Recommended):
```bash
git add data/*.json
git commit -m "Backup: YYYY-MM-DD"
git push
```

### Manual Method:
```bash
xcopy data d:\Backup\HR_backup\ /E /I
```

## 📊 Database Files

All data stored in `data/` folder as JSON:
- **employees.json** - Employee data
- **attendance.json** - Check-in/out records
- **leave_requests.json** - Leave requests
- **leave_balances.json** - Leave quotas
- **payroll.json** - Payroll data

## 🎯 Features in Detail

### For Employees:
- Check-in/Check-out with GPS validation
- View attendance history
- Request leave
- View leave balance
- View salary slips

### For Admin:
- Register new employees
- Reset employee PINs
- Approve/reject leave requests
- View all attendance
- Generate reports
- Manage employee records

## 🔐 Security

- PIN-based authentication
- GPS geofencing (100m radius)
- Local network only (no internet required)
- Data stored locally

## 📱 Mobile Support

Works on mobile browsers:
- iPhone Safari
- Android Chrome
- Must be connected to office WiFi

## ⚙️ Configuration

Edit `CONFIG` in `server/routes/attendance.js`:
```javascript
const OFFICE_LAT = 17.962501366620828;  // Your office latitude
const OFFICE_LNG = 102.64169714794403;  // Your office longitude
const GEOFENCE_RADIUS = 100;            // Radius in meters
```

## 🐛 Troubleshooting

**Cannot start server?**
- Check if Node.js is installed: `node --version`
- Run `npm install` again

**Port 3000 already in use?**
- Stop other server with Ctrl+C
- Or change PORT in `server/server.js`

**Cannot access from other computers?**
- Check both computers on same WiFi
- Check Windows Firewall settings
- Verify IP address is correct

## 📝 License

MIT

## 👨‍💻 Support

For issues or questions, contact system administrator.

---

**Made with ❤️ for efficient HR management**
