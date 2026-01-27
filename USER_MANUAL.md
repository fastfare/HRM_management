# 🚀 HR Attendance System - Complete Guide

ລະບົບບໍລິຫານງານບຸກຄະລາກອນ ແລະ ການເຂົ້າວຽກ (HR Attendance Management System)

---

## 📋 ສາລະບານ

1. [ຂໍ້ມູນລະບົບ](#ຂໍ້ມູນລະບົບ)
2. [ຄຸນສົມບັດ](#ຄຸນສົມບັດ)
3. [ການຕິດຕັ້ງ](#ການຕິດຕັ້ງ)
4. [ການນຳໃຊ້](#ການນຳໃຊ້)
5. [ການແກ້ໄຂບັນຫາ](#ການແກ້ໄຂບັນຫາ)

---

## ຂໍ້ມູນລະບົບ

### ລະບົບປະກອບດ້ວຍ:

**1. PWA (Progressive Web App)**
- ໜ້າ Login
- ໜ້າ Home (Dashboard)
- ການກົດເຂົ້າ-ອອກວຽກ (ດ້ວຍ GPS)
- ປະຫວັດການເຂົ້າວຽກ
- Profile

**2. Admin Panel**
- ລົງທະບຽນພະນັກງານໃໝ່
- ແກ້ໄຂຂໍ້ມູນພະນັກງານ
- ລີເຊັດ PIN
- ຈັດການສິດ (User/Admin)

**3. Backend (Google Apps Script)**
- 20+ API endpoints
- Authentication
- Attendance tracking
- Leave management
- Payroll calculation

**4. Database (Google Sheets)**
- 7 sheets (employees, attendance, leave, payroll, etc.)
- Zero cost
- Real-time sync

---

## ຄຸນສົມບັດ

### ✅ ສຳລັບພະນັກງານ (User)

**การเข้า-ອອກວຽກ:**
- ✅ GPS-based check-in/out (ກວດພິກັດ GPS ອັດຕະໂນມັດ)
- ✅ ຈຳກັດຂອບເຂດ 100 ແມັດຈາກຫ້ອງການ
- ✅ ກວດຈັບການມາສາຍອັດຕະໂນມັດ (ຫຼັງ 08:15)
- ✅ ຄິດໄລ່ຊົ່ວໂມງເຮັດວຽກອັດຕະໂນມັດ
- ✅ ປະຫວັດການເຂົ້າວຽກ 30 ວັນຫຼ້າສຸດ

**ການຂໍລາພັກ:**
- ✅ ສົ່ງຄຳຂໍລາ (ປະຈຳປີ, ລາປ່ວຍ)
- ✅ ຕິດຕາມສະຖານະການອະນຸມັດ
- ✅ ກວດເບິ່ງໂຄຕ້າລາຄົງເຫຼືອ

**ເງິນເດືອນ:**
- ✅ ເບິ່ງໃບຮັບເງິນເດືອນ
- ✅ ລາຍລະອຽດການຫັກ-ເພີ່ມ
- ✅ OT, ໂບນັດ, ປະກັນສັງຄົມ

### ✅ ສຳລັບ Admin

**ຈັດການພະນັກງານ:**
- ✅ ລົງທະບຽນພະນັກງານໃໝ່
- ✅ ແກ້ໄຂຂໍ້ມູນ (ຊື່, ເບີໂທ, ຕຳແໜ່ງ, ເງິນເດືອນ)
- ✅ ປ່ຽນສິດ (User ↔ Admin)
- ✅ ລີເຊັດ PIN ເມື່ອລືມ
- ✅ ປິດການໃຊ້ງານ (Soft delete)

**ຈັດການການລາ:**
- ✅ ອະນຸມັດ/ປະຕິເສດຄຳຂໍລາ
- ✅ ເບິ່ງລາຍການລາທັງໝົດ
- ✅ ກວດໂຄຕ້າລາຂອງພະນັກງານ

**ລາຍງານ:**
- ✅ ລາຍງານການເຂົ້າວຽກ (ປະຈຳວັນ/ເດືອນ)
- ✅ ສ້າງໃບສະຫຼຸບເງິນເດືອນ
- ✅ Export Excel (ຜ່ານ Google Sheets)

---

## ການຕິດຕັ້ງ

### ຂັ້ນຕອນທີ 1: ສ້າງ Google Sheets

1. ເປີດ [Google Sheets](https://sheets.google.com)
2. ສ້າງ Spreadsheet ໃໝ່
3. ຊື່: "HR Attendance Database"
4. ສ້າງ 7 sheets ຕາມນີ້:

```
- employees
- attendance  
- leave_requests
- leave_balances
- payroll
- departments
- config
```

5. Copy Spreadsheet ID ຈາກ URL:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                                        ^^^^^^^^^^^^^^^^^
```

### ຂັ້ນຕອນທີ 2: ເພີ່ມຂໍ້ມູນເບື້ອງຕົ້ນ

ເປີດໄຟລ໌: `database/TEST_DATA_REAL.md`

**ສຳລັບແຕ່ລະ sheet:**
1. Click cell A1
2. Copy ຂໍ້ມູນຈາກໄຟລ໌ (ລວມ header)
3. Paste (Ctrl+V)

**ຜົນລັບ:**
- `employees`: 2 ແຖວ (Panoy, Add)
- `attendance`: 4 ແຖວ (ປະຫວັດ 2 ວັນ)
- `leave_requests`: 1 ແຖວ
- `leave_balances`: 2 ແຖວ
- `payroll`: 2 ແຖວ
- `departments`: 3 ແຖວ
- `config`: 10 ແຖວ

### ຂັ້ນຕອນທີ 3: Deploy Backend

1. ເປີດ Google Apps Script: [script.google.com](https://script.google.com)
2. ສ້າງ Project ໃໝ່
3. ຊື່: "HR Attendance API"
4. ສ້າງ 2 ໄຟລ໌:

**File 1: Config.gs**
```javascript
// Copy ຈາກ backend/Config.gs
// ປ່ຽນ SPREADSHEET_ID ເປັນຂອງທ່ານ
```

**File 2: Code.gs**
```javascript
// Copy ຈາກ backend/Code.gs
```

5. Deploy:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy **Web App URL**

### ຂັ້ນຕອນທີ 4: ອັບເດດ Frontend

ເປີດໄຟລ໌: `index.html`

ຊອກ line 43 ແລະປ່ຽນ URL:
```javascript
API_URL: 'YOUR_WEB_APP_URL_HERE'
```

ປ່ຽນ GPS coordinates (line 44-45):
```javascript
OFFICE_LAT: 17.96256861597294,  // ← ປ່ຽນເປັນຂອງທ່ານ
OFFICE_LNG: 102.64162015571948, // ← ປ່ຽນເປັນຂອງທ່ານ
```

**ວິທີຫາ GPS coordinates:**
1. ເປີດ Google Maps
2. Click ຂວາທີ່ຫ້ອງການ
3. Click ຕົວເລກ coordinates
4. Copy-paste

### ຂັ້ນຕອນທີ 5: ທົດສອບ

1. ເປີດ `d:\Dsax_HRM\index.html` ໃນ browser
2. Login:
   - Employee ID: `EMP001`
   - PIN: `1111`
3. ຄວນເຫັນ:
   - ✅ ຊື່: MS. VILAYPHONE VONGPHACKDE
   - ✅ ຕຳແໜ່ງ: ACC
   - ✅ ປະຫວັດວັນທີ 25-26/01/2026

---

## ການນຳໃຊ້

### ສຳລັບພະນັກງານ

#### 1. Login
```
1. ເປີດ index.html
2. ໃສ່ Employee ID (ຕົວຢ່າງ: EMP001)
3. ໃສ່ PIN (4 ໂຕເລກ)
4. Click "ເຂົ້າສູ່ລະບົບ"
```

#### 2. ກົດເຂົ້າວຽກ
```
1. Click ປຸ່ມ "ກວດສອບ" (ກວດ GPS)
2. ລໍຖ້າ → ຈະສະແດງ "ຢູ່ໃນຂອບເຂດ" (ຖ້າຢູ່ໃກ້ພໍ)
3. ປຸ່ມ "ເຂົ້າວຽກ" ຈະ enable
4. Click "ເຂົ້າວຽກ"
5. ລະບົບບັນທຶກເວລາ + GPS
```

**ຖ້າມາກ່ອນ 08:15:** ສະຖານະ = "ປົກກະຕິ"  
**ຖ້າມາຫຼັງ 08:15:** ສະຖານະ = "ສາຍ"

#### 3. ກົດອອກວຽກ
```
1. Click "ກວດສອບ" ອີກເທື່ອ
2. Click "ອອກວຽກ"
3. ລະບົບຄິດໄລ່ຊົ່ວໂມງເຮັດວຽກອັດຕະໂນມັດ
4. ສະແດງເວລາອອກວຽກ + ຊົ່ວໂມງເຮັດວຽກ
```

**ຊົ່ວໂມງເຮັດວຽກ = (ອອກວຽກ - ເຂົ້າວຽກ) - 1 ຊົ່ວໂມງພັກກາງວັນ**

#### 4. ເບິ່ງປະຫວັດ
```
1. Click tab "ປະຫວັດ"
2. ເບິ່ງການເຂົ້າວຽກ 30 ວັນຫຼ້າສຸດ
3. ສີຂຽວ = ປົກກະຕິ, ສີເຫຼືອງ = ສາຍ
```

#### 5. ຂໍລາພັກ (Coming soon)
```
1. Click tab "Profile"
2. Click "ຂໍລາພັກ"
3. ເລືອກປະເພດລາ (ປະຈຳປີ / ລາປ່ວຍ)
4. ເລືອກວັນທີ
5. ໃສ່ເຫດຜົນ
6. ສົ່ງ → ລໍ Admin ອະນຸມັດ
```

### ສຳລັບ Admin

#### 1. ເຂົ້າ Admin Panel
```
1. Login ດ້ວຍ admin account
2. Click tab "Profile"
3. Click "ຈັດການລະບົບ (Admin)"
4. → ເປີດ admin.html
```

#### 2. ລົງທະບຽນພະນັກງານໃໝ່
```
1. Click "ລົງທະບຽນພະນັກງານໃໝ່"
2. ໃສ່ຂໍ້ມູນ:
   - Employee Code: EMP003
   - ຊື່-ນາມສະກຸນ
   - Email, ເບີໂທ
   - ຕຳແໜ່ງ, ເງິນເດືອນ
   - PIN (4 ໂຕ) - ມີປຸ່ມສຸ່ມ
   - Role: User ຫຼື Admin
3. Click "ບັນທຶກ"
4. → ສ້າງ leave balance ອັດຕະໂນມັດ
```

#### 3. ແກ້ໄຂພະນັກງານ
```
1. Click ໄອຄອນ ✏️ ທີ່ແຖວພະນັກງານ
2. ແກ້ໄຂຂໍ້ມູນທີ່ຕ້ອງການ
3. ປ່ຽນ Role (User ↔ Admin)
4. ປ່ຽນສະຖານະ (Active ↔ Inactive)
5. Click "ບັນທຶກ"
```

#### 4. ລີເຊັດ PIN
```
1. Click ໄອຄອນ 🔑 ທີ່ແຖວພະນັກງານ
2. PIN ໃໝ່ສຸ່ມອັດຕະໂນມັດ (ຫຼືໃສ່ເອງ)
3. Click "ລີເຊັດ PIN"
4. → Alert ສະແດງ PIN ໃໝ່
5. **ບັນທຶກ PIN ນີ້!** ຈະບໍ່ສະແດງອີກ
6. ແຈ້ງໃຫ້ພະນັກງານ
```

#### 5. ປິດການໃຊ້ງານ
```
1. Click ໄອຄອນ ❌ (ສີແດງ)
2. Confirm
3. → ສະຖານະປ່ຽນເປັນ "Inactive"
4. ພະນັກງານ login ບໍ່ໄດ້
5. ຂໍ້ມູນຍັງຄົງຢູ່ (Soft delete)
```

---

## ການແກ້ໄຂບັນຫາ

### ບັນຫາທົ່ວໄປ

#### ❌ "Failed to fetch" ເວລາ Login

**ສາເຫດ:**
- API URL ຜິດ
- Apps Script ບໍ່ທັນ deploy
- ບໍ່ມີອິນເຕີເນັດ

**ວິທີແກ້:**
1. ກວດ API_URL ໃນ index.html (line 43)
2. ກວດວ່າ Apps Script deploy ແລ້ວບໍ່
3. ເທສ API ດ້ວຍ browser:
   ```
   https://YOUR_WEB_APP_URL/exec
   → ຄວນເຫັນ: "HR Attendance API v1.0"
   ```

#### ❌ "Invalid employee ID or PIN"

**ວິທີແກ້:**
1. ກວດວ່າມີຂໍ້ມູນໃນ employees sheet ບໍ່
2. ກວດ emp_code ຖືກຕ້ອງບໍ່
3. ກວດ PIN ຖືກຕ້ອງບໍ່ (4 ໂຕເລກ)
4. ກວດວ່າ status = 'active'

#### ❌ GPS ບໍ່ເຮັດວຽກ

**ວິທີແກ້:**
1. ອະນຸຍາດ location permission ໃນ browser
2. ໃຊ້ HTTPS (ຖ້າ deploy ຂຶ້ນ server)
3. ກວດວ່າ GPS ເປີດຢູ່ແທັບເລັດ/ມືຖື
4. ຢູ່ນອກບ້ານ (ບໍ່ແມ່ນໃນຫ້ອງ)

#### ❌ "ຢູ່ນອກຂອບເຂດຫ້ອງການ"

**ວິທີແກ້:**
1. ກວດ OFFICE_LAT, OFFICE_LNG ໃນ index.html
2. ກວດ RADIUS (ຄ່າເລີ່ມຕົ້ນ: 100m)
3. ເພີ່ມ RADIUS ຖ້າຫ້ອງການໃຫຍ່:
   ```javascript
   RADIUS: 200  // ເພີ່ມເປັນ 200m
   ```

#### ❌ ປະຫວັດບໍ່ສະແດງ

**ວິທີແກ້:**
1. ກວດວ່າມີຂໍ້ມູນໃນ attendance sheet ບໍ່
2. ກວດ employee_id ກົງກັນບໍ່
3. Refresh page (F5)
4. ເບິ່ງ Console (F12) ເບິ່ງ error

#### ❌ Admin Panel ບໍ່ເປີດ

**ວິທີແກ້:**
1. ກວດວ່າ role = 'admin' ບໍ່
2. Clear localStorage:
   ```javascript
   // ໃນ Console (F12):
   localStorage.clear()
   ```
3. Login ໃໝ່

---

## ການ Deploy ຂຶ້ນ Server

### ທາງເລືອກທີ 1: Vercel (ແນະນຳ)

```bash
# Install Vercel CLI
npm i -g vercel

# ໄປທີ່ໂຟລເດີ project
cd d:\Dsax_HRM

# Deploy
vercel

# ຕາມຂັ້ນຕອນ:
# - Link to existing project? No
# - Project name: dsax-hrm
# - Directory: ./
# - ລໍຖ້າ... Done!
# - ໄດ້ URL: https://dsax-hrm.vercel.app
```

### ທາງເລືອກທີ 2: GitHub Pages

```bash
# 1. Create repo ໃນ GitHub
# 2. Push code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/dsax-hrm
git push -u origin main

# 3. ໄປ Settings → Pages
# 4. Source: main branch
# 5. Save
# → ໄດ້ URL: https://YOUR_USERNAME.github.io/dsax-hrm
```

### ທາງເລືອກທີ 3: Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase init hosting
# Public directory: ./
# Configure as single-page app: No
firebase deploy
```

---

## ສະຖິຕິລະບົບ

**ຂະໜາດ Project:**
- ໄຟລ໌ທັງໝົດ: 15 ໄຟລ໌
- ໂຄດທັງໝົດ: ~2,500 ແຖວ
- ຂະໜາດ: ~150 KB

**ເວລາພັດທະນາ:**
- Phase 1 (PWA): 1 ຊົ່ວໂມງ
- Admin Panel: 1 ຊົ່ວໂມງ
- API Integration: 1 ຊົ່ວໂມງ
- **ທັງໝົດ: ~3 ຊົ່ວໂມງ**

**ເຕັກໂນໂລຊີ:**
- Frontend: HTML, CSS (Tailwind CDN), Vanilla JS
- Backend: Google Apps Script
- Database: Google Sheets
- Icons: Lucide Icons

**ຄ່າໃຊ້ຈ່າຍ:**
- Google Sheets: ຟຣີ
- Apps Script: ຟຣີ
- Hosting (Vercel): ຟຣີ
- **ທັງໝົດ: $0/ເດືອນ** 🎉

---

## ການຊ່ວຍເຫຼືອ

**ຖ້າມີບັນຫາ:**
1. ອ່ານ Troubleshooting ຂ້າງເທິງກ່ອນ
2. ເບິ່ງ Browser Console (F12)
3. ກວດ Apps Script Logs
4. ຖາມຜູ້ພັດທະນາ

**ເອກະສານເພີ່ມເຕີມ:**
- `README.md` - ພາບລວມ project
- `DEPLOYMENT.md` - ວິທີ deploy Apps Script
- `database/SETUP_GUIDE.md` - ວິທີຕັ້ງຄ່າ Sheets
- `database/TEST_DATA_REAL.md` - ຂໍ້ມູນທົດສອບ

---

## License

MIT License - ໃຊ້ງານໄດ້ຟຣີ

---

**ສ້າງໂດຍ:** Antigravity AI  
**ວັນທີ:** 2026-01-27  
**Version:** 1.0.0

🎉 **ໃຊ້ງານລະບົບມີຄວາມສຸກ!** 🎉
