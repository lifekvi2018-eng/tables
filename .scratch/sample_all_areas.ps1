Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

function Sample-Area([string]$name, [int]$x1, [int]$y1, [int]$x2, [int]$y2) {
    Write-Host "`n=== $name (x=$x1..$x2, y=$y1..$y2) ==="
    $colors = @{}
    for ($y = $y1; $y -le $y2; $y++) {
        for ($x = $x1; $x -le $x2; $x++) {
            $c = $bmp.GetPixel($x, $y)
            $hex = '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B
            if (-not $colors.ContainsKey($hex)) { $colors[$hex] = 0 }
            $colors[$hex]++
        }
    }
    $colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 6 | ForEach-Object {
        Write-Host "  Color: $($_.Key)  Count: $($_.Value)"
    }
}

Sample-Area "1. Dot AI services in right list" 812 368 820 376
Sample-Area "2. Date 7 Phone Calendar" 184 326 192 334
Sample-Area "3. Date 7 Desktop Calendar" 640 320 652 332
Sample-Area "4. Dot Income Design" 344 744 354 754
Sample-Area "5. Mobile Expenses Card Background" 130 460 170 475
Sample-Area "6. Desktop Expenses Header" 600 385 660 405
Sample-Area "7. Desktop Expenses Card Body" 600 450 660 500

$bmp.Dispose()
