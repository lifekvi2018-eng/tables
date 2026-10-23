Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg')
Write-Host "Width=$($b.Width) Height=$($b.Height)"
$b.Dispose()
