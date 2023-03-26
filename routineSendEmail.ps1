# run as admin in powershell
# Register-ScheduledJob -Name "Daily Emailing" -FilePath ~\path\routineSendEmail.ps1
$path = "~\Downloads"
$date = Get-Date
$fname = $date.year.ToString()+"-"+$date.month.ToString()+"-"+$date.day.ToString()
$target = Get-ChildItem ~\Downloads |Where-Object {$_.FullName -match $fname} |Sort-Object -Property LastWriteTime
if($target.Length -gt 0){
    write-host $target[-1]
    $targetPath = -join ($path, '\', $target[-1].Name)
    if(Test-Path $targetPath){
        # & $PSScriptRoot\emailDailyReport.ps1 -Path $targetPath
        write-host "Sending: "$targetPath
    }
} else {
    write-host "No file to send!"
}
