Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Calendar date 7 (Desktop) at x=642..650, y=320..330..."
for ($y = 320; $y -le 330; $y += 2) {
    for ($x = 642; $x -le 650; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        $hex = '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B
        Write-Host ("x={0} y={1} : Hex={2} (R={3}, G={4}, B={5})" -f $x, $y, $hex, $c.R, $c.G, $c.B)
    }
}

$bmp.Dispose()
