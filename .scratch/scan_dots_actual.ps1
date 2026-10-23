Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Scanning 'Мои платежи' dots at x=814, y=200..340..."

for ($y = 200; $y -le 340; $y += 2) {
    $c = $bmp.GetPixel(814, $y)
    $hex = '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B
    # Only print when not background (background is #F9EFE5 or similar)
    if ($c.R -lt 245 -or $c.G -lt 235 -or $c.B -lt 225) {
        Write-Host ("y={0} : Hex={1} (R={2}, G={3}, B={4})" -f $y, $hex, $c.R, $c.G, $c.B)
    }
}

$bmp.Dispose()
