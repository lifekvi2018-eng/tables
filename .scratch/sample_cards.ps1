Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

function Get-Hex([int]$x, [int]$y) {
    $c = $bmp.GetPixel($x, $y)
    return ('#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B)
}

Write-Host "--- Mobile Calendar Day 12 around x=130, y=260..280 ---"
for ($y = 260; $y -le 280; $y += 3) {
    for ($x = 125; $x -le 135; $x += 3) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

# Scan Mobile date 15 (orange) around x=215, y=260..280
Write-Host "--- Mobile Date 15 (Orange) ---"
for ($y = 260; $y -le 285; $y += 3) {
    for ($x = 210; $x -le 225; $x += 3) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

# Scan Mobile date 28 (Purple) around x=185, y=320..340
Write-Host "--- Mobile Date 28 (Purple) ---"
for ($y = 320; $y -le 340; $y += 3) {
    for ($x = 180; $x -le 195; $x += 3) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

$bmp.Dispose()
