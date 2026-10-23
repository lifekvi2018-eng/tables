Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Scanning horizontally across right card at y=265, x=780..960..."

for ($x = 780; $x -le 960; $x += 3) {
    $c = $bmp.GetPixel($x, 265)
    $hex = '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B
    if ($c.R -lt 240 -or $c.G -lt 230 -or $c.B -lt 220) {
        Write-Host ("x={0} : Hex={1} (R={2}, G={3}, B={4})" -f $x, $hex, $c.R, $c.G, $c.B)
    }
}

$bmp.Dispose()
