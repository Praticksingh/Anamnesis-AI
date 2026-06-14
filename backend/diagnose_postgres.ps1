Get-Service | Where-Object { $_.Name -like '*postgres*' -or $_.DisplayName -like '*postgres*' } | Select-Object Name,DisplayName,Status | Format-Table -AutoSize
Write-Host '---'
Get-Command psql -ErrorAction SilentlyContinue | Select-Object Name,Source | Format-Table -AutoSize
Write-Host '---'
Get-Command postgres -ErrorAction SilentlyContinue | Select-Object Name,Source | Format-Table -AutoSize
