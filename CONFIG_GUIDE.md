# ⚙️ Configuration Guide

ວິທີຕັ້ງຄ່າລະບົບກ່ອນໃຊ້ງານ

---

## 🔧 ການຕັ້ງຄ່າທີ່ຕ້ອງເຮັດ

### 1. API_URL (ສຳຄັญທີ່ສຸດ!)

**ຕຳແໜ່ງ:**
- `index.html` → Line 45
- `admin.html` → Line 40 (ປະມານ)

**ປ່ຽນຈາກ:**
```javascript
API_URL: 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'
```

**ເປັນ:**
```javascript
API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
```

**ວິທີຫາ URL:**

1. ໄປ [script.google.com](https://script.google.com)
2. ສ້າງ Project ໃໝ່ → "HR Attendance API"
3. ສ້າງ 2 ໄຟລ໌:
   - `Config.gs` → Copy ຈາກ `backend/Config.gs`
   - `Code.gs` → Copy ຈາກ `backend/Code.gs`
4. ແກ້ໄຂ `Config.gs` line 8:
   ```javascript
   SPREADSHEET_ID: 'YOUR_GOOGLE_SHEETS_ID'
   ```
5. Deploy:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
6. Copy URL ທີ່ໄດ້

---

### 2. SPREADSHEET_ID (Backend)

**ຕຳແໜ່ງ:** `backend/Config.gs` → Line 8

**ວິທີຫາ:**
1. ເປີດ Google Sheets ຂອງທ່ານ
2. ເບິ່ງ URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
                                            ↑ Copy ນີ້
   ```
3. ວາງໃສ່ `Config.gs`

---

### 3. GPS Coordinates (Optional)

**ຕຳແໜ່ງ:**
- `index.html` → Line 47-48
- `backend/Config.gs` → Line 22-23

**ຕອນນີ້:**
```javascript
OFFICE_LAT: 17.962501366620828  // ✅ ອັບເດດແລ້ວ
OFFICE_LNG: 102.64169714794403  // ✅ ອັບເດດແລ້ວ
```

**ຖ້າຕ້ອງການປ່ຽນ:**
1. ເປີດ [Google Maps](https://maps.google.com)
2. Right-click ທີ່ຫ້ອງການ
3. Click ເລກ coordinates
4. ວາງໃສ່ code

---

## ✅ Checklist ກ່ອນ Deploy

- [ ] Deploy Apps Script → ໄດ້ URL
- [ ] ປ່ຽນ `API_URL` ໃນ `index.html`
- [ ] ປ່ຽນ `API_URL` ໃນ `admin.html`
- [ ] ປ່ຽນ `SPREADSHEET_ID` ໃນ `Config.gs`
- [ ] ກວດ GPS coordinates (ຖ້າຕ້ອງການ)
- [ ] ເພີ່ມຂໍ້ມູນທົດສອບໃສ່ Sheets
- [ ] ທົດສອບ login

---

## 🚀 ຫຼັງແກ້ໄຂ

```bash
# Push ຂຶ້ນ GitHub
git add .
git commit -m "config: update API URL and Spreadsheet ID"
git push

# Deploy to Vercel (ຖ້າໃຊ້)
vercel --prod
```

---

## 📝 ຕົວຢ່າງ Complete Config

**index.html (Line 41-50):**
```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbyXXXXXXX/exec',
    OFFICE_LAT: 17.962501366620828,
    OFFICE_LNG: 102.64169714794403,
    RADIUS: 100
};
```

**backend/Config.gs (Line 6-24):**
```javascript
const CONFIG = {
    SPREADSHEET_ID: '1W06LSdqJcCCwMPeM-0b3wXvKprMdMBRcqne8Fc3Mkd4',
    OFFICE_LAT: 17.962501366620828,
    OFFICE_LNG: 102.64169714794403,
    GPS_RADIUS: 100,
    // ... other config
};
```

---

**ສຳເລັດ!** ລະບົບພ້ອມໃຊ້ງານ 🎉
