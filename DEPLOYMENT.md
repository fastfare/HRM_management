# 🚀 Google Apps Script Deployment Guide

ຄູ່ມືການ Deploy Backend API ເພື່ອເຊື່ອມຕໍ່ກັບ PWA

---

## 📋 ຂັ້ນຕອນ 1: ເປີດ Apps Script Editor

1. ເປີດ Google Sheets ທີ່ທ່ານສ້າງໄວ້:
   ```
   https://docs.google.com/spreadsheets/d/1W06LSdqJcCCwMPeM-0b3wXvKprMdMBRcqne8Fc3Mkd4/edit
   ```

2. ກົດ **Extensions** (ສິ່ງເສີມ) → **Apps Script**

3. ຈະເປີດໜ້າຕ່າງໃໝ່ທີ່ເປັນ Code Editor

---

## 📝 ຂັ້ນຕອນ 2: Copy Code

### A. ລຶບ Code ເດີມ
- ລຶບ code ທີ່ມີຢູ່ (ປົກກະຕິຈະມີ `function myFunction() {}`)

### B. ສ້າງໄຟລ໌ Config.gs
1. ກົດປຸ່ມ **+** ຂ້າງໆ **Files**
2. ເລືອກ **Script**
3. ຕັ້ງຊື່: `Config.gs`
4. Copy code ຈາກ `backend/Config.gs` ທັງໝົດແລ້ວ Paste

### C. ສ້າງໄຟລ໌ Code.gs
1. ດັບເບິ້ນຄລິກໃສ່ `Code.gs` ເດີມ
2. ລຶບ code ເດີມອອກ
3. Copy code ຈາກ `backend/Code.gs` ທັງໝົດແລ້ວ Paste

**ຜົນລັບ:** ທ່ານຄວນມີ 2 ໄຟລ໌:
```
📁 Files
  ├── Config.gs  ✅
  └── Code.gs    ✅
```

---

## 🔧 ຂັ້ນຕອນ 3: ກວດສອບ Spreadsheet ID

ໃນໄຟລ໌ `Config.gs` ບັນທັດທີ່ 13:

```javascript
SPREADSHEET_ID: '1W06LSdqJcCCwMPeM-0b3wXvKprMdMBRcqne8Fc3Mkd4',
```

✅ **ຖືກຕ້ອງແລ້ວ!** (ຂ້ອຍໄດ້ອັບເດດໃຫ້ແລ້ວ)

---

## 💾 ຂັ້ນຕອນ 4: Save Project

1. ກົດ **💾 Save** (ຫຼື Ctrl+S)
2. ຕັ້ງຊື່ໂປເຈັກ: `HR_Attendance_API`
3. ກົດ **OK**

---

## 🚀 ຂັ້ນຕອນ 5: Deploy Web App

### A. ກົດ Deploy
1. ກົດປຸ່ມ **Deploy** ຂ້າງເທິງຂວາ
2. ເລືອກ **New deployment**

### B. ຕັ້ງຄ່າ Deployment
1. ກົດ **⚙️ Select type** → ເລືອກ **Web app**

2. ຕື່ມຂໍ້ມູນ:
   ```
   Description: HR Attendance API v1.0
   Execute as: Me (your_email@gmail.com)
   Who has access: Anyone
   ```

3. **ສຳຄັນ!** ຕ້ອງເລືອກ:
   - ✅ **Execute as**: **Me** (ບໍ່ແມ່ນ User accessing)
   - ✅ **Who has access**: **Anyone** (ເພື່ອໃຫ້ PWA ເຂົ້າເຖິງໄດ້)

### C. Authorize
1. ກົດ **Deploy**
2. ຈະໃຫ້ Authorize (ອະນຸຍາດ) → ກົດ **Authorize access**
3. ເລືອກບັນຊີ Google ຂອງທ່ານ
4. ອາດຈະເຫັນ warning "Google hasn't verified this app"
   - ກົດ **Advanced**
   - ກົດ **Go to HR_Attendance_API (unsafe)** ← ປອດໄພ! ເພາະເປັນ code ຂອງທ່ານເອງ
5. ກົດ **Allow** ເພື່ອອະນຸຍາດທຸກ permission

---

## 🎯 ຂັ້ນຕອນ 6: Copy Web App URL

ຫຼັງຈາກ Deploy ສຳເລັດ:

1. ທ່ານຈະເຫັນ dialog ທີ່ມີ **Web app URL**:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

2. **Copy URL ນີ້ທັງໝົດ!** (ກົດ Copy)

3. URL ຈະຍາວປະມານ 90-120 ໂຕອັກສອນ

---

## 📝 ຂັ້ນຕອນ 7: ອັບເດດ index.html

1. ເປີດ `d:\Dsax_HRM\index.html`
2. ຊອກຫາ line 43:
   ```javascript
   API_URL: 'https://docs.google.com/spreadsheets/d/...',
   ```

3. **ປ່ຽນເປັນ Web App URL ທີ່ Copy ມາ:**
   ```javascript
   API_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
   ```

4. Save ໄຟລ໌

---

## ✅ ຂັ້ນຕອນ 8: ທົດສອບ API

### Test ດ້ວຍ Browser
1. ເປີດ URL ທີ່ Copy ມາໃນ browser:
   ```
   https://script.google.com/macros/s/YOUR_ID/exec
   ```

2. ຄວນເຫັນ:
   ```json
   {"success":true,"message":"HR Attendance API v1.0"}
   ```

3. ✅ ຖ້າເຫັນແບບນີ້ = Deploy ສຳເລັດ!

### Test Login API (Advanced)
ເປີດ Browser Console (F12) ແລະ run:

```javascript
fetch('YOUR_WEB_APP_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'login',
    empId: 'EMP001',
    pin: '1234'
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

ຄວນເຫັນ:
```json
{
  "success": false,
  "error": "Invalid employee ID or PIN"
}
```
(Error ນີ້ປົກກະຕິເພາະຍັງບໍ່ທັນມີຂໍ້ມູນໃນ employees sheet)

---

## 🔄 ອັບເດດ Code (ຖ້າມີການປ່ຽນແປງ)

ຖ້າທ່ານແກ້ໄຂ Code ພາຍຫຼັງ:

1. Save code (Ctrl+S)
2. ກົດ **Deploy** → **Manage deployments**
3. ກົດ **✏️ Edit** ໃສ່ deployment ປັດຈຸບັນ
4. **New version** → ເລືອກ version ໃໝ່
5. ກົດ **Deploy**

---

## 🐛 Troubleshooting

### ບັນຫາ: "Authorization required"
**ແກ້ໄຂ:**
- Authorize ອີກຄັ້ງ
- ຕ້ອງອະນຸຍາດ Google Sheets permissions

### ບັນຫາ: "Script function not found: doPost"
**ແກ້ໄຂ:**
- ກວດວ່າ copy Code.gs ຖືກຕ້ອງບໍ່
- Function `doPost` ຕ້ອງມີຢູ່

### ບັນຫາ: "Exception: You do not have permission to call SpreadsheetApp.openById"
**ແກ້ໄຂ:**
- Execute as ຕ້ອງເປັນ **Me**
- Re-authorize ອີກຄັ້ງ

### ບັນຫາ: API return empty `{}`
**ແກ້ໄຂ:**
- ກວດ SPREADSHEET_ID ໃນ Config.gs
- ກວດວ່າ Sheets ທ່ານມີ sheet ຊື່ `employees`, `attendance` ແລະອື່ນໆບໍ່

---

## 📊 ຕົວຢ່າງ API Endpoints

ຫຼັງຈາກ deploy ແລ້ວ, ທ່ານສາມາດໃຊ້:

### Login
```bash
POST https://YOUR_WEB_APP_URL
{
  "action": "login",
  "empId": "EMP001",
  "pin": "1234"
}
```

### Check In
```bash
POST https://YOUR_WEB_APP_URL
{
  "action": "checkIn",
  "employeeId": "emp-001",
  "lat": 17.96257,
  "lng": 102.64162
}
```

### Get Attendance History
```bash
POST https://YOUR_WEB_APP_URL
{
  "action": "getAttendanceHistory",
  "employeeId": "emp-001",
  "limit": 30
}
```

---

## 🎉 ຂັ້ນຕອນຕໍ່ໄປ

ຫຼັງຈາກ Deploy ສຳເລັດ:

1. ✅ ອັບເດດ `index.html` ດ້ວຍ Web App URL
2. ✅ ເພີ່ມຂໍ້ມູນພະນັກງານ test ໃນ `employees` sheet
3. ✅ ທົດສອບ Login ຈາກ PWA
4. ✅ ທົດສອບ Check-in/out

---

**ສຳເລັດແລ້ວ!** 🚀 Backend API ພ້ອມໃຊ້ງານແລ້ວ!
