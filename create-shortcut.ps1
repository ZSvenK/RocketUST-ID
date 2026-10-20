$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "USt-ID Bulk Checker.lnk"
$sc = $ws.CreateShortcut($shortcutPath)
$sc.TargetPath = "c:\UST-ID-Nr_Check\Start-App.bat"
$sc.WorkingDirectory = "c:\UST-ID-Nr_Check"
$sc.IconLocation = "c:\UST-ID-Nr_Check\node_modules\electron\dist\electron.exe,0"
$sc.Description = "USt-ID Bulk Checker (BZSt eVatR) Desktop App"
$sc.Save()
Write-Host "Desktop shortcut created successfully at: $shortcutPath"
