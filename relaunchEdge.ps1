# change the path below
$path2html = "$home\Documents\github\service-desk-sign-in"
Get-Process -Name "*Edge*" | ForEach-Object {$_.CloseMainWindow() | Out-Null} | Stop-Process
Start-Process -FilePath msedge -ArgumentList file:///$($path2html)/index.html
Start-Process -FilePath msedge -ArgumentList file:///$($path2html)/show_walkins.html

