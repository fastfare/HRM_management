# 📊 Sample Data for Google Sheets

ຂໍ້ມູນຕົວຢ່າງສຳລັບ Testing ລະບົບ

---

## Sheet 1: employees (ພະນັກງານ)

Copy ແລະ Paste ໃສ່ Google Sheets ທ່ານ (ແຖວ 1 = Headers, ແຖວ 2-4 = Data):

```
id	emp_code	full_name	email	phone	department_id	position	base_salary	pin	role	hire_date	status	created_at	updated_at
emp-001	EMP001	ທ. ສົມຈິດ ວິໄລພອນ	somjit@company.la	02055667788	dept-001	Developer	5000000	1234	admin	2024-01-01	active	2024-01-01 08:00:00	2024-01-01 08:00:00
emp-002	EMP002	ນ. ວັນນະພອນ ສີວິໄລ	vannaphone@company.la	02099887766	dept-001	Designer	4500000	2345	user	2024-01-15	active	2024-01-15 08:00:00	2024-01-15 08:00:00
emp-003	EMP003	ທ. ບຸນມາ ພົມມະວົງ	bounma@company.la	02077665544	dept-002	HR Manager	6000000	3456	admin	2023-12-01	active	2023-12-01 08:00:00	2023-12-01 08:00:00
```

**Tips:**
1. Copy ທັງໝົດ (ລວມແຖວທຳອິດ)
2. Paste ໃສ່ cell A1 ໃນ Google Sheets
3. ປັບຄວາມກວ້າງ column ເພື່ອເບິ່ງງ່າຍ

---

## Sheet 2: attendance (ການເຂົ້າວຽກ)

```
id	employee_id	record_date	check_in	check_out	check_in_lat	check_in_lng	check_out_lat	check_out_lng	status	work_hours	notes	created_at
att-001	emp-001	2026-01-25	07:55:00	17:05:00	17.96257	102.64162	17.96255	102.64160	on_time	9.17		2026-01-25 07:55:00
att-002	emp-001	2026-01-24	08:20:00	17:30:00	17.96256	102.64163	17.96254	102.64161	late	9.17		2026-01-24 08:20:00
att-003	emp-002	2026-01-25	07:50:00	17:00:00	17.96258	102.64164	17.96256	102.64162	on_time	9.17		2026-01-25 07:50:00
att-004	emp-001	2026-01-23	08:00:00	18:00:00	17.96257	102.64162	17.96255	102.64160	on_time	10.00		2026-01-23 08:00:00
att-005	emp-002	2026-01-24	07:45:00	17:15:00	17.96256	102.64163	17.96254	102.64161	on_time	9.50		2026-01-24 07:45:00
```

---

## Sheet 3: leave_requests (ການຂໍລາ)

```
id	employee_id	leave_type	start_date	end_date	days	reason	status	approved_by	approved_at	rejection_reason	created_at
leave-001	emp-002	sick	2026-02-01	2026-02-02	2	ເຈັບປ່ວຍ	pending				2026-01-25 10:00:00
leave-002	emp-001	annual	2026-02-10	2026-02-14	5	ພັກຜ່ອນປະຈຳປີ	approved	emp-003	2026-01-24 14:30:00		2026-01-23 09:00:00
```

---

## Sheet 4: leave_balances (ໂຄຕ້າລາ)

```
id	employee_id	year	annual_quota	annual_used	annual_remaining	sick_quota	sick_used	sick_remaining	updated_at
bal-001	emp-001	2026	15	5	10	30	0	30	2026-01-24 14:30:00
bal-002	emp-002	2026	15	0	15	30	0	30	2026-01-15 08:00:00
bal-003	emp-003	2026	15	3	12	30	2	28	2026-01-10 10:00:00
```

---

## Sheet 5: payroll (ເງິນເດືອນ)

```
id	employee_id	month	base_salary	allowance	ot_hours	ot_amount	bonus	tax	social_security	other_deductions	net_salary	payment_date	status	created_at
pay-001	emp-001	2026-01	5000000	500000	10	426136	0	50000	275000	0	5601136	2026-02-01	paid	2026-01-31 10:00:00
pay-002	emp-002	2026-01	4500000	300000	5	191761	0	0	247500	0	4744261	2026-02-01	paid	2026-01-31 10:00:00
```

**Formula ອະທິບາຍ:**
- `ot_amount = ot_hours * (base_salary / 176) * 1.5`
  - emp-001: 10 * (5000000/176) * 1.5 = 426,136
- `tax = IF(base_salary > 4500000, (base_salary-4500000)*0.1, 0)`
  - emp-001: (5000000-4500000)*0.1 = 50,000
- `social_security = base_salary * 0.055`
  - emp-001: 5000000 * 0.055 = 275,000
- `net_salary = base_salary + allowance + ot_amount + bonus - tax - social_security - other_deductions`

---

## Sheet 6: departments (ພະແນກ)

```
id	dept_code	dept_name_lo	dept_name_en	manager_id	created_at
dept-001	DEPT-IT	ພະແນກໄອທີ	IT Department	emp-001	2024-01-01 08:00:00
dept-002	DEPT-HR	ພະແນກບຸກຄະລາກອນ	HR Department	emp-003	2024-01-01 08:00:00
dept-003	DEPT-FIN	ພະແນກການເງິນ	Finance Department		2024-01-01 08:00:00
dept-004	DEPT-MKT	ພະແນກການຕະຫຼາດ	Marketing Department		2024-01-01 08:00:00
```

---

## Sheet 7: config (ຕັ້ງຄ່າ)

```
key	value	description	updated_at
OFFICE_LAT	17.96256861597294	Latitude ຫ້ອງການ	2026-01-26 18:00:00
OFFICE_LNG	102.64162015571948	Longitude ຫ້ອງການ	2026-01-26 18:00:00
GPS_RADIUS	100	ລັດສະໝີ GPS (ແມັດ)	2026-01-26 18:00:00
WORK_START	08:00:00	ເວລາເຂົ້າວຽກ	2026-01-26 18:00:00
WORK_END	17:00:00	ເວລາອອກວຽກ	2026-01-26 18:00:00
LUNCH_BREAK	1	ພັກກາງວັນ (ຊົ່ວໂມງ)	2026-01-26 18:00:00
OT_RATE	1.5	ອັດຕາ OT	2026-01-26 18:00:00
LATE_THRESHOLD	08:15:00	ມາສາຍຖ້າເກີນ	2026-01-26 18:00:00
ANNUAL_LEAVE_QUOTA	15	ໂຄຕ້າລາປະຈຳປີ (ມື້)	2026-01-26 18:00:00
SICK_LEAVE_QUOTA	30	ໂຄຕ້າລາປ່ວຍ (ມື້)	2026-01-26 18:00:00
```

---

## 📌 ວິທີໃຊ້ (Quick Copy-Paste)

### ວິທີທີ 1: Copy ທັງໝົດ (ແນະນຳ)

1. ເປີດແຕ່ລະ section ຂ້າງເທິງ
2. Select ທັງໝົດ (ລວມແຖວ header)
3. Copy (Ctrl+C)
4. ໄປ Google Sheets → ເລືອກ sheet ທີ່ຖືກຕ້ອງ
5. Click ທີ່ cell A1
6. Paste (Ctrl+V)
7. ເຊັກວ່າຂໍ້ມູນຖືກຕ້ອງ

### ວິທີທີ 2: Import CSV (ຖ້າ Paste ບໍ່ໄດ້)

1. Copy ຂໍ້ມູນຂ້າງເທິງ
2. Paste ໃສ່ Notepad
3. Save as `.csv` file
4. ໃນ Google Sheets: File → Import → Upload
5. ເລືອກໄຟລ໌ .csv
6. Import

---

## ✅ Data Validation (ຕັ້ງຫຼັງຈາກ Paste)

### employees sheet:
1. Column I (PIN): 
   - Select column I
   - Data → Data validation
   - Criteria: Custom formula: `=AND(LEN(I2)=4, ISNUMBER(I2))`

2. Column J (role):
   - Select column J
   - Data → Data validation
   - Criteria: List of items: `user,admin`

3. Column L (status):
   - Select column L
   - Data → Data validation
   - Criteria: List of items: `active,inactive`

---

## 🧪 Testing Data

ຫຼັງຈາກ paste ຂໍ້ມູນແລ້ວ, ທ່ານສາມາດທົດສອບດ້ວຍ:

### Login Credentials:
```
EMP001 / PIN: 1234 (Admin)
EMP002 / PIN: 2345 (User)
EMP003 / PIN: 3456 (Admin - HR)
```

### Expected Results:
- ✅ Login ດ້ວຍ EMP001/1234 ຄວນສຳເລັດ
- ✅ ເບິ່ງປະຫວັດການເຂົ້າວຽກຄວນເຫັນ 5 ແຖວ
- ✅ Leave balance ຄວນສະແດງ: Annual 10/15, Sick 30/30

---

## 📝 Notes

- **IDs**: ໃຊ້ format `emp-001`, `att-001` ເພື່ອຄວາມງ່າຍ (ບໍ່ແມ່ນ UUID)
- **Dates**: Format `YYYY-MM-DD` (ເຊັ່ນ: 2026-01-25)
- **Times**: Format `HH:MM:SS` (ເຊັ່ນ: 08:00:00)
- **GPS**: ໃຊ້ 5-8 ທົດສະນິຍົມ (ເຊັ່ນ: 17.96257)
- **Salary**: ຕົວເລກບໍ່ມີຈຸດຄ່ອມ (ເຊັ່ນ: 5000000)

---

**ສຳເລັດ!** 🎉 ຂໍ້ມູນ test ພ້ອມໃຊ້ງານແລ້ວ
