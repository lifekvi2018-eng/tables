Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "--- Mobile Card 'Расходы' Background Pixels (x=100..200, y=445..470) ---"
$colors = @{}
for ($y = 445; $y -le 470; $y += 3) {
    for ($x = 110; $x -le 200; $x += 10) {
        $c = $bmp.GetPixel($x, $y)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
        $colors[$hex] = 1
    }
}
$colors.Keys | Sort-Object | ForEach-Object { Write-Host $_ }

Write-Host "--- Desktop Bento Card 'Расходы' Header (x=580..680, y=365..395) ---"
$dColors = @{}
for ($y = 365; $y -le 395; $y += 4) {
    for ($x = 580; $x -le 680; $x += 15) {
        $c = $bmp.GetPixel($x, $y)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
        $dColors[$hex] = 1
    }
}
$dColors.Keys | Sort-Object | ForEach-Object { Write-Host $_ }

$bmp.Dispose()
