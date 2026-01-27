# Google Sheets Database Setup Guide

ຄູ່ມືສ້າງຖານຂໍ້ມູນ Google Sheets ສຳລັບລະບົບ HR Management

---

## 📋 ຂັ້ນຕອນທີ 1: ສ້າງ Google Sheets

1. ເປີດ [Google Sheets](https://sheets.google.com)
2. ກົດ **+ Blank** ເພື່ອສ້າງໃໝ່
3. ຕັ້ງຊື່: `HR_Management_System`
4. ສ້າງ **7 Sheets** ດັ່ງນີ້:

---

## 📊 Sheet 1: employees (ຂໍ້ມູນພະນັກງານ)

### Column Headers (Row 1):
```
A: id (UUID)
B: emp_code (EMP-XXXX)
C: full_name (ຊື່-ນາມສະກຸນ)
D: email
E: phone (020XXXXXXXX)
F: department_id (UUID)
G: position (ຕຳແໜ່ງ)
H: base_salary (ເງິນເດືອນ)
I: pin (4 ໂຕເລກ)
J: role (user/admin)
K: hire_date (YYYY-MM-DD)
L: status (active/inactive)
M: created_at
N: updated_at
```

### Sample Data (Row 2):
```
A: emp-001
B: EMP001
C: ທ. ສົມຈິດ ວິໄລພອນ
D: somjit@company.la
E: 02055667788
F: dept-001
G: Developer
H: 5000000
I: 1234
J: admin
K: 2024-01-01
L: active
M: 2024-01-01 08:00:00
N: 2024-01-01 08:00:00
```

### Data Validation:
- Column B (emp_code): Custom formula `=COUNTIF(B:B,B2)=1` (Unique)
- Column D (email): Data validation > Text contains > @
- Column E (phone): Custom formula `=LEN(E2)=11`
- Column I (pin): Custom formula `=AND(LEN(I2)=4, ISNUMBER(I2))`
- Column J (role): List: `user,admin`
- Column L (status): List: `active,inactive`

---

## 📅 Sheet 2: attendance (ບັນທຶກເຂົ້າວຽກ)

### Column Headers:
```
A: id (UUID)
B: employee_id (FK to employees.id)
C: record_date (YYYY-MM-DD)
D: check_in (HH:MM:SS)
E: check_out (HH:MM:SS)
F: check_in_lat (Latitude)
G: check_in_lng (Longitude)
H: check_out_lat
I: check_out_lng
J: status (on_time/late/absent)
K: work_hours (Decimal)
L: notes
M: created_at
```

### Auto-Calculation Formulas:
```
Column J (status): =IF(D2="","absent",IF(TIME(8,15,0)>=D2,"on_time","late"))
Column K (work_hours): =IF(OR(D2="",E2=""),0,(E2-D2)*24-1)
```

### Sample Data:
```
A: att-001
B: emp-001
C: 2024-01-25
D: 07:55:30
E: 17:05:00
F: 17.96257
G: 102.64162
H: 17.96255
I: 102.64160
J: on_time
K: 9.17
L: 
M: 2024-01-25 07:55:30
```

---

## 🏖️ Sheet 3: leave_requests (ການຂໍລາ)

### Column Headers:
```
A: id (UUID)
B: employee_id (FK)
C: leave_type (sick/annual/personal/other)
D: start_date (YYYY-MM-DD)
E: end_date (YYYY-MM-DD)
F: days (Decimal)
G: reason (ເຫດຜົນ)
H: status (pending/approved/rejected)
I: approved_by (employee_id)
J: approved_at
K: rejection_reason
L: created_at
```

### Auto-Calculation:
```
Column F (days): =NETWORKDAYS(D2,E2)
```

### Data Validation:
- Column C: List: `sick,annual,personal,other`
- Column H: List: `pending,approved,rejected`
- Column E: Custom formula `=E2>=D2` (End >= Start)

---

## 💰 Sheet 4: leave_balances (ໂຄຕ້າການລາ)

### Column Headers:
```
A: id (UUID)
B: employee_id (FK)
C: year (YYYY)
D: annual_quota (ມື້)
E: annual_used (ມື້)
F: annual_remaining (ມື້)
G: sick_quota
H: sick_used
I: sick_remaining
J: updated_at
```

### Auto-Calculation:
```
Column F: =D2-E2
Column I: =G2-H2
```

### Default Values (Per Employee Per Year):
```
D: 15 (annual days)
G: 30 (sick days)
```

---

## 💵 Sheet 5: payroll (ເງິນເດືອນ)

### Column Headers:
```
A: id (UUID)
B: employee_id (FK)
C: month (YYYY-MM)
D: base_salary (ເງິນເດືອນພື້ນຖານ)
E: allowance (ເງິນອຸດໜູນ)
F: ot_hours (ຊົ່ວໂມງ OT)
G: ot_amount (ເງິນ OT)
H: bonus (ໂບນັດ)
I: tax (ພາສີ)
J: social_security (ປະກັນສັງຄົມ)
K: other_deductions (ຫັກອື່ນໆ)
L: net_salary (ເງິນສຸດທິ)
M: payment_date
N: status (draft/paid)
O: created_at
```

### Auto-Calculation Formulas:
```
Column G (OT Amount): =F2*(D2/176)*1.5
Column I (Tax): =IF(D2>4500000,(D2-4500000)*0.1,0)
Column J (Social Security): =D2*0.055
Column L (Net Salary): =D2+E2+G2+H2-I2-J2-K2
```

---

## 🏢 Sheet 6: departments (ພະແນກ)

### Column Headers:
```
A: id (UUID)
B: dept_code (DEPT-XXX)
C: dept_name_lo (ລາວ)
D: dept_name_en (English)
E: manager_id (FK to employees.id)
F: created_at
```

### Sample Data:
```
Row 2: dept-001, DEPT-IT, ພະແນກໄອທີ, IT Department, emp-001, 2024-01-01
Row 3: dept-002, DEPT-HR, ພະແນກບຸກຄະລາກອນ, HR Department, , 2024-01-01
Row 4: dept-003, DEPT-FIN, ພະແນກການເງິນ, Finance Department, , 2024-01-01
```

---

## ⚙️ Sheet 7: config (ຕັ້ງຄ່າລະບົບ)

### Column Headers:
```
A: key
B: value
C: description
D: updated_at
```

### Configuration Values:
```
Row 2: OFFICE_LAT, 17.96256861597294, Latitude ຫ້ອງການ, 2024-01-01
Row 3: OFFICE_LNG, 102.64162015571948, Longitude ຫ້ອງການ, 2024-01-01
Row 4: GPS_RADIUS, 100, ລັດສະໝີ GPS (ແມັດ), 2024-01-01
Row 5: WORK_START, 08:00:00, ເວລາເຂົ້າວຽກ, 2024-01-01
Row 6: WORK_END, 17:00:00, ເວລາອອກວຽກ, 2024-01-01
Row 7: LUNCH_BREAK, 1, ພັກກາງວັນ (ຊົ່ວໂມງ), 2024-01-01
Row 8: OT_RATE, 1.5, ອັດຕາ OT, 2024-01-01
Row 9: LATE_THRESHOLD, 08:15:00, ມາສາຍຖ້າເກີນ, 2024-01-01
Row 10: ANNUAL_LEAVE_QUOTA, 15, ໂຄຕ້າລາປະຈຳປີ, 2024-01-01
Row 11: SICK_LEAVE_QUOTA, 30, ໂຄຕ້າລາປ່ວຍ, 2024-01-01
```

---

## 📌 ຂັ້ນຕອນທີ 2: Deploy Google Apps Script

1. ໃນ Google Sheets, ກົດ **Extensions** > **Apps Script**
2. Copy code ຈາກ `backend/Code.gs` ແລະ `backend/Config.gs`
3. ກົດ **Deploy** > **New Deployment**
4. ເລືອກ **Web app**
5. ຕັ້ງຄ່າ:
   - Execute as: **Me**
   - Who has access: **Anyone** (ສຳລັບ testing)
6. ກົດ **Deploy** ແລະ copy **Web App URL**
7. Paste URL ນີ້ໃສ່ `index.html` ບ່ອນ `CONFIG.API_URL`

---

## 🔒 ຂັ້ນຕອນທີ 3: Security Setup

### Protect Sensitive Columns:
1. ເລືອກ column I (PIN) ໃນ `employees` sheet
2. ກົດຂວາ > **Protect range**
3. ໃສ່ຊື່: "PIN Column - Admin Only"
4. ຕັ້ງ permission: **Only you**

### Share Settings:
- ຖ້າ testing ເທົ່ານັ້ນ: **Restricted** (Specific people)
- ຖ້າ production: ແຊ ກັບ domain ບໍລິສັດເທົ່ານັ້ນ

---

## ✅ ຂັ້ນຕອນທີ 4: Testing

### Test Data Validation:
1. ໃສ່ຂໍ້ມູນຜິດໃນແຕ່ລະ column ທີ່ມີ validation
2. ຄວນເຫັນ error message

### Test Formulas:
1. ໃສ່ check_in = 07:55, check_out = 17:00
2. `work_hours` ຄວນຄິດໄລ່ເປັນ 9.08 (ຫັກກາງວັນ 1 ຊົ່ວໂມງ)
3. `status` ຄວນເປັນ "on_time"

### Test API:
```bash
curl -X POST "[YOUR_WEB_APP_URL]" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","empId":"EMP001","pin":"1234"}'
```

---

## 📝 Notes

- **UUID**: ໃຊ້ format `emp-001`, `att-001` ເພື່ອຄວາມງ່າຍ
- **Dates**: ໃຊ້ format `YYYY-MM-DD` ເສມີ
- **Times**: ໃຊ້ format `HH:MM:SS`
- **Backup**: Google Sheets auto-backup ທຸກໆ version
- **Limits**: 10 ລ້ານ cells = ໃຊ້ໄດ້ 15+ ປີ ສຳລັບ 20 ຄົນ

---

**ສຳເລັດການຕັ້ງຄ່າແລ້ວ!** ✅

ຂັ້ນຕໍ່ໄປ: Deploy Google Apps Script API ແລະເຊື່ອມຕໍ່ກັບ PWA
