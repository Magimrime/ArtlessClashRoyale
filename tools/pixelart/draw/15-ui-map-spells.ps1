. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# ================================= UI ========================================

Save-Sprite -Category ui -Name button-orange -Size 16 -Palette @('#7a4010','#b5651d','#e08a2c','#f5b160') -Draw {
    param($g)
    $dk = B '#7a4010'; $md = B '#b5651d'; $lt = B '#e08a2c'; $hi = B '#f5b160'
    $g.FillEllipse($dk, 0.0, 1.0, 16.0, 14.0)
    $g.FillEllipse($md, 0.8, 1.8, 14.4, 12.0)
    $g.FillEllipse($lt, 1.4, 2.4, 13.2, 7.0)
    $g.FillEllipse($hi, 3.0, 3.0, 9.0, 3.0)
}

Save-Sprite -Category ui -Name button-blue -Size 16 -Palette @('#12305c','#1d4b8c','#3273c9','#6fa8ea') -Draw {
    param($g)
    $dk = B '#12305c'; $md = B '#1d4b8c'; $lt = B '#3273c9'; $hi = B '#6fa8ea'
    $g.FillEllipse($dk, 0.0, 1.0, 16.0, 14.0)
    $g.FillEllipse($md, 0.8, 1.8, 14.4, 12.0)
    $g.FillEllipse($lt, 1.4, 2.4, 13.2, 7.0)
    $g.FillEllipse($hi, 3.0, 3.0, 9.0, 3.0)
}

Save-Sprite -Category ui -Name button-purple -Size 16 -Palette @('#2e1548','#4a2472','#7b45b0','#b07fd8') -Draw {
    param($g)
    $dk = B '#2e1548'; $md = B '#4a2472'; $lt = B '#7b45b0'; $hi = B '#b07fd8'
    $g.FillEllipse($dk, 0.0, 1.0, 16.0, 14.0)
    $g.FillEllipse($md, 0.8, 1.8, 14.4, 12.0)
    $g.FillEllipse($lt, 1.4, 2.4, 13.2, 7.0)
    $g.FillEllipse($hi, 3.0, 3.0, 9.0, 3.0)
}

Save-Sprite -Category ui -Name button-red -Size 16 -Palette @('#5a1414','#8c2020','#c93b3b','#ea7f7f') -Draw {
    param($g)
    $dk = B '#5a1414'; $md = B '#8c2020'; $lt = B '#c93b3b'; $hi = B '#ea7f7f'
    $g.FillEllipse($dk, 0.0, 1.0, 16.0, 14.0)
    $g.FillEllipse($md, 0.8, 1.8, 14.4, 12.0)
    $g.FillEllipse($lt, 1.4, 2.4, 13.2, 7.0)
    $g.FillEllipse($hi, 3.0, 3.0, 9.0, 3.0)
}

# Crown — three spikes, banded base, red gem
Save-Sprite -Category ui -Name crown-gold -Size 16 -Palette @('#6b4405','#a97a10','#e8b830','#ffe08a','#c93b3b') -Draw {
    param($g)
    $dk = B '#6b4405'; $md = B '#a97a10'; $lt = B '#e8b830'; $hi = B '#ffe08a'; $gem = B '#c93b3b'
    $out = @( (New-Object System.Drawing.PointF(1.4,13.4)), (New-Object System.Drawing.PointF(1.4,3.6)),
              (New-Object System.Drawing.PointF(4.9,8.4)),  (New-Object System.Drawing.PointF(8.0,2.2)),
              (New-Object System.Drawing.PointF(11.1,8.4)), (New-Object System.Drawing.PointF(14.6,3.6)),
              (New-Object System.Drawing.PointF(14.6,13.4)) )
    $g.FillPolygon($dk, $out)
    $ins = @( (New-Object System.Drawing.PointF(2.6,12.6)), (New-Object System.Drawing.PointF(2.6,5.8)),
              (New-Object System.Drawing.PointF(5.1,9.6)),  (New-Object System.Drawing.PointF(8.0,4.6)),
              (New-Object System.Drawing.PointF(10.9,9.6)), (New-Object System.Drawing.PointF(13.4,5.8)),
              (New-Object System.Drawing.PointF(13.4,12.6)) )
    $g.FillPolygon($md, $ins)
    $g.FillRectangle($dk, 1.4, 10.4, 13.2, 3.0)      # base band
    $g.FillRectangle($lt, 2.2, 11.0, 11.6, 1.7)
    $g.FillEllipse($gem, 6.9, 10.9, 2.2, 2.0)        # centre gem
    $g.FillEllipse($hi, 7.2, 2.6, 1.7, 1.7)          # spike tips
    $g.FillEllipse($hi, 0.9, 3.4, 1.7, 1.7)
    $g.FillEllipse($hi, 13.4, 3.4, 1.7, 1.7)
}

# Gem — faceted purple jewel
Save-Sprite -Category ui -Name gem-purple -Size 16 -Palette @('#2a0d52','#6b28b8','#9b55e8','#d2a6ff') -Draw {
    param($g)
    $dk = B '#2a0d52'; $md = B '#6b28b8'; $lt = B '#9b55e8'; $hi = B '#d2a6ff'
    $out = @( (New-Object System.Drawing.PointF(4.2,3.0)),  (New-Object System.Drawing.PointF(11.8,3.0)),
              (New-Object System.Drawing.PointF(14.8,7.4)), (New-Object System.Drawing.PointF(8.0,14.8)),
              (New-Object System.Drawing.PointF(1.2,7.4)) )
    $g.FillPolygon($dk, $out)
    $ins = @( (New-Object System.Drawing.PointF(5.0,4.2)),  (New-Object System.Drawing.PointF(11.0,4.2)),
              (New-Object System.Drawing.PointF(13.3,7.7)), (New-Object System.Drawing.PointF(8.0,13.3)),
              (New-Object System.Drawing.PointF(2.7,7.7)) )
    $g.FillPolygon($md, $ins)
    $top = @( (New-Object System.Drawing.PointF(5.0,4.2)), (New-Object System.Drawing.PointF(11.0,4.2)),
              (New-Object System.Drawing.PointF(8.0,8.4)) )
    $g.FillPolygon($lt, $top)
    $shn = @( (New-Object System.Drawing.PointF(5.7,4.9)), (New-Object System.Drawing.PointF(8.4,4.9)),
              (New-Object System.Drawing.PointF(6.9,7.2)) )
    $g.FillPolygon($hi, $shn)
}

# Gear — eight teeth, hollow hub
Save-Sprite -Category ui -Name gear -Size 16 -Palette @('#2b3038','#565f6b','#8b98a8','#c6d2de') -Draw {
    param($g)
    $dk = B '#2b3038'; $md = B '#565f6b'; $lt = B '#8b98a8'; $hi = B '#c6d2de'
    $g.FillRectangle($md, 5.6, 0.2, 4.8, 15.6)       # N/S teeth
    $g.FillRectangle($md, 0.2, 5.6, 15.6, 4.8)       # E/W teeth
    $dr = @( (New-Object System.Drawing.PointF(8.9,11.7)), (New-Object System.Drawing.PointF(11.9,14.7)),
             (New-Object System.Drawing.PointF(14.7,11.9)), (New-Object System.Drawing.PointF(11.7,8.9)) )
    $g.FillPolygon($md, $dr)
    $dl = @( (New-Object System.Drawing.PointF(7.1,11.7)), (New-Object System.Drawing.PointF(4.1,14.7)),
             (New-Object System.Drawing.PointF(1.3,11.9)), (New-Object System.Drawing.PointF(4.3,8.9)) )
    $g.FillPolygon($md, $dl)
    $ur = @( (New-Object System.Drawing.PointF(8.9,4.3)), (New-Object System.Drawing.PointF(11.9,1.3)),
             (New-Object System.Drawing.PointF(14.7,4.1)), (New-Object System.Drawing.PointF(11.7,7.1)) )
    $g.FillPolygon($md, $ur)
    $ul = @( (New-Object System.Drawing.PointF(7.1,4.3)), (New-Object System.Drawing.PointF(4.1,1.3)),
             (New-Object System.Drawing.PointF(1.3,4.1)), (New-Object System.Drawing.PointF(4.3,7.1)) )
    $g.FillPolygon($md, $ul)
    $g.FillEllipse($md, 1.4, 1.4, 13.2, 13.2)        # body
    $g.FillEllipse($lt, 2.6, 2.6, 10.8, 10.8)
    $g.FillEllipse($hi, 4.0, 3.6, 4.2, 3.2)          # shine
    $g.FillEllipse($dk, 5.4, 5.4, 5.2, 5.2)          # hub hole
}

# Checkmark — fat green tick
Save-Sprite -Category ui -Name checkmark -Size 16 -Palette @('#12401e','#2e8b45','#5fd47a','#b8f0c4') -Draw {
    param($g)
    $g.DrawLine((P '#12401e' 4.6), 2.6, 8.2, 6.4, 12.4)
    $g.DrawLine((P '#12401e' 4.6), 6.4, 12.4, 13.4, 3.2)
    $g.DrawLine((P '#2e8b45' 3.0), 2.8, 8.2, 6.4, 12.0)
    $g.DrawLine((P '#2e8b45' 3.0), 6.4, 12.0, 13.0, 3.4)
    $g.DrawLine((P '#5fd47a' 1.5), 3.2, 8.0, 6.4, 11.4)
    $g.DrawLine((P '#5fd47a' 1.5), 6.4, 11.4, 12.7, 3.6)
    $g.DrawLine((P '#b8f0c4' 0.8), 7.6, 10.0, 12.2, 4.2)
}

# Heart
Save-Sprite -Category ui -Name heart -Size 16 -Palette @('#5a1218','#a02030','#e0455a','#ff97a5') -Draw {
    param($g)
    $dk = B '#5a1218'; $md = B '#a02030'; $lt = B '#e0455a'; $hi = B '#ff97a5'
    $g.FillEllipse($dk, 0.8, 1.8, 8.0, 7.8)
    $g.FillEllipse($dk, 7.2, 1.8, 8.0, 7.8)
    $lobe = @( (New-Object System.Drawing.PointF(1.0,7.4)), (New-Object System.Drawing.PointF(15.0,7.4)),
               (New-Object System.Drawing.PointF(8.0,15.2)) )
    $g.FillPolygon($dk, $lobe)
    $g.FillEllipse($md, 1.8, 2.7, 6.6, 6.4)
    $g.FillEllipse($md, 7.6, 2.7, 6.6, 6.4)
    $lobe2 = @( (New-Object System.Drawing.PointF(2.0,7.6)), (New-Object System.Drawing.PointF(14.0,7.6)),
                (New-Object System.Drawing.PointF(8.0,13.9)) )
    $g.FillPolygon($md, $lobe2)
    $g.FillEllipse($lt, 3.0, 3.6, 4.2, 4.0)
    $g.FillEllipse($hi, 3.9, 4.3, 2.0, 1.8)
}

# Skull icon
Save-Sprite -Category ui -Name skull-icon -Size 16 -Palette @('#2b2b28','#8d8b7d','#d8d5c2','#f4f2e6') -Draw {
    param($g)
    $dk = B '#2b2b28'; $md = B '#8d8b7d'; $lt = B '#d8d5c2'; $hi = B '#f4f2e6'
    $g.FillRectangle($dk, 4.4, 9.6, 7.2, 4.6)        # jaw
    $g.FillRectangle($md, 5.0, 9.8, 6.0, 3.6)
    $g.FillRectangle($dk, 6.9, 10.4, 0.9, 3.0)
    $g.FillRectangle($dk, 9.0, 10.4, 0.9, 3.0)
    $g.FillEllipse($dk, 1.8, 1.4, 12.4, 11.2)        # cranium
    $g.FillEllipse($lt, 2.6, 2.2, 10.8, 9.6)
    $g.FillEllipse($hi, 4.2, 3.0, 4.8, 3.4)
    $g.FillEllipse($dk, 3.9, 5.6, 3.6, 3.8)          # sockets
    $g.FillEllipse($dk, 8.5, 5.6, 3.6, 3.8)
    $nose = @( (New-Object System.Drawing.PointF(8.0,8.4)), (New-Object System.Drawing.PointF(9.2,11.0)),
               (New-Object System.Drawing.PointF(6.8,11.0)) )
    $g.FillPolygon($dk, $nose)
}

# Clock
Save-Sprite -Category ui -Name clock -Size 16 -Palette @('#2b3038','#6b7684','#e8e4d8','#c93b3b') -Draw {
    param($g)
    $dk = B '#2b3038'; $md = B '#6b7684'; $lt = B '#e8e4d8'; $red = B '#c93b3b'
    $g.FillRectangle($dk, 6.8, 0.3, 2.4, 2.0)        # winder nub
    $g.FillEllipse($dk, 0.7, 1.3, 14.6, 14.6)
    $g.FillEllipse($md, 1.6, 2.2, 12.8, 12.8)
    $g.FillEllipse($lt, 2.7, 3.3, 10.6, 10.6)
    $g.FillRectangle($dk, 7.2, 4.2, 1.8, 4.8)        # hour hand
    $g.FillRectangle($dk, 8.0, 8.0, 4.0, 1.8)        # minute hand
    $g.FillEllipse($red, 6.9, 7.5, 2.4, 2.4)
}

# Arrow left
Save-Sprite -Category ui -Name arrow-left -Size 16 -Palette @('#12305c','#3273c9','#6fa8ea','#d7e8fb') -Draw {
    param($g)
    $dk = B '#12305c'; $md = B '#3273c9'; $lt = B '#6fa8ea'; $hi = B '#d7e8fb'
    $g.FillRectangle($dk, 6.2, 5.2, 8.6, 5.6)
    $head = @( (New-Object System.Drawing.PointF(0.9,8.0)), (New-Object System.Drawing.PointF(8.2,1.4)),
               (New-Object System.Drawing.PointF(8.2,14.6)) )
    $g.FillPolygon($dk, $head)
    $g.FillRectangle($md, 6.2, 6.1, 7.8, 3.8)
    $head2 = @( (New-Object System.Drawing.PointF(2.4,8.0)), (New-Object System.Drawing.PointF(7.4,3.4)),
                (New-Object System.Drawing.PointF(7.4,12.6)) )
    $g.FillPolygon($md, $head2)
    $g.FillRectangle($lt, 6.4, 6.4, 7.0, 1.6)
    $g.FillEllipse($lt, 3.6, 6.4, 3.0, 3.2)
    $g.FillRectangle($hi, 7.4, 6.6, 4.8, 0.9)
}

# Star
Save-Sprite -Category ui -Name star -Size 16 -Palette @('#6b4405','#a97a10','#e8b830','#ffe08a') -Draw {
    param($g)
    $dk = B '#6b4405'; $md = B '#e8b830'; $hi = B '#ffe08a'
    $ptsD = @(); $ptsM = @()
    for ($i = 0; $i -lt 10; $i++) {
        $ang = (-90.0 + $i * 36.0) * [Math]::PI / 180.0
        $R1 = 2.9; $R2 = 2.4
        if ($i % 2 -eq 0) { $R1 = 7.0; $R2 = 5.9 }
        $ptsD += (New-Object System.Drawing.PointF([float](8.0 + $R1 * [Math]::Cos($ang)), [float](8.4 + $R1 * [Math]::Sin($ang))))
        $ptsM += (New-Object System.Drawing.PointF([float](8.0 + $R2 * [Math]::Cos($ang)), [float](8.2 + $R2 * [Math]::Sin($ang))))
    }
    $g.FillPolygon($dk, $ptsD)
    $g.FillPolygon($md, $ptsM)
    $g.FillEllipse($hi, 6.2, 4.6, 2.6, 2.4)
    $g.FillEllipse((B '#a97a10'), 7.0, 9.4, 3.4, 2.2)
}

# Padlock, closed
Save-Sprite -Category ui -Name lock-closed -Size 16 -Palette @('#3a3020','#8a6a10','#e8b830','#ffe08a') -Draw {
    param($g)
    $dk = B '#3a3020'; $md = B '#8a6a10'; $lt = B '#e8b830'; $hi = B '#ffe08a'
    $g.DrawArc((P '#3a3020' 2.6), 4.2, 1.6, 7.6, 8.0, 180, 180)   # shackle
    $g.DrawArc((P '#8a6a10' 1.3), 4.4, 1.9, 7.2, 7.6, 185, 170)
    $g.FillRectangle($dk, 2.2, 7.2, 11.6, 7.6)                    # body
    $g.FillEllipse($dk, 1.6, 7.4, 12.8, 7.2)
    $g.FillRectangle($md, 3.0, 8.0, 10.0, 6.0)
    $g.FillRectangle($lt, 3.4, 8.3, 9.2, 3.0)
    $g.FillRectangle($hi, 4.2, 8.6, 4.6, 1.2)
    $g.FillEllipse($dk, 6.9, 9.8, 2.2, 2.2)                       # keyhole
    $g.FillRectangle($dk, 7.4, 11.2, 1.2, 2.0)
}

# =============================== SPELLS ======================================

# Fireball — burning ball with a trailing tail
Save-Sprite -Category spells -Name fireball -Size 16 -Palette @('#5a1405','#b53a0c','#f5871f','#ffd76a') -Draw {
    param($g)
    $dk = B '#5a1405'; $md = B '#b53a0c'; $lt = B '#f5871f'; $hi = B '#ffd76a'
    $tail = @( (New-Object System.Drawing.PointF(1.0,0.9)), (New-Object System.Drawing.PointF(9.5,6.0)),
               (New-Object System.Drawing.PointF(5.2,10.0)) )
    $g.FillPolygon($dk, $tail)
    $tail2 = @( (New-Object System.Drawing.PointF(2.8,2.6)), (New-Object System.Drawing.PointF(9.6,7.0)),
                (New-Object System.Drawing.PointF(6.0,9.6)) )
    $g.FillPolygon($md, $tail2)
    $g.FillEllipse($dk, 4.0, 4.0, 11.6, 11.6)
    $g.FillEllipse($md, 4.9, 4.9, 9.8, 9.8)
    $g.FillEllipse($lt, 6.0, 5.7, 7.0, 6.8)
    $g.FillEllipse($hi, 7.2, 6.6, 3.4, 3.0)
    $g.FillEllipse($lt, 2.4, 2.2, 2.4, 2.2)
}

# Rocket — dark shell, red nose and fins, white skull
Save-Sprite -Category spells -Name rocket -Size 16 -Palette @('#2b2f36','#565f6b','#8b98a8','#c93b3b','#e8e4d8') -Draw {
    param($g)
    $dk = B '#2b2f36'; $md = B '#565f6b'; $lt = B '#8b98a8'; $red = B '#c93b3b'; $wh = B '#e8e4d8'
    $finL = @( (New-Object System.Drawing.PointF(4.6,9.0)), (New-Object System.Drawing.PointF(1.2,14.6)),
               (New-Object System.Drawing.PointF(4.6,13.4)) )
    $g.FillPolygon($red, $finL)
    $finR = @( (New-Object System.Drawing.PointF(11.4,9.0)), (New-Object System.Drawing.PointF(14.8,14.6)),
               (New-Object System.Drawing.PointF(11.4,13.4)) )
    $g.FillPolygon($red, $finR)
    $nose = @( (New-Object System.Drawing.PointF(8.0,0.6)), (New-Object System.Drawing.PointF(11.8,5.4)),
               (New-Object System.Drawing.PointF(4.2,5.4)) )
    $g.FillPolygon($red, $nose)
    $g.FillRectangle($dk, 3.6, 4.6, 8.8, 9.8)
    $g.FillRectangle($md, 4.3, 5.2, 7.4, 8.8)
    $g.FillRectangle($lt, 4.5, 5.4, 1.3, 8.2)
    $g.FillEllipse($wh, 4.9, 6.0, 6.2, 5.6)          # skull
    $g.FillRectangle($wh, 6.4, 10.4, 3.2, 1.8)
    $g.FillEllipse($dk, 5.7, 7.3, 2.1, 2.4)          # sockets
    $g.FillEllipse($dk, 8.2, 7.3, 2.1, 2.4)
}

# Arrows — fan of three
Save-Sprite -Category spells -Name arrows -Size 16 -Palette @('#3a2a16','#7a5230','#b08a52','#8b98a8','#e8e4d8') -Draw {
    param($g)
    $steel = B '#8b98a8'
    $shaft = P '#7a5230' 1.6
    $shine = P '#b08a52' 0.7
    $fl    = P '#e8e4d8' 1.1
    $x0 = 2.6; $y0 = 13.2
    foreach ($a in -30.0, -46.0, -62.0) {
        $r = $a * [Math]::PI / 180.0
        $dx = [Math]::Cos($r); $dy = [Math]::Sin($r)
        $px = -$dy; $py = $dx
        $tx = $x0 + $dx * 12.6; $ty = $y0 + $dy * 12.6
        $g.DrawLine($shaft, [float]$x0, [float]$y0, [float]$tx, [float]$ty)
        $g.DrawLine($shine, [float]($x0 + $dx * 3.0), [float]($y0 + $dy * 3.0), [float]($tx - $dx * 3.0), [float]($ty - $dy * 3.0))
        $bx = $tx - $dx * 3.2; $by = $ty - $dy * 3.2
        $head = @( (New-Object System.Drawing.PointF([float]$tx, [float]$ty)),
                   (New-Object System.Drawing.PointF([float]($bx + $px * 1.7), [float]($by + $py * 1.7))),
                   (New-Object System.Drawing.PointF([float]($bx - $px * 1.7), [float]($by - $py * 1.7))) )
        $g.FillPolygon($steel, $head)
        $fx = $x0 + $dx * 2.2; $fy = $y0 + $dy * 2.2
        $g.DrawLine($fl, [float]($fx + $px * 1.5), [float]($fy + $py * 1.5), [float]($fx - $px * 1.5), [float]($fy - $py * 1.5))
    }
    $g.FillEllipse((B '#3a2a16'), 1.4, 12.0, 2.6, 2.6)
}

# Poison — bubbling green cloud
Save-Sprite -Category spells -Name poison -Size 16 -Palette @('#14300f','#2f6b28','#5aa63f','#a4dc72') -Draw {
    param($g)
    $dk = B '#14300f'; $md = B '#2f6b28'; $lt = B '#5aa63f'; $hi = B '#a4dc72'
    $g.FillEllipse($dk, 0.6, 5.0, 8.0, 7.4)
    $g.FillEllipse($dk, 4.4, 2.2, 8.4, 8.0)
    $g.FillEllipse($dk, 7.6, 5.4, 7.8, 7.2)
    $g.FillEllipse($dk, 3.0, 7.4, 9.6, 7.2)
    $g.FillEllipse($md, 1.4, 5.8, 6.6, 6.0)
    $g.FillEllipse($md, 5.0, 3.0, 7.2, 6.8)
    $g.FillEllipse($md, 8.2, 6.2, 6.4, 5.8)
    $g.FillEllipse($md, 3.8, 8.0, 8.2, 5.8)
    $g.FillEllipse($lt, 5.6, 4.0, 4.6, 4.2)
    $g.FillEllipse($lt, 2.6, 7.2, 3.4, 3.0)
    $g.FillEllipse($lt, 9.6, 7.4, 3.6, 3.2)
    $g.FillEllipse($hi, 6.6, 4.8, 2.2, 2.0)
    $g.FillEllipse($hi, 10.4, 8.0, 1.6, 1.5)
}

# Freeze — pale blue snowflake
Save-Sprite -Category spells -Name freeze -Size 16 -Palette @('#153a70','#3d7fc4','#8fcdf0','#f0fbff') -Draw {
    param($g)
    $dkp = P '#153a70' 3.4; $mdp = P '#3d7fc4' 2.2; $ltp = P '#8fcdf0' 1.0
    foreach ($p in $dkp, $mdp, $ltp) {
        $g.DrawLine($p, 1.6, 8.0, 14.4, 8.0)
        $g.DrawLine($p, 4.8, 2.4, 11.2, 13.6)
        $g.DrawLine($p, 11.2, 2.4, 4.8, 13.6)
    }
    $br = P '#8fcdf0' 1.0
    $g.DrawLine($br, 4.4, 8.0, 2.6, 5.6)
    $g.DrawLine($br, 4.4, 8.0, 2.6, 10.4)
    $g.DrawLine($br, 11.6, 8.0, 13.4, 5.6)
    $g.DrawLine($br, 11.6, 8.0, 13.4, 10.4)
    $g.DrawLine($br, 6.4, 4.2, 6.6, 1.8)
    $g.DrawLine($br, 9.6, 11.8, 9.4, 14.2)
    $g.FillEllipse((B '#f0fbff'), 6.2, 6.2, 3.6, 3.6)
}

# Rage — pink potion bottle
Save-Sprite -Category spells -Name rage -Size 16 -Palette @('#3d0f38','#a02090','#e050c0','#f7b8fb','#5a3418') -Draw {
    param($g)
    $dk = B '#3d0f38'; $md = B '#a02090'; $lt = B '#e050c0'; $hi = B '#f7b8fb'; $cork = B '#5a3418'
    $g.FillRectangle($dk, 5.9, 2.2, 4.2, 5.4)        # neck
    $g.FillRectangle($md, 6.5, 2.6, 3.0, 5.0)
    $g.FillEllipse($dk, 2.4, 5.4, 11.2, 10.0)        # body
    $g.FillEllipse($md, 3.2, 6.2, 9.6, 8.4)
    $g.FillEllipse($lt, 4.2, 8.2, 7.6, 5.4)          # liquid
    $g.FillEllipse($hi, 5.2, 8.8, 2.4, 2.0)
    $g.FillRectangle($hi, 4.4, 7.0, 1.3, 3.0)
    $g.FillRectangle($cork, 5.6, 0.8, 4.8, 2.0)      # cork
}

# Giant snowball
Save-Sprite -Category spells -Name giant-snowball -Size 16 -Palette @('#456a8a','#8fb8d8','#d7ecf8','#ffffff') -Draw {
    param($g)
    $dk = B '#456a8a'; $md = B '#8fb8d8'; $lt = B '#d7ecf8'; $hi = B '#ffffff'
    $g.FillEllipse($dk, 0.4, 0.4, 15.2, 15.2)
    $g.FillEllipse($md, 1.2, 1.2, 13.6, 13.6)
    $g.FillEllipse($lt, 2.0, 1.8, 11.6, 10.4)
    $g.FillEllipse($hi, 3.6, 2.8, 5.8, 4.4)
    $g.FillEllipse($md, 9.4, 9.4, 3.4, 2.8)          # dimples
    $g.FillEllipse($md, 4.0, 11.0, 2.8, 2.2)
    $g.FillEllipse($dk, 6.6, 13.0, 3.6, 2.2)
}

# Clone — translucent cyan double
Save-Sprite -Category spells -Name clone -Size 16 -Palette @('#0e4a52','#1f8f9e','#4fd6e0','#b8f5fb') -Draw {
    param($g)
    $dk = B '#0e4a52'; $md = B '#1f8f9e'; $lt = B '#4fd6e0'; $hi = B '#b8f5fb'
    $g.FillEllipse($dk, 8.4, 2.6, 6.2, 5.6)          # ghost behind
    $g.FillEllipse($dk, 7.4, 7.4, 8.0, 8.2)
    $g.FillEllipse($md, 9.2, 3.4, 4.6, 4.2)
    $g.FillEllipse($md, 8.4, 8.2, 6.4, 6.8)
    $g.FillEllipse($dk, 1.0, 1.6, 8.0, 7.2)          # front figure
    $g.FillEllipse($dk, 0.4, 6.6, 9.6, 9.0)
    $g.FillEllipse($lt, 1.8, 2.4, 6.4, 5.6)
    $g.FillEllipse($lt, 1.3, 7.4, 8.0, 7.6)
    $g.FillEllipse($hi, 3.0, 3.2, 3.2, 2.6)
    $g.FillEllipse($hi, 2.4, 8.4, 2.6, 3.4)
}

# Mirror — purple hand mirror
Save-Sprite -Category spells -Name mirror -Size 16 -Palette @('#2a0d52','#6b28b8','#9b55e8','#d2a6ff','#e8e4d8') -Draw {
    param($g)
    $dk = B '#2a0d52'; $md = B '#6b28b8'; $lt = B '#9b55e8'; $hi = B '#d2a6ff'; $wh = B '#e8e4d8'
    $g.FillRectangle($dk, 6.4, 8.6, 3.2, 7.0)        # handle
    $g.FillRectangle($md, 7.0, 8.8, 2.0, 6.6)
    $g.FillRectangle($lt, 7.2, 9.0, 0.8, 6.0)
    $g.FillEllipse($dk, 1.6, 0.6, 12.8, 12.0)        # frame
    $g.FillEllipse($md, 2.5, 1.5, 11.0, 10.2)
    $g.FillEllipse($lt, 3.8, 2.6, 8.4, 7.8)          # glass
    $g.FillEllipse($hi, 4.8, 3.4, 4.4, 3.6)
    $g.FillEllipse($wh, 5.4, 3.8, 2.2, 1.8)
}

# The Log — rolling trunk with bands
Save-Sprite -Category spells -Name the-log -Size 16 -Palette @('#3a2410','#6b4423','#a06a34','#c99257') -Draw {
    param($g)
    $dk = B '#3a2410'; $md = B '#6b4423'; $lt = B '#a06a34'; $hi = B '#c99257'
    $g.FillRectangle($dk, 1.6, 3.2, 13.6, 9.6)
    $g.FillRectangle($md, 1.6, 4.0, 13.6, 8.0)
    $g.FillRectangle($hi, 2.0, 4.6, 12.8, 1.6)       # top highlight
    $g.FillRectangle($dk, 5.6, 3.4, 1.4, 9.2)        # bands
    $g.FillRectangle($dk, 10.4, 3.4, 1.4, 9.2)
    $g.FillEllipse($dk, 0.4, 3.0, 3.8, 10.0)         # cut end
    $g.FillEllipse($lt, 1.0, 3.8, 2.6, 8.4)
    $g.DrawArc((P '#6b4423' 0.9), 1.5, 5.2, 1.6, 5.6, 0, 360)
}

# Barbarian barrel — barrel lying on its side
Save-Sprite -Category spells -Name barbarian-barrel -Size 16 -Palette @('#3a2410','#6b4423','#a06a34','#c99257','#5a5f68') -Draw {
    param($g)
    $dk = B '#3a2410'; $md = B '#6b4423'; $lt = B '#a06a34'; $hi = B '#c99257'; $mt = B '#5a5f68'
    $g.FillEllipse($dk, 0.6, 2.0, 14.8, 12.0)
    $g.FillEllipse($md, 1.4, 2.9, 13.2, 10.2)
    $g.FillEllipse($lt, 2.6, 3.6, 10.8, 3.6)         # lit upper staves
    $g.FillEllipse($hi, 4.0, 4.0, 6.4, 1.8)
    $g.FillRectangle($mt, 5.2, 2.6, 1.5, 10.8)       # hoops
    $g.FillRectangle($mt, 9.6, 2.6, 1.5, 10.8)
    $g.FillEllipse($dk, 0.4, 3.4, 3.8, 9.2)          # end cap
    $g.FillEllipse($lt, 1.1, 4.2, 2.4, 7.6)
    $g.FillEllipse($md, 1.6, 6.0, 1.4, 4.0)
}

# Goblin barrel — upright barrel with a goblin popping out
Save-Sprite -Category spells -Name goblin-barrel -Size 16 -Palette @('#3a2410','#8a5c30','#c99257','#1e4a1c','#5fa83f','#e8e4d8') -Draw {
    param($g)
    $dk = B '#3a2410'; $md = B '#8a5c30'; $lt = B '#c99257'
    $gd = B '#1e4a1c'; $gl = B '#5fa83f'; $wh = B '#e8e4d8'
    $earL = @( (New-Object System.Drawing.PointF(4.6,3.0)), (New-Object System.Drawing.PointF(1.2,1.4)),
               (New-Object System.Drawing.PointF(4.2,5.6)) )
    $g.FillPolygon($gd, $earL)
    $earR = @( (New-Object System.Drawing.PointF(11.4,3.0)), (New-Object System.Drawing.PointF(14.8,1.4)),
               (New-Object System.Drawing.PointF(11.8,5.6)) )
    $g.FillPolygon($gd, $earR)
    $g.FillEllipse($gd, 4.2, 0.6, 7.6, 6.6)          # head
    $g.FillEllipse($gl, 4.9, 1.3, 6.2, 5.2)
    $g.FillEllipse($wh, 5.8, 2.6, 1.9, 2.0)          # eyes
    $g.FillEllipse($wh, 8.3, 2.6, 1.9, 2.0)
    $g.FillRectangle($gd, 6.3, 3.2, 0.9, 1.2)
    $g.FillRectangle($gd, 8.8, 3.2, 0.9, 1.2)
    $g.FillEllipse($dk, 1.6, 5.4, 12.8, 10.4)        # barrel
    $g.FillEllipse($md, 2.4, 6.2, 11.2, 8.8)
    $g.FillRectangle($dk, 2.2, 8.0, 11.6, 1.3)       # hoops
    $g.FillRectangle($dk, 2.2, 12.0, 11.6, 1.3)
    $g.FillEllipse($lt, 3.2, 9.5, 3.0, 2.2)
}

# Graveyard — gravestone rising out of mist
Save-Sprite -Category spells -Name graveyard -Size 16 -Palette @('#1a1028','#3a2458','#6b4f96','#a894c8','#d8cfe8') -Draw {
    param($g)
    $dk = B '#1a1028'; $md = B '#3a2458'; $lt = B '#6b4f96'; $mist = B '#a894c8'; $hi = B '#d8cfe8'
    $g.FillEllipse($dk, 0.4, 10.0, 15.2, 5.6)        # mound
    $g.FillEllipse($md, 1.2, 10.8, 13.6, 4.2)
    $g.FillEllipse($dk, 3.2, 1.0, 9.6, 9.0)          # stone top
    $g.FillRectangle($dk, 3.2, 5.0, 9.6, 8.0)
    $g.FillEllipse($md, 4.0, 1.9, 8.0, 7.4)
    $g.FillRectangle($md, 4.0, 5.4, 8.0, 7.0)
    $g.FillRectangle($lt, 6.9, 3.4, 2.2, 7.4)        # cross
    $g.FillRectangle($lt, 4.9, 5.6, 6.2, 2.0)
    $g.FillRectangle($hi, 4.4, 2.6, 1.4, 9.0)        # lit edge
    $g.FillEllipse($mist, 1.0, 12.0, 5.2, 2.0)       # mist
    $g.FillEllipse($mist, 8.4, 13.0, 6.0, 2.0)
    $g.FillEllipse($mist, 5.4, 14.0, 4.0, 1.6)
}

# Royale delivery — crate under a parachute
Save-Sprite -Category spells -Name royale-delivery -Size 16 -Palette @('#3a2410','#a06a34','#c99257','#8c2020','#c93b3b','#e8e4d8') -Draw {
    param($g)
    $dk = B '#3a2410'; $md = B '#a06a34'; $lt = B '#c99257'
    $rd = B '#8c2020'; $rl = B '#c93b3b'; $wh = B '#e8e4d8'
    $g.FillPie($rd, 0.6, 0.4, 14.8, 10.4, 180, 180)  # canopy
    $g.FillPie($rl, 1.4, 1.0, 13.2, 9.2, 180, 180)
    $g.FillPie($wh, 5.6, 1.0, 4.8, 9.2, 180, 180)    # centre stripe
    $g.DrawLine((P '#3a2410' 0.9), 1.6, 5.6, 5.4, 9.4)
    $g.DrawLine((P '#3a2410' 0.9), 14.4, 5.6, 10.6, 9.4)
    $g.FillRectangle($dk, 4.0, 8.6, 8.0, 6.8)        # crate
    $g.FillRectangle($md, 4.7, 9.3, 6.6, 5.4)
    $g.FillRectangle($lt, 4.9, 9.6, 6.2, 1.3)
    $g.FillRectangle($dk, 4.7, 11.6, 6.6, 0.9)
    $g.FillRectangle($dk, 7.4, 9.3, 1.0, 5.4)
}

# Vines — twin twisting stems with leaves
Save-Sprite -Category spells -Name vines -Size 16 -Palette @('#14300f','#2f6b28','#4f9a3a','#8fd063') -Draw {
    param($g)
    $dkp = P '#14300f' 2.6; $mdp = P '#2f6b28' 1.5
    $g.DrawArc($dkp, 1.6, 0.6, 6.4, 6.4, 90, 180)
    $g.DrawArc($dkp, 1.6, 6.4, 6.4, 6.4, 270, 180)
    $g.DrawArc($dkp, 1.6, 11.0, 6.4, 6.4, 90, 90)
    $g.DrawArc($dkp, 8.0, 2.4, 6.4, 6.4, 270, 180)
    $g.DrawArc($dkp, 8.0, 8.2, 6.4, 6.4, 90, 180)
    $g.DrawArc($mdp, 1.9, 0.9, 6.0, 6.0, 95, 170)
    $g.DrawArc($mdp, 1.9, 6.7, 6.0, 6.0, 275, 170)
    $g.DrawArc($mdp, 8.3, 2.7, 6.0, 6.0, 275, 170)
    $g.DrawArc($mdp, 8.3, 8.5, 6.0, 6.0, 95, 170)
    $lf = B '#4f9a3a'; $hi = B '#8fd063'
    $g.FillEllipse($lf, 0.6, 3.0, 3.4, 2.4)
    $g.FillEllipse($lf, 5.4, 8.4, 3.4, 2.4)
    $g.FillEllipse($lf, 12.2, 4.4, 3.2, 2.4)
    $g.FillEllipse($lf, 8.0, 12.2, 3.4, 2.4)
    $g.FillEllipse($hi, 1.3, 3.5, 1.7, 1.2)
    $g.FillEllipse($hi, 12.8, 4.9, 1.6, 1.2)
    $g.FillEllipse($hi, 8.7, 12.7, 1.6, 1.2)
}

# Earthquake — cracked ground
Save-Sprite -Category spells -Name earthquake -Size 16 -Palette @('#2b1a08','#5c3a18','#8a5c30','#b98a52') -Draw {
    param($g)
    $dk = B '#2b1a08'; $md = B '#5c3a18'; $lt = B '#8a5c30'; $hi = B '#b98a52'
    $g.FillEllipse($dk, 0.4, 1.6, 15.2, 12.8)
    $g.FillEllipse($md, 1.2, 2.4, 13.6, 11.2)
    $g.FillEllipse($lt, 2.2, 3.0, 11.6, 5.0)
    $g.FillEllipse($hi, 4.0, 3.6, 6.0, 2.2)
    $cr = P '#2b1a08' 1.5
    $g.DrawLine($cr, 8.4, 1.8, 6.6, 5.6)             # main fissure
    $g.DrawLine($cr, 6.6, 5.6, 9.4, 8.6)
    $g.DrawLine($cr, 9.4, 8.6, 7.4, 14.2)
    $br = P '#2b1a08' 1.0
    $g.DrawLine($br, 6.6, 5.6, 2.4, 4.8)             # branches
    $g.DrawLine($br, 9.4, 8.6, 13.6, 7.4)
    $g.DrawLine($br, 8.6, 11.0, 12.0, 12.6)
    $g.DrawLine($br, 7.8, 12.6, 4.0, 12.0)
}

# ================================ MAP ========================================

Save-Sprite -Category map -Name tile-grass -Size 16 -Opaque -Palette @('#2f6b28','#3f8a32','#54a642','#6db84a') -Draw {
    param($g)
    $g.FillRectangle((B '#3f8a32'), 0, 0, 16, 16)
    $dk = B '#2f6b28'; $lt = B '#54a642'; $hi = B '#6db84a'
    $g.FillEllipse($dk, 1.5, 2.5, 4.5, 1.7)
    $g.FillEllipse($dk, 9.0, 5.5, 4.5, 1.7)
    $g.FillEllipse($dk, 3.5, 11.0, 5.0, 1.7)
    $g.FillEllipse($dk, 11.0, 12.0, 3.4, 1.5)
    $g.FillEllipse($lt, 6.0, 1.8, 3.4, 1.4)
    $g.FillEllipse($lt, 2.0, 7.2, 3.6, 1.4)
    $g.FillEllipse($lt, 9.8, 9.2, 4.0, 1.4)
    $g.FillEllipse($hi, 11.8, 2.8, 1.8, 1.1)
    $g.FillEllipse($hi, 5.6, 13.4, 1.8, 1.1)
    $g.FillEllipse($hi, 7.0, 7.6, 1.6, 1.1)
}

Save-Sprite -Category map -Name tile-grass-dark -Size 16 -Opaque -Palette @('#173a15','#255c20','#33782b','#43903a') -Draw {
    param($g)
    $g.FillRectangle((B '#255c20'), 0, 0, 16, 16)
    $dk = B '#173a15'; $lt = B '#33782b'; $hi = B '#43903a'
    $g.FillEllipse($dk, 2.0, 3.0, 4.8, 1.8)
    $g.FillEllipse($dk, 9.5, 6.0, 4.2, 1.7)
    $g.FillEllipse($dk, 4.0, 11.5, 5.0, 1.7)
    $g.FillEllipse($dk, 11.4, 11.8, 3.0, 1.4)
    $g.FillEllipse($lt, 6.4, 2.0, 3.4, 1.4)
    $g.FillEllipse($lt, 1.8, 8.0, 3.6, 1.4)
    $g.FillEllipse($lt, 10.0, 9.0, 3.8, 1.4)
    $g.FillEllipse($hi, 12.0, 3.4, 1.7, 1.1)
    $g.FillEllipse($hi, 5.4, 13.6, 1.7, 1.1)
}

Save-Sprite -Category map -Name tile-water-river -Size 16 -Opaque -Palette @('#1d5c9e','#2b7fd0','#4aa0e8','#9fd4f5') -Draw {
    param($g)
    $g.FillRectangle((B '#2b7fd0'), 0, 0, 16, 16)
    $g.FillRectangle((B '#1d5c9e'), 0, 5, 16, 3)
    $g.FillRectangle((B '#4aa0e8'), 0, 12, 16, 2)
    $g.FillEllipse((B '#4aa0e8'), 2.0, 1.8, 5.0, 1.6)
    $g.FillEllipse((B '#9fd4f5'), 2.8, 2.1, 3.0, 0.9)
    $g.FillEllipse((B '#9fd4f5'), 9.0, 9.4, 4.2, 1.1)
    $g.FillEllipse((B '#1d5c9e'), 4.0, 9.6, 3.4, 1.0)
    $g.FillEllipse((B '#9fd4f5'), 10.4, 12.4, 2.6, 0.9)
}

Save-Sprite -Category map -Name tile-sand -Size 16 -Opaque -Palette @('#a88a52','#c9a86a','#e0c489','#f2dcae') -Draw {
    param($g)
    $g.FillRectangle((B '#c9a86a'), 0, 0, 16, 16)
    $dk = B '#a88a52'; $lt = B '#e0c489'; $hi = B '#f2dcae'
    $g.FillEllipse($dk, 2.0, 3.4, 4.4, 1.5)
    $g.FillEllipse($dk, 9.4, 8.0, 4.4, 1.5)
    $g.FillEllipse($dk, 4.6, 12.2, 4.0, 1.4)
    $g.FillEllipse($lt, 6.6, 2.0, 4.2, 1.4)
    $g.FillEllipse($lt, 1.8, 8.6, 3.6, 1.4)
    $g.FillEllipse($lt, 10.0, 11.8, 3.4, 1.3)
    $g.FillEllipse($hi, 12.2, 3.0, 1.8, 1.0)
    $g.FillEllipse($hi, 7.0, 6.4, 1.8, 1.0)
    $g.FillEllipse($hi, 3.2, 10.2, 1.6, 1.0)
}

Save-Sprite -Category map -Name tile-stone-path -Size 16 -Opaque -Palette @('#3a3f47','#5a626d','#7b8592','#9ea9b8') -Draw {
    param($g)
    $g.FillRectangle((B '#3a3f47'), 0, 0, 16, 16)
    $md = B '#5a626d'; $lt = B '#7b8592'; $hi = B '#9ea9b8'
    $g.FillEllipse($md, 0.9, 0.9, 6.5, 6.2)
    $g.FillEllipse($md, 8.6, 0.9, 6.5, 6.2)
    $g.FillEllipse($md, 0.9, 8.9, 6.5, 6.2)
    $g.FillEllipse($md, 8.6, 8.9, 6.5, 6.2)
    $g.FillEllipse($lt, 1.5, 1.4, 5.0, 3.6)
    $g.FillEllipse($lt, 9.2, 1.4, 5.0, 3.6)
    $g.FillEllipse($lt, 1.5, 9.4, 5.0, 3.6)
    $g.FillEllipse($lt, 9.2, 9.4, 5.0, 3.6)
    $g.FillEllipse($hi, 2.2, 1.8, 2.4, 1.5)
    $g.FillEllipse($hi, 9.9, 1.8, 2.4, 1.5)
    $g.FillEllipse($hi, 2.2, 9.8, 2.4, 1.5)
    $g.FillEllipse($hi, 9.9, 9.8, 2.4, 1.5)
}

Save-Sprite -Category map -Name tile-deploy-zone -Size 16 -Opaque -Palette @('#2b5c52','#3a7a6a','#4f9a8a','#8fc8d8') -Draw {
    param($g)
    $g.FillRectangle((B '#3a7a6a'), 0, 0, 16, 16)
    $dk = B '#2b5c52'; $lt = B '#4f9a8a'; $hi = B '#8fc8d8'
    $g.FillEllipse($dk, 1.8, 2.8, 4.6, 1.7)
    $g.FillEllipse($dk, 9.2, 6.0, 4.4, 1.7)
    $g.FillEllipse($dk, 4.0, 11.4, 4.8, 1.7)
    $g.FillEllipse($lt, 6.2, 2.0, 3.6, 1.4)
    $g.FillEllipse($lt, 1.8, 7.6, 3.6, 1.4)
    $g.FillEllipse($lt, 10.0, 9.6, 3.8, 1.4)
    $g.FillEllipse($hi, 11.8, 2.6, 2.0, 1.2)
    $g.FillEllipse($hi, 5.2, 13.4, 2.0, 1.2)
    $g.FillEllipse($hi, 7.4, 7.2, 1.6, 1.1)
}

Save-Sprite -Category map -Name tile-arena-floor -Size 16 -Opaque -Palette @('#1f5a52','#2a7a6c','#369a86','#4fb8a0') -Draw {
    param($g)
    $g.FillRectangle((B '#2a7a6c'), 0, 0, 16, 16)
    $g.FillEllipse((B '#369a86'), 2.0, 2.0, 5.0, 2.0)
    $g.FillEllipse((B '#369a86'), 9.4, 10.4, 4.6, 1.8)
    $g.FillEllipse((B '#4fb8a0'), 3.0, 2.4, 2.6, 1.0)
    $g.FillEllipse((B '#1f5a52'), 9.6, 3.2, 4.0, 1.6)
    $g.FillEllipse((B '#1f5a52'), 2.4, 11.4, 4.0, 1.6)
    $g.DrawLine((P '#1f5a52' 1.0), 8, 0, 8, 16)
    $g.DrawLine((P '#1f5a52' 1.0), 0, 8, 16, 8)
}

Save-Sprite -Category map -Name tile-dirt -Size 16 -Opaque -Palette @('#4a3018','#6b4423','#8a5c30','#a87a48') -Draw {
    param($g)
    $g.FillRectangle((B '#6b4423'), 0, 0, 16, 16)
    $dk = B '#4a3018'; $lt = B '#8a5c30'; $hi = B '#a87a48'
    $g.FillEllipse($dk, 1.6, 3.0, 4.8, 1.8)
    $g.FillEllipse($dk, 9.0, 7.4, 4.6, 1.8)
    $g.FillEllipse($dk, 4.2, 11.8, 4.4, 1.6)
    $g.FillEllipse($lt, 6.4, 1.8, 4.0, 1.5)
    $g.FillEllipse($lt, 1.8, 8.2, 3.8, 1.5)
    $g.FillEllipse($lt, 10.2, 11.4, 3.6, 1.4)
    $g.FillEllipse($hi, 12.0, 3.2, 1.8, 1.1)
    $g.FillEllipse($hi, 6.8, 6.0, 1.8, 1.1)
    $g.FillEllipse($hi, 2.8, 13.0, 1.6, 1.0)
}
