Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Vertical scan in 'Мои платежи' circles at x=833, y=170..245..."

for ($y = 170; $y -le 245; $y += 3) {
    $c = $bmp.GetPixel(833, $y)
    $hex = '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B
    Write-Host ("y={0} : Hex={1} (R={2}, G={3}, B={4})" -f $y, $hex, $c.R, $c.B, $c.G)
}

$bmp.Dispose()
