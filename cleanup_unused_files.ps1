# ============================================
# HR System - Cleanup Unused Files
# ============================================

Write-Host "🧹 ກຳລັງລຶບໄຟລ໌ທີ່ບໍ່ໃຊ້..." -ForegroundColor Cyan

# Files to delete
$filesToDelete = @(
    "admin_new.html"  # Old test file (replaced by admin.html)
)

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "  ✅ ລຶບແລ້ວ: $file" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "  ❌ ລຶບບໍ່ໄດ້: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  ⚠️  ບໍ່ພົບ: $file" -ForegroundColor Yellow
        $notFoundCount++
    }
}

Write-Host "`n📊 ສະຫຼຸບ:" -ForegroundColor Cyan
Write-Host "  ລຶບສຳເລັດ: $deletedCount ໄຟລ໌" -ForegroundColor Green
if ($notFoundCount -gt 0) {
    Write-Host "  ບໍ່ພົບ: $notFoundCount ໄຟລ໌" -ForegroundColor Yellow
}

Write-Host "`n✨ ສຳເລັດ!" -ForegroundColor Green

# Optional: List remaining important files
Write-Host "`n📁 ໄຟລ໌ສຳຄັນທີ່ຍັງມີຢູ່:" -ForegroundColor Cyan
$importantFiles = @(
    "index.html",
    "admin.html",
    "manifest.json",
    "sw.js"
)

foreach ($file in $importantFiles) {
    if (Test-Path (Join-Path $PSScriptRoot $file)) {
        $size = (Get-Item (Join-Path $PSScriptRoot $file)).Length
        $sizeKB = [math]::Round($size / 1KB, 1)
        Write-Host "  ✓ $file ($sizeKB KB)" -ForegroundColor White
    }
}
