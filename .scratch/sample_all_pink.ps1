Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Image Size: $($bmp.Width) x $($bmp.Height)"

# 1. Circle in 'Мои платежи' -> 'ИИ сервисы' (right list, 3rd dot)
Write-Host "`n--- 1. Pink Dot in 'Мои платежи' -> 'ИИ сервисы' ---"
for ($y = 360; $y -le 380; $y += 2) {
    for ($x = 808; $x -le 822; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -lt 210 -and $c.B -gt 190) {
            Write-Host ("Dot at ({0},{1}): #{2:X2}{3:X2}{4:X2} (R={2}, G={3}, B={4})" -f $x, $y, $c.R, $c.G, $c.B)
        }
    }
}

# 2. Dot in Calendar Date 7 on Phone
Write-Host "`n--- 2. Pink Dot Calendar Phone Date 7 ---"
for ($y = 325; $y -le 340; $y += 2) {
    for ($x = 180; $x -le 195; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -lt 215 -and $c.B -gt 190) {
            Write-Host ("Phone Date 7 at ({0},{1}): #{2:X2}{3:X2}{4:X2}" -f $x, $y, $c.R, $c.G, $c.B)
        }
    }
}

# 3. Dot in Calendar Date 7 on Desktop
Write-Host "`n--- 3. Pink Dot Calendar Desktop Date 7 ---"
for ($y = 325; $y -le 340; $y += 2) {
    for ($x = 640; $x -le 655; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -lt 215 -and $c.B -gt 190) {
            Write-Host ("Desktop Date 7 at ({0},{1}): #{2:X2}{3:X2}{4:X2}" -f $x, $y, $c.R, $c.G, $c.B)
        }
    }
}

# 4. Dot in 'Доходы' -> 'Проект Дизайн' on Desktop
Write-Host "`n--- 4. Pink Dot in 'Доходы' -> 'Проект Дизайн' ---"
for ($y = 740; $y -le 760; $y += 2) {
    for ($x = 345; $x -le 365; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -lt 215 -and $c.B -gt 190) {
            Write-Host ("Доходы Дизайн dot at ({0},{1}): #{2:X2}{3:X2}{4:X2}" -f $x, $y, $c.R, $c.G, $c.B)
        }
    }
}

# 5. Dot in 'Расходы' -> 'ИИ сервисы' on Desktop
Write-Host "`n--- 5. Pink Dot in 'Расходы' -> 'ИИ сервисы' ---"
for ($y = 785; $y -le 805; $y += 2) {
    for ($x = 560; $x -le 575; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -lt 215 -and $c.B -gt 190) {
            Write-Host ("Расходы ИИ dot at ({0},{1}): #{2:X2}{3:X2}{4:X2}" -f $x, $y, $c.R, $c.G, $c.B)
        }
    }
}

$bmp.Dispose()
