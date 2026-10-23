Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Admin\.gemini\antigravity\brain\08480e9d-48c1-4f7a-9fbc-d733ddec5f0c\.user_uploaded\media_1792744958801_cc83bc88.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Host "Scanning for Pink Pixels across entire image (1024x682)..."

$pinkPixels = @()

for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        # Pink: R is high, G is noticeably lower, B is noticeably higher than G
        # e.g., R - G >= 30, B - G >= 10, R >= 210
        if (($c.R - $c.G -ge 25) -and ($c.B - $c.G -ge 8) -and ($c.R -ge 210)) {
            $hex = '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B
            $pinkPixels += [PSCustomObject]@{ X = $x; Y = $y; Hex = $hex; R = $c.R; G = $c.G; B = $c.B }
        }
    }
}

Write-Host "Found $($pinkPixels.Count) pink pixels!"

# Group by location clusters
$clusters = $pinkPixels | Group-Object { [Math]::Floor($_.X / 40) * 40 }, { [Math]::Floor($_.Y / 40) * 40 }
foreach ($cl in $clusters) {
    $first = $cl.Group[0]
    $avgHex = ($cl.Group | Group-Object Hex | Sort-Object Count -Descending | Select-Object -First 1).Name
    Write-Host ("Cluster at X~{0}, Y~{1} (count={2}): Best Hex={3}" -f $first.X, $first.Y, $cl.Group.Count, $avgHex)
}

$bmp.Dispose()
