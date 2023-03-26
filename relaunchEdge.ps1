# change the path below
$path2html = "C:/Users/toshi/Dropbox/GitHub/save2file"
Get-Process -Name "*Edge*" | Stop-Process
Start-Process -FilePath msedge -ArgumentList file:///$($path2html)/index.html
Start-Process -FilePath msedge -ArgumentList file:///$($path2html)/show_walkins.html

