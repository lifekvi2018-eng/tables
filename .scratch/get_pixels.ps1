Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Green circle
for ($y = 210; $y -le 240; $y += 2) {
    for ($x = 825; $x -le 840; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.G -gt $c.R -and $c.G -gt $c.B) {
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
            Write-Output "Green: $hex"
            break
        }
    }
}

# Pink circle
for ($y = 245; $y -le 275; $y += 2) {
    for ($x = 825; $x -le 840; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt $c.B -and $c.R -gt 220 -and $c.B -gt 180) {
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
            Write-Output "Pink: $hex"
            break
        }
    }
}

# Orange circle
for ($y = 280; $y -le 310; $y += 2) {
    for ($x = 825; $x -le 840; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 180 -and $c.B -lt 180) {
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
            Write-Output "Orange: $hex"
            break
        }
    }
}

# Yellow Day 12
for ($y = 240; $y -le 270; $y += 2) {
    for ($x = 550; $x -le 570; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 240 -and $c.G -gt 210 -and $c.B -lt 190) {
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
            Write-Output "Yellow: $hex"
            break
        }
    }
}

# Beige Paper
$p1 = $bmp.GetPixel(50, 50)
$p2 = $bmp.GetPixel(600, 100)
$p3 = $bmp.GetPixel(600, 200)
$p4 = $bmp.GetPixel(360, 250)
$p5 = $bmp.GetPixel(360, 130)

Write-Output ("Desk Outer: #{0:X2}{1:X2}{2:X2}" -f $p1.R, $p1.G, $p1.B)
Write-Output ("Window body: #{0:X2}{1:X2}{2:X2}" -f $p2.R, $p2.G, $p2.B)
Write-Output ("Card paper: #{0:X2}{1:X2}{2:X2}" -f $p3.R, $p3.G, $p3.B)
Write-Output ("Sidebar: #{0:X2}{1:X2}{2:X2}" -f $p4.R, $p4.G, $p4.B)
Write-Output ("Active Tab: #{0:X2}{1:X2}{2:X2}" -f $p5.R, $p5.G, $p5.B)

$bmp.Dispose()
