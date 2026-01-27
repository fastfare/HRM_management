# 📊 Test Data - Real Employees

ຂໍ້ມູນທົດສອບດ້ວຍພະນັກງານຈິງຂອງທ່ານ (2 ຄົນ)

---

## 🔑 Login Credentials

| Employee | Employee Code | PIN | Position |
|----------|---------------|-----|----------|
| Panoy (ACC) | EMP001 | 1111 | ACC |
| Add (DRIVER) | EMP002 | 2222 | DRIVER |

---

## 📋 Sheet 1: employees

**Copy ແຖວນີ້ທັງໝົດ (ລວມ header) ແລະ paste ໃສ່ Google Sheets:**

```
id	emp_code	full_name	email	phone	department_id	position	base_salary	pin	role	hire_date	status	created_at	updated_at
emp-001	EMP001	MS. VILAYPHONE VONGPHACKDE	panoy@company.la	856 20 5443 4723	dept-002	ACC	4500000	1111	user	2024-01-15	active	2024-01-15 08:00:00	2024-01-15 08:00:00
emp-002	EMP002	Mr. THAVONE CHANTHY	add@company.la	856 20 5495 7185	dept-003	DRIVER	3500000	2222	user	2024-02-01	active	2024-02-01 08:00:00	2024-02-01 08:00:00
```

---

## 📋 Sheet 2: attendance (ຕົວຢ່າງປະຫວັດ)

**Copy ແລະ paste:**

```
id	employee_id	record_date	check_in	check_out	check_in_lat	check_in_lng	check_out_lat	check_out_lng	status	work_hours	notes	created_at
att-001	emp-001	2026-01-26	08:05:00	17:00:00	17.96257	102.64162	17.96255	102.64160	on_time	8.92		2026-01-26 08:05:00
att-002	emp-002	2026-01-26	07:50:00	17:10:00	17.96258	102.64163	17.96256	102.64161	on_time	9.33		2026-01-26 07:50:00
att-003	emp-001	2026-01-25	08:15:00	17:05:00	17.96257	102.64162	17.96255	102.64160	late	8.83		2026-01-25 08:15:00
att-004	emp-002	2026-01-25	07:45:00	17:00:00	17.96258	102.64163	17.96256	102.64161	on_time	9.25		2026-01-25 07:45:00
```

---

## 📋 Sheet 3: leave_requests

**Copy ແລະ paste:**

```
id	employee_id	leave_type	start_date	end_date	days	reason	status	approved_by	approved_at	rejection_reason	created_at
leave-001	emp-001	sick	2026-02-05	2026-02-06	2	ເຈັບປ່ວຍ	pending				2026-01-26 10:00:00
```

---

## 📋 Sheet 4: leave_balances

**Copy ແລະ paste:**

```
id	employee_id	year	annual_quota	annual_used	annual_remaining	sick_quota	sick_used	sick_remaining	updated_at
bal-001	emp-001	2026	15	0	15	30	0	30	2026-01-15 08:00:00
bal-002	emp-002	2026	15	0	15	30	0	30	2026-02-01 08:00:00
```

---

## 📋 Sheet 5: payroll

**Copy ແລະ paste:**

```
id	employee_id	month	base_salary	allowance	ot_hours	ot_amount	bonus	tax	social_security	other_deductions	net_salary	payment_date	status	created_at
pay-001	emp-001	2026-01	4500000	300000	5	127841	0	0	232500	0	4695341	2026-02-01	paid	2026-01-31 10:00:00
pay-002	emp-002	2026-01	3500000	200000	8	159091	0	0	180500	0	3678591	2026-02-01	paid	2026-01-31 10:00:00
```

**Calculation formulas:**
- OT Amount = (ot_hours × base_salary/176 × 1.5)
- Social Security = base_salary × 0.055 × 1.05
- Net Salary = base_salary + allowance + ot_amount + bonus - tax - social_security

---

## 📋 Sheet 6: departments

**Copy ແລະ paste:**

```
id	dept_code	dept_name_lo	dept_name_en	manager_id	created_at
dept-001	DEPT-HR	ພະແນກບຸກຄະລາກອນ	HR Department		2024-01-01 08:00:00
dept-002	DEPT-ACC	ພະແນກບັນຊີ	Accounting Department		2024-01-01 08:00:00
dept-003	DEPT-OPS	ພະແນກປະຕິບັດງານ	Operations Department		2024-01-01 08:00:00
```

---

## 📋 Sheet 7: config

**Copy ແລະ paste:**

```
key	value	description	updated_at
OFFICE_LAT	17.96256861597294	Latitude ຫ້ອງການ	2026-01-27 10:00:00
OFFICE_LNG	102.64162015571948	Longitude ຫ້ອງການ	2026-01-27 10:00:00
GPS_RADIUS	100	ລັດສະໝີ GPS (ແມັດ)	2026-01-27 10:00:00
WORK_START	08:00:00	ເວລາເຂົ້າວຽກ	2026-01-27 10:00:00
WORK_END	17:00:00	ເວລາອອກວຽກ	2026-01-27 10:00:00
LUNCH_BREAK	1	ພັກກາງວັນ (ຊົ່ວໂມງ)	2026-01-27 10:00:00
OT_RATE	1.5	ອັດຕາ OT	2026-01-27 10:00:00
LATE_THRESHOLD	08:15:00	ມາສາຍຖ້າເກີນ	2026-01-27 10:00:00
ANNUAL_LEAVE_QUOTA	15	ໂຄຕ້າລາປະຈຳປີ (ມື້)	2026-01-27 10:00:00
SICK_LEAVE_QUOTA	30	ໂຄຕ້າລາປ່ວຍ (ມື້)	2026-01-27 10:00:00
```

---

## 🎯 ວິທີໃຊ້

### ຂັ້ນຕອນ 1: ເປີດ Google Sheets
```
https://docs.google.com/spreadsheets/d/1W06LSdqJcCCwMPeM-0b3wXvKprMdMBRcqne8Fc3Mkd4/edit
```

### ຂັ້ນຕອນ 2: Paste ຂໍ້ມູນ

**ສຳລັບແຕ່ລະ sheet:**

1. **employees sheet:**
   - Click ທີ່ cell A1
   - Copy ຂໍ້ມູນຂ້າງເທິງ (ລວມ header)
   - Paste (Ctrl+V)
   - ຄວນມີ 3 ແຖວ (header + 2 employees)

2. **attendance sheet:**
   - Click ທີ່ cell A1
   - Copy & Paste
   - ຄວນມີ 5 ແຖວ (header + 4 records)

3. **leave_requests sheet:**
   - Click A1, Copy & Paste
   - 2 ແຖວ (header + 1 request)

4. **leave_balances sheet:**
   - Click A1, Copy & Paste
   - 3 ແຖວ (header + 2 balances)

5. **payroll sheet:**
   - Click A1, Copy & Paste
   - 3 ແຖວ (header + 2 payrolls)

6. **departments sheet:**
   - Click A1, Copy & Paste
   - 4 ແຖວ (header + 3 depts)

7. **config sheet:**
   - Click A1, Copy & Paste
   - 11 ແຖວ (header + 10 configs)

---

## ✅ ກວດສອບວ່າຖືກຕ້ອງ

ຫຼັງຈາກ paste ແລ້ວ, ກວດວ່າ:

**employees sheet:**
- ✅ Row 2: EMP001 - MS. VILAYPHONE VONGPHACKDE - PIN: 1111
- ✅ Row 3: EMP002 - Mr. THAVONE CHANTHY - PIN: 2222

**attendance sheet:**
- ✅ ມີປະຫວັດວັນທີ 25-26/01/2026
- ✅ ທັງສອງຄົນມີການເຂົ້າວຽກ

**leave_balances sheet:**
- ✅ ທັງສອງຄົນມີ annual: 15, sick: 30

---

## 🎮 ທົດສອບ Login

ຫຼັງຈາກ paste ຂໍ້ມູນແລ້ວ:

**Test 1: Login ເປັນ ACC (Panoy)**
```
Employee ID: EMP001
PIN: 1111
```

**Test 2: Login ເປັນ DRIVER (Add)**
```
Employee ID: EMP002
PIN: 2222
```

**Expected Results:**
- ✅ Login ສຳເລັດ
- ✅ ເຫັນຊື່ພະນັກງານຈິງ
- ✅ ເຫັນຕຳແໜ່ງທີ່ຖືກຕ້ອງ (ACC, DRIVER)
- ✅ History ສະແດງປະຫວັດວັນທີ 25-26/01
- ✅ Check-in/out ໃໝ່ໄດ້

---

## 📝 Notes

**Employee Codes:**
- EMP001 = Panoy (ACC) - Accountant
- EMP002 = Add (DRIVER) - Driver

**PINs:**
- ງ່າຍຈື່ມ: 1111, 2222
- ປ່ຽນໄດ້ຖ້າຕ້ອງການ

**Departments:**
- dept-002 = Accounting (ສຳລັບ Panoy)
- dept-003 = Operations (ສຳລັບ Add)

**Salaries:**
- ACC: 4,500,000 LAK
- DRIVER: 3,500,000 LAK

---

**ພ້ອມໃຊ້ງານ!** 🎉

ຫຼັງຈາກ paste ຂໍ້ມູນແລ້ວ, ທ່ານສາມາດ:
1. Login ດ້ວຍ EMP001/1111 ຫຼື EMP002/2222
2. ເບິ່ງປະຫວັດການເຂົ້າວຽກ
3. ກົດເຂົ້າ-ອອກວຽກໃໝ່
4. ທົດສອບ Admin Panel (ຖ້າເພີ່ມ admin user)
