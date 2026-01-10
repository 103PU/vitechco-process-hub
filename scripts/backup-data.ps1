# Configuration
$SourceDir = "D:\TECHNICAL - IT DEPARTMENT"
$BackupDir = "D:\BACKUPS\TECHNICAL_DATA"
$LogFile = "D:\BACKUPS\backup_log.txt"
$DateStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir\TechnicalData_$DateStamp.zip"

# Ensure Backup Directory Exists
if (!(Test-Path -Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Start Backup
$StartTime = Get-Date
Add-Content -Path $LogFile -Value "[$StartTime] Starting backup of $SourceDir to $BackupFile"

try {
    # Compress-Archive requires PowerShell 5.0+
    Compress-Archive -Path "$SourceDir\*" -DestinationPath $BackupFile -CompressionLevel Optimal
    
    $EndTime = Get-Date
    Add-Content -Path $LogFile -Value "[$EndTime] Backup completed successfully."
}
catch {
    $ErrorMsg = $_.Exception.Message
    Add-Content -Path $LogFile -Value "[$StartTime] Backup FAILED: $ErrorMsg"
    Write-Error "Backup failed: $ErrorMsg"
}

# Optional: Retention Policy (Keep last 7 backups)
Get-ChildItem -Path $BackupDir -Filter "TechnicalData_*.zip" | Sort-Object CreationTime -Descending | Select-Object -Skip 7 | Remove-Item -Force
