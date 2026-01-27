# 🚀 GitHub Deployment Guide

ວິທີ Push Code ຂຶ້ນ GitHub

---

## ຂັ້ນຕອນທີ 1: Initialize Git

```powershell
# ໄປທີ່ໂຟລເດີ project
cd d:\Dsax_HRM

# Initialize Git repository
git init
```

**ຜົນລັບທີ່ຄາດຫວັງ:**
```
Initialized empty Git repository in d:/Dsax_HRM/.git/
```

---

## ຂັ້ນຕອນທີ 2: ກຳນົດບັນຊີ Git (ຖ້າຍັງບໍ່ທັນ)

```powershell
# ກຳນົດຊື່
git config user.name "fastfare"

# ກຳນົດອີເມລ
git config user.email "tovongphathay@gamil.com"
```

---

## ຂັ້ນຕອນທີ 3: ເພີ່ມ Remote Repository

```powershell
git remote add origin https://github.com/fastfare/HRM_management.git
```

**ກວດສອບ:**
```powershell
git remote -v
```

**ຄວນເຫັນ:**
```
origin  https://github.com/fastfare/HRM_management.git (fetch)
origin  https://github.com/fastfare/HRM_management.git (push)
```

---

## ຂັ້ນຕອນທີ 4: Add ໄຟລ໌ທັງໝົດ

```powershell
git add .
```

**ກວດສອບສິ່ງທີ່ຈະ commit:**
```powershell
git status
```

**ຄວນເຫັນ:**
```
Changes to be committed:
  new file:   README.md
  new file:   index.html
  new file:   admin.html
  ... (ໄຟລ໌ອື່ນໆ)
```

---

## ຂັ້ນຕອນທີ 5: Commit

```powershell
git commit -m "Initial commit: HR Attendance Management System v1.0.0"
```

**ຜົນລັບທີ່ຄາດຫວັງ:**
```
[main (root-commit) abc1234] Initial commit: HR Attendance Management System v1.0.0
 XX files changed, XXXX insertions(+)
 create mode 100644 README.md
 create mode 100644 index.html
 ...
```

---

## ຂັ້ນຕອນທີ 6: Rename Branch to main

```powershell
git branch -M main
```

---

## ຂັ້ນຕອນທີ 7: Push to GitHub

```powershell
git push -u origin main
```

**ຖ້າ repository ມີຂໍ້ມູນແລ້ວ:**
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**ຖ້າຕ້ອງການ force push (ລະວັງ!):**
```powershell
git push -u origin main --force
```

---

## 🔐 ການ Login (ຖ້າຕ້ອງການ)

**ວິທີທີ 1: GitHub CLI**
```powershell
gh auth login
```

**ວິທີທີ 2: Personal Access Token**
1. ໄປ GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. ເລືອກ: repo (ທັງໝົດ)
4. Copy token
5. ເມື່ອ push ຖາມລະຫັດ:
   - Username: `fastfare`
   - Password: `[paste token ນີ້]`

---

## ✅ ກວດສອບຄວາມສຳເລັດ

1. ໄປທີ່: https://github.com/fastfare/HRM_management
2. ກວດເບິ່ງວ່າມີໄຟລ໌ທັງໝົດບໍ່
3. ກວດເບິ່ງ README.md ສະແດງຖືກຕ້ອງບໍ່

---

## 🔄 ອັບເດດໃນອະນາຄົດ

```powershell
# ເມື່ອມີການປ່ຽນແປງ
git add .
git commit -m "ອະທິບາຍການປ່ຽນແປງ"
git push
```

---

## ❌ Troubleshooting

### Error: "Permission denied"
```powershell
# ໃຊ້ HTTPS token authentication
# ຫຼື setup SSH key
```

### Error: "Repository not found"
```powershell
# ກວດວ່າ URL ຖືກຕ້ອງບໍ່
git remote -v
git remote set-url origin https://github.com/fastfare/HRM_management.git
```

### Error: "! [rejected] main -> main (non-fast-forward)"
```powershell
# Option 1: Pull ກ່ອນ
git pull origin main --rebase
git push

# Option 2: Force push (ລະວັງ!)
git push --force
```

---

## 📝 Complete Command Sequence

ສຳລັບ copy-paste:

```powershell
# 1. Initialize
git init

# 2. Configure (ຖ້າຍັງບໍ່ທັນ)
git config user.name "Your Name"
git config user.email "your@email.com"

# 3. Add remote
git remote add origin https://github.com/fastfare/HRM_management.git

# 4. Add files
git add .

# 5. Commit
git commit -m "Initial commit: HR Attendance Management System v1.0.0"

# 6. Rename branch
git branch -M main

# 7. Push
git push -u origin main
```

---

**ຫຼັງຈາກສຳເລັດ:**
- ✅ Code ຂຶ້ນ GitHub ແລ້ວ
- ✅ ສາມາດ deploy ກັບ Vercel ໄດ້
- ✅ ສາມາດ collaborate ກັບທີມໄດ້

**Repository URL:**  
https://github.com/fastfare/HRM_management
