Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792741881259_ded82524.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

function Get-HexAt($x, $y) {
    $c = $bmp.GetPixel($x, $y)
    return "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
}

# Canvas outer background
Write-Output "Canvas Outer BG (10, 10): $(Get-HexAt 10 10)"
Write-Output "Canvas Outer BG (500, 20): $(Get-HexAt 500 20)"

# Desktop window background / desk
Write-Output "Desktop Window Header (450, 60): $(Get-HexAt 450 60)"
Write-Output "Desktop Window Inner BG (600, 100): $(Get-HexAt 600 100)"
Write-Output "Desktop Sidebar BG (360, 200): $(Get-HexAt 360 200)"
Write-Output "Desktop Sidebar Active Tab (360, 130): $(Get-HexAt 360 130)"

# Let's find the circles in 'Мои платежи' on desktop:
# The card 'Мои платежи' is around x=800..950, y=180..350
# Let's scan along x=814 (circle column) from y=240 to 350
Write-Output "--- Scanning 'Мои платежи' circles around x=813 ---"
for ($y = 230; $y -le 350; $y += 5) {
    $c = $bmp.GetPixel(813, $y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Output "y=$y: $hex (R=$($c.R), G=$($c.G), B=$($c.B))"
}

# Let's find the yellow circle in the calendar:
# Calendar on desktop is around x=430..760, y=140..350
# Day 12 is in week 3 (row 3 of dates), Wednesday (column 3)
Write-Output "--- Scanning Desktop Calendar Day 12 around x=555..565, y=245..260 ---"
for ($x = 550; $x -le 570; $x += 5) {
    for ($y = 245; $y -le 260; $y += 5) {
        $c = $bmp.GetPixel($x, $y)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
        Write-Output "x=$x, y=$y: $hex (R=$($c.R), G=$($c.G), B=$($c.B))"
    }
}

# Bottom bento cards on desktop:
# Left card 'Доходы' (green) around x=420, y=420
# Middle card 'Расходы' (pink) around x=640, y=420
# Right card 'Клиенты' (blue) around x=860, y=420
Write-Output "Desktop Bento Доходы (green) (420, 420): $(Get-HexAt 420 420)"
Write-Output "Desktop Bento Расходы (pink) (640, 420): $(Get-HexAt 640 420)"
Write-Output "Desktop Bento Клиенты (blue) (860, 420): $(Get-HexAt 860 420)"

$bmp.Dispose()
