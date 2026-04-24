# 🚀 ຄູ່ມືຍ້າຍ HRM ລັນເທິງ Windows 11 Server

## 📊 ສະຫຼຸບໂປຣເຈັກ

| ລາຍການ | ລາຍລະອຽດ |
|---|---|
| **Framework** | Node.js + Express.js |
| **Port** | `3000` (ຕາມ `process.env.PORT`) |
| **ຖານຂໍ້ມູນ** | JSON Files ໃນໂຟລເດີ `/data` |
| **ໄຟລ໌ Upload** | ໂຟລເດີ `/uploads` (ຮູບ Selfie + Avatar) |
| **API Routes** | `/api/auth`, `/api/attendance`, `/api/employees`, `/api/leave`, `/api/export` |
| **ໄຟລ໌ Config** | ບໍ່ມີ `.env` (Port default: 3000) |

> [!IMPORTANT]
> ໂຟລເດີ `/data` ຄືຖານຂໍ້ມູນທັງໝົດ. ຕ້ອງໂອນໄປ Server ນຳ.

---

## ✅ ຂັ້ນຕອນ Migration (Windows 11)

### ຂັ້ນ 1: ຕິດຕັ້ງ Software ໃນ Server

| Software | ດາວໂຫຼດຈາກ |
|---|---|
| **Node.js** (LTS) | [nodejs.org](https://nodejs.org) |
| **Cloudflared** | [Cloudflare Downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) → `cloudflared-windows-amd64.exe` |

ຫຼັງຕິດຕັ້ງ Node.js ແລ້ວ ລັນໃນ PowerShell:
```powershell
npm install -g pm2
npm install -g pm2-windows-startup
```

---

### ຂັ້ນ 2: ໂອນໂຟລເດີໂປຣເຈັກ

ກັອບປີ້ `D:\Dsax_HRM\` ໄປ Server (ຜ່ານ USB, LAN Share ຫຼື WinSCP):

```
✅ server/           (ໂຄດ backend)
✅ data/             (ຖານຂໍ້ມູນ JSON - ສຳຄັນ!)
✅ uploads/          (ຮູບ Selfie + Avatar)
✅ js/               (ໂຄດ Frontend)
✅ icons/
✅ public/
✅ index.html
✅ admin.html
✅ package.json
✅ package-lock.json
✅ manifest.json
✅ sw.js
❌ node_modules/    (ຢ່າເອົາ - ໃຫ້ Install ໃໝ່ໃນ Server)
❌ exports/         (ບໍ່ຈຳເປັນ)
❌ *.zip, *.xlsx    (ບໍ່ຈຳເປັນ)
```

---

### ຂັ້ນ 3: ຕິດຕັ້ງ Dependencies

ເປີດ **PowerShell** ໃນ `D:\Dsax_HRM\` ຂອງ Server ແລ້ວລັນ:
```powershell
npm install
```

---

### ຂັ້ນ 4: ທົດສອບກ່ອນ

```powershell
node server/server.js
```
ເປີດ Browser: `http://localhost:3000` → ຕ້ອງເຫັນໜ້າ Login ✅

---

### ຂັ້ນ 5: ລັນດ້ວຍ PM2 (ລັນຕະຫຼອດ + Boot ອັດຕະໂນມັດ)

```powershell
# ຖ້າເຄີຍຕິດ Error ຂັ້ນຕອນກ່ອນໜ້າ ໃຫ້ປົດລັອກ PowerShell ກ່ອນ:
Set-ExecutionPolicy Bypass -Scope Process -Force

# ລັນ App
pm2 start server/server.js --name "HRM_System"

# ຕິດຕັ້ງຕົວຊ່ວຍໃຫ້ລັນຕອນ Boot ສຳລັບ Windows
npm install -g pm2-windows-startup

# ຕັ້ງ Auto-Start ຕອນ Windows Boot
pm2-startup install
pm2 save
```

ກວດສອບ:
```powershell
pm2 list        # ຕ້ອງເຫັນ status: online
pm2 logs        # ໃຊ້ debug ຖ້າ error
```

---

### ຂັ້ນ 6: ຕັ້ງ Cloudflare Tunnel (ເຊື່ອມໂດເມນ)

1. ເບິ່ງໃນ Cloudflare Dashboard → Zero Trust → Networks → Tunnels
2. ເລືອກ Tunnel ຂອງ `hrm.dsaxadvancesole.com` → Configure → ກົດ **Install connector** ເລືອກ Windows
3. **ສຳຄັນ**: ເອົາໄຟລ໌ `cloudflared.exe` ທີ່ໂຫຼດມາໃນຂັ້ນຕອນທີ 1 ແລ້ວມາໄວ້ໃນໂຟລເດີໂປຣເຈັກ `D:\Dsax_HRM\`
4. ເປີດ PowerShell (Run as Administrator) ໃນໂຟລເດີດັ່ງກ່າວ ແລ້ວລັນຄຳສັ່ງ Token:
```powershell
.\cloudflared.exe service install <YOUR_TOKEN_FROM_CLOUDFLARE>
```
*(ຕື່ມ `.\` ທາງໜ້າ ເພື່ອອ້າງອີງເຖິງໄຟລ໌ໂປຣແກຣມໃນໂຟລເດີປັດຈຸບັນ)*

5. ໃນແຖບ Public Hostname ຮັບປະກັນການຕັ້ງຄ່າ:
   - **Type**: ຕ້ອງແມ່ນ `HTTP` ເທົ່ານັ້ນ (ຫ້າມເລືອກ HTTPS ເດັດຂາດ ຖ້າບໍ່ດັ່ງນັ້ນຈະຕິດ Error 1033)
   - **URL**: `localhost:3000` ຫຼື `127.0.0.1:3000`

---

## 🔍 Checklist ກ່ອນໃຊ້ງານຈິງ

- [ ] Node.js ຕິດຕັ້ງໃນ Server ແລ້ວ (`node -v`)
- [ ] PM2 ຕິດຕັ້ງໃນ Server ແລ້ວ (`pm2 -v`)
- [ ] ໂຟລເດີ `/data` (JSON files) ຖືກໂອນໄປ Server ແລ້ວ
- [ ] ໂຟລເດີ `/uploads` ຖືກໂອນໄປ Server ແລ້ວ
- [ ] `npm install` ສຳເລັດ (ບໍ່ມີ Error)
- [ ] `http://localhost:3000` ເຂົ້ໄດ້ ແລະ ເຫັນໜ້າ Login
- [ ] Login ດ້ວຍ Employee Code + PIN ໄດ້
- [ ] PM2 ລັນຢູ່ (`pm2 list` → `online`)
- [ ] Cloudflare Tunnel: Healthy (ຢູ່ Dashboard)
- [ ] `https://hrm.dsaxadvancesole.com` ເຂົ້ໄດ້ ✅
