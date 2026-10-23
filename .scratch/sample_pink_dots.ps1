Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

function Get-Hex([int]$x, [int]$y) {
    $c = $bmp.GetPixel($x, $y)
    return ('#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B)
}

Write-Host "--- 1. Circle in Right List (AI services) ---"
for ($y = 365; $y -le 376; $y += 2) {
    for ($x = 810; $x -le 820; $x += 2) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

Write-Host "--- 2. Phone Calendar Date 7 ---"
for ($y = 325; $y -le 336; $y += 2) {
    for ($x = 183; $x -le 192; $x += 2) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

Write-Host "--- 3. Phone Calendar Date 21 ---"
for ($y = 410; $y -le 420; $y += 2) {
    for ($x = 183; $x -le 192; $x += 2) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

Write-Host "--- 4. Dot Income Design ---"
for ($y = 745; $y -le 755; $y += 2) {
    for ($x = 345; $x -le 355; $x += 2) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

Write-Host "--- 5. Dot Expense AI ---"
for ($y = 790; $y -le 800; $y += 2) {
    for ($x = 560; $x -le 570; $x += 2) {
        Write-Host ("x=" + $x + " y=" + $y + " : " + (Get-Hex $x $y))
    }
}

$bmp.Dispose()
