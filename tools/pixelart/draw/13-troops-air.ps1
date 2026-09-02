. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# Minion — dark teal imp, wings out, feet dangling (airborne)
Save-Sprite -Category troops -Name minions -Size 16 -Palette @('#0e3336','#1c6a68','#33a396','#7fd9c6','#f5e26b') -Draw {
    param($g)
    $dk = B '#0e3336'; $md = B '#1c6a68'; $lt = B '#33a396'; $hi = B '#7fd9c6'; $ey = B '#f5e26b'
    $wl = @( (New-Object System.Drawing.PointF(7.4,6.0)),
             (New-Object System.Drawing.PointF(1.0,1.6)),
             (New-Object System.Drawing.PointF(0.6,6.4)),
             (New-Object System.Drawing.PointF(2.8,9.6)),
             (New-Object System.Drawing.PointF(7.0,9.0)) )
    $g.FillPolygon($dk, $wl)
    $wr = @( (New-Object System.Drawing.PointF(8.6,6.0)),
             (New-Object System.Drawing.PointF(15.0,1.6)),
             (New-Object System.Drawing.PointF(15.4,6.4)),
             (New-Object System.Drawing.PointF(13.2,9.6)),
             (New-Object System.Drawing.PointF(9.0,9.0)) )
    $g.FillPolygon($dk, $wr)
    $wl2 = @( (New-Object System.Drawing.PointF(7.0,5.8)),
              (New-Object System.Drawing.PointF(2.6,3.0)),
              (New-Object System.Drawing.PointF(2.4,6.0)),
              (New-Object System.Drawing.PointF(6.6,7.6)) )
    $g.FillPolygon($md, $wl2)
    $wr2 = @( (New-Object System.Drawing.PointF(9.0,5.8)),
              (New-Object System.Drawing.PointF(13.4,3.0)),
              (New-Object System.Drawing.PointF(13.6,6.0)),
              (New-Object System.Drawing.PointF(9.4,7.6)) )
    $g.FillPolygon($md, $wr2)
    $hn = @( (New-Object System.Drawing.PointF(8.0,0.5)),
             (New-Object System.Drawing.PointF(9.9,3.6)),
             (New-Object System.Drawing.PointF(6.1,3.6)) )
    $g.FillPolygon($dk, $hn)
    $g.FillEllipse($dk, 4.0, 2.4, 8.0, 10.6)
    $g.FillEllipse($md, 4.7, 3.1, 6.6, 9.2)
    $g.FillEllipse($lt, 5.0, 3.4, 6.0, 5.4)
    $g.FillEllipse($hi, 5.9, 3.9, 2.6, 1.9)
    $g.FillEllipse($ey, 5.9, 6.1, 1.8, 2.0)
    $g.FillEllipse($ey, 8.3, 6.1, 1.8, 2.0)
    $g.FillEllipse($dk, 5.6, 12.0, 2.0, 2.8)
    $g.FillEllipse($dk, 8.4, 12.0, 2.0, 2.8)
}

# Mega Minion — navy armoured imp, steel helm and pauldrons, wings out
Save-Sprite -Category troops -Name mega-minion -Size 16 -Palette @('#0b1130','#22346e','#3d5fae','#8fb0ea','#cdd8e6','#f2c63c') -Draw {
    param($g)
    $dk = B '#0b1130'; $md = B '#22346e'; $lt = B '#3d5fae'; $hi = B '#8fb0ea'; $st = B '#cdd8e6'; $gd = B '#f2c63c'
    $wl = @( (New-Object System.Drawing.PointF(7.2,6.2)),
             (New-Object System.Drawing.PointF(0.7,0.9)),
             (New-Object System.Drawing.PointF(0.4,6.2)),
             (New-Object System.Drawing.PointF(2.6,10.0)),
             (New-Object System.Drawing.PointF(6.8,9.4)) )
    $g.FillPolygon($dk, $wl)
    $wr = @( (New-Object System.Drawing.PointF(8.8,6.2)),
             (New-Object System.Drawing.PointF(15.3,0.9)),
             (New-Object System.Drawing.PointF(15.6,6.2)),
             (New-Object System.Drawing.PointF(13.4,10.0)),
             (New-Object System.Drawing.PointF(9.2,9.4)) )
    $g.FillPolygon($dk, $wr)
    $wl2 = @( (New-Object System.Drawing.PointF(6.8,6.0)),
              (New-Object System.Drawing.PointF(2.2,2.8)),
              (New-Object System.Drawing.PointF(2.0,6.2)),
              (New-Object System.Drawing.PointF(6.4,7.8)) )
    $g.FillPolygon($md, $wl2)
    $wr2 = @( (New-Object System.Drawing.PointF(9.2,6.0)),
              (New-Object System.Drawing.PointF(13.8,2.8)),
              (New-Object System.Drawing.PointF(14.0,6.2)),
              (New-Object System.Drawing.PointF(9.6,7.8)) )
    $g.FillPolygon($md, $wr2)
    $g.FillEllipse($dk, 3.2, 1.8, 9.6, 12.4)
    $g.FillEllipse($md, 3.9, 2.5, 8.2, 11.0)
    $g.FillEllipse($lt, 4.4, 7.4, 7.2, 5.8)
    $g.FillEllipse($hi, 5.4, 8.2, 3.0, 2.2)
    $cr = @( (New-Object System.Drawing.PointF(8.0,0.4)),
             (New-Object System.Drawing.PointF(10.0,3.0)),
             (New-Object System.Drawing.PointF(6.0,3.0)) )
    $g.FillPolygon($st, $cr)
    $g.FillEllipse($st, 4.2, 1.9, 7.6, 5.8)
    $g.FillEllipse($dk, 4.7, 4.9, 6.6, 2.8)
    $g.FillEllipse($gd, 5.7, 5.5, 1.7, 1.6)
    $g.FillEllipse($gd, 8.6, 5.5, 1.7, 1.6)
    $g.FillEllipse($st, 1.9, 6.6, 4.2, 3.8)
    $g.FillEllipse($st, 9.9, 6.6, 4.2, 3.8)
    $g.FillEllipse($dk, 5.3, 12.9, 2.1, 2.6)
    $g.FillEllipse($dk, 8.6, 12.9, 2.1, 2.6)
}

# Bats — small purple bat, wings spread wide
Save-Sprite -Category troops -Name bats -Size 16 -Palette @('#20102e','#472260','#7b4497','#c396dd','#e8586a') -Draw {
    param($g)
    $dk = B '#20102e'; $md = B '#472260'; $lt = B '#7b4497'; $hi = B '#c396dd'; $ey = B '#e8586a'
    $wl = @( (New-Object System.Drawing.PointF(7.4,4.6)),
             (New-Object System.Drawing.PointF(4.6,3.0)),
             (New-Object System.Drawing.PointF(0.8,3.8)),
             (New-Object System.Drawing.PointF(2.9,6.4)),
             (New-Object System.Drawing.PointF(4.4,5.6)),
             (New-Object System.Drawing.PointF(5.6,8.2)),
             (New-Object System.Drawing.PointF(7.4,7.4)) )
    $g.FillPolygon($md, $wl)
    $wr = @( (New-Object System.Drawing.PointF(8.6,4.6)),
             (New-Object System.Drawing.PointF(11.4,3.0)),
             (New-Object System.Drawing.PointF(15.2,3.8)),
             (New-Object System.Drawing.PointF(13.1,6.4)),
             (New-Object System.Drawing.PointF(11.6,5.6)),
             (New-Object System.Drawing.PointF(10.4,8.2)),
             (New-Object System.Drawing.PointF(8.6,7.4)) )
    $g.FillPolygon($md, $wr)
    $wl3 = @( (New-Object System.Drawing.PointF(7.0,4.9)),
              (New-Object System.Drawing.PointF(4.4,3.7)),
              (New-Object System.Drawing.PointF(1.9,4.2)),
              (New-Object System.Drawing.PointF(4.6,6.4)) )
    $g.FillPolygon($dk, $wl3)
    $wr3 = @( (New-Object System.Drawing.PointF(9.0,4.9)),
              (New-Object System.Drawing.PointF(11.6,3.7)),
              (New-Object System.Drawing.PointF(14.1,4.2)),
              (New-Object System.Drawing.PointF(11.4,6.4)) )
    $g.FillPolygon($dk, $wr3)
    $el = @( (New-Object System.Drawing.PointF(6.0,4.6)),
             (New-Object System.Drawing.PointF(5.0,0.8)),
             (New-Object System.Drawing.PointF(7.8,3.6)) )
    $g.FillPolygon($dk, $el)
    $er = @( (New-Object System.Drawing.PointF(10.0,4.6)),
             (New-Object System.Drawing.PointF(11.0,0.8)),
             (New-Object System.Drawing.PointF(8.2,3.6)) )
    $g.FillPolygon($dk, $er)
    $g.FillEllipse($dk, 5.0, 3.4, 6.0, 8.0)
    $g.FillEllipse($md, 5.5, 3.9, 5.0, 6.8)
    $g.FillEllipse($lt, 5.7, 4.2, 4.6, 4.0)
    $g.FillEllipse($hi, 6.4, 4.6, 2.2, 1.5)
    $g.FillEllipse($ey, 6.1, 5.8, 1.4, 1.5)
    $g.FillEllipse($ey, 8.5, 5.8, 1.4, 1.5)
    $g.FillEllipse($dk, 6.2, 10.6, 1.4, 2.0)
    $g.FillEllipse($dk, 8.4, 10.6, 1.4, 2.0)
}

# Baby Dragon — green dragon, snout out to the right, small wings up
Save-Sprite -Category troops -Name baby-dragon -Size 16 -Palette @('#173a1e','#2e7a36','#57b055','#a2dd84','#e8cf8a') -Draw {
    param($g)
    $dk = B '#173a1e'; $md = B '#2e7a36'; $lt = B '#57b055'; $hi = B '#a2dd84'; $bl = B '#e8cf8a'
    $wl = @( (New-Object System.Drawing.PointF(6.0,7.0)),
             (New-Object System.Drawing.PointF(1.6,2.4)),
             (New-Object System.Drawing.PointF(0.6,6.6)),
             (New-Object System.Drawing.PointF(2.8,10.2)),
             (New-Object System.Drawing.PointF(5.8,9.6)) )
    $g.FillPolygon($dk, $wl)
    $wr = @( (New-Object System.Drawing.PointF(10.0,7.0)),
             (New-Object System.Drawing.PointF(14.4,2.4)),
             (New-Object System.Drawing.PointF(15.4,6.6)),
             (New-Object System.Drawing.PointF(13.2,10.2)),
             (New-Object System.Drawing.PointF(10.2,9.6)) )
    $g.FillPolygon($dk, $wr)
    $wl2 = @( (New-Object System.Drawing.PointF(5.6,6.8)),
              (New-Object System.Drawing.PointF(2.6,4.0)),
              (New-Object System.Drawing.PointF(2.0,6.8)),
              (New-Object System.Drawing.PointF(5.2,8.8)) )
    $g.FillPolygon($md, $wl2)
    $wr2 = @( (New-Object System.Drawing.PointF(10.4,6.8)),
              (New-Object System.Drawing.PointF(13.4,4.0)),
              (New-Object System.Drawing.PointF(14.0,6.8)),
              (New-Object System.Drawing.PointF(10.8,8.8)) )
    $g.FillPolygon($md, $wr2)
    $g.FillEllipse($dk, 4.2, 6.2, 7.6, 9.0)
    $g.FillEllipse($md, 4.8, 6.8, 6.4, 7.8)
    $g.FillEllipse($bl, 5.8, 9.4, 4.4, 4.8)
    $hr = @( (New-Object System.Drawing.PointF(5.8,2.4)),
             (New-Object System.Drawing.PointF(4.6,0.5)),
             (New-Object System.Drawing.PointF(7.4,1.8)) )
    $g.FillPolygon($bl, $hr)
    $g.FillEllipse($dk, 3.6, 1.4, 7.6, 7.2)
    $g.FillEllipse($lt, 4.2, 2.0, 6.4, 6.0)
    $g.FillEllipse($hi, 5.0, 2.5, 3.0, 2.2)
    $g.FillEllipse($dk, 9.2, 4.4, 6.2, 4.4)
    $g.FillEllipse($lt, 9.6, 4.9, 5.6, 3.2)
    $g.FillEllipse($hi, 10.2, 5.3, 3.2, 1.7)
    $g.FillEllipse($dk, 13.7, 5.7, 1.2, 1.2)
    $g.FillEllipse($dk, 6.2, 4.0, 1.8, 2.0)
}

# Inferno Dragon — orange-red dragon, glowing mouth
Save-Sprite -Category troops -Name inferno-dragon -Size 16 -Palette @('#4a1206','#96280e','#dd5a18','#f5993a','#ffe98a') -Draw {
    param($g)
    $dk = B '#4a1206'; $md = B '#96280e'; $lt = B '#dd5a18'; $hi = B '#f5993a'; $gl = B '#ffe98a'
    $wl = @( (New-Object System.Drawing.PointF(6.0,7.0)),
             (New-Object System.Drawing.PointF(1.4,2.2)),
             (New-Object System.Drawing.PointF(0.5,6.6)),
             (New-Object System.Drawing.PointF(2.8,10.4)),
             (New-Object System.Drawing.PointF(5.8,9.8)) )
    $g.FillPolygon($dk, $wl)
    $wr = @( (New-Object System.Drawing.PointF(10.0,7.0)),
             (New-Object System.Drawing.PointF(14.6,2.2)),
             (New-Object System.Drawing.PointF(15.5,6.6)),
             (New-Object System.Drawing.PointF(13.2,10.4)),
             (New-Object System.Drawing.PointF(10.2,9.8)) )
    $g.FillPolygon($dk, $wr)
    $wl2 = @( (New-Object System.Drawing.PointF(5.6,6.8)),
              (New-Object System.Drawing.PointF(2.4,3.8)),
              (New-Object System.Drawing.PointF(1.9,6.8)),
              (New-Object System.Drawing.PointF(5.2,8.9)) )
    $g.FillPolygon($md, $wl2)
    $wr2 = @( (New-Object System.Drawing.PointF(10.4,6.8)),
              (New-Object System.Drawing.PointF(13.6,3.8)),
              (New-Object System.Drawing.PointF(14.1,6.8)),
              (New-Object System.Drawing.PointF(10.8,8.9)) )
    $g.FillPolygon($md, $wr2)
    $g.FillEllipse($dk, 4.2, 6.0, 7.6, 9.2)
    $g.FillEllipse($md, 4.8, 6.6, 6.4, 8.0)
    $g.FillEllipse($lt, 5.6, 9.0, 4.8, 4.8)
    $sp = @( (New-Object System.Drawing.PointF(5.8,2.2)),
             (New-Object System.Drawing.PointF(4.6,0.4)),
             (New-Object System.Drawing.PointF(7.4,1.6)) )
    $g.FillPolygon($hi, $sp)
    $g.FillEllipse($dk, 3.6, 1.2, 7.6, 7.2)
    $g.FillEllipse($lt, 4.2, 1.8, 6.4, 6.0)
    $g.FillEllipse($hi, 5.0, 2.3, 3.0, 2.2)
    $g.FillEllipse($dk, 9.0, 4.2, 6.4, 4.8)
    $g.FillEllipse($lt, 9.4, 4.6, 4.4, 3.0)
    $g.FillEllipse($gl, 11.2, 5.8, 4.0, 3.0)
    $g.FillEllipse($hi, 12.0, 6.4, 2.2, 1.6)
    $g.FillEllipse($dk, 6.2, 3.8, 1.8, 2.0)
}

# Balloon — dark red envelope with a small brown basket slung beneath
Save-Sprite -Category troops -Name balloon -Size 16 -Palette @('#4a0d14','#8e1a22','#c8342f','#f0a081','#3a2410','#9c6b3a') -Draw {
    param($g)
    $dk = B '#4a0d14'; $md = B '#8e1a22'; $lt = B '#c8342f'; $hi = B '#f0a081'
    $bd = B '#3a2410'; $bw = B '#9c6b3a'
    $g.FillEllipse($dk, 1.4, 0.6, 13.2, 11.4)
    $g.FillEllipse($md, 2.2, 1.3, 11.6, 10.0)
    $g.FillEllipse($lt, 3.2, 1.9, 6.4, 6.2)
    $g.FillEllipse($hi, 4.4, 2.6, 2.8, 2.4)
    $nk = @( (New-Object System.Drawing.PointF(4.8,9.2)),
             (New-Object System.Drawing.PointF(11.2,9.2)),
             (New-Object System.Drawing.PointF(9.8,12.2)),
             (New-Object System.Drawing.PointF(6.2,12.2)) )
    $g.FillPolygon($dk, $nk)
    $g.FillRectangle($bd, 4.6, 11.8, 6.8, 3.6)
    $g.FillRectangle($bw, 5.3, 12.4, 5.4, 2.4)
    $g.FillRectangle($bd, 5.3, 13.5, 5.4, 0.8)
}

# Fire Spirit — orange flame ball with a face
Save-Sprite -Category troops -Name fire-spirit -Size 16 -Palette @('#5c1403','#b83a0c','#ef8419','#ffcf4f','#fff2b0') -Draw {
    param($g)
    $dk = B '#5c1403'; $md = B '#b83a0c'; $lt = B '#ef8419'; $hi = B '#ffcf4f'; $wh = B '#fff2b0'
    $fl = @( (New-Object System.Drawing.PointF(8.0,0.4)),
             (New-Object System.Drawing.PointF(11.6,4.4)),
             (New-Object System.Drawing.PointF(13.8,9.2)),
             (New-Object System.Drawing.PointF(11.4,14.4)),
             (New-Object System.Drawing.PointF(4.6,14.4)),
             (New-Object System.Drawing.PointF(2.2,9.2)),
             (New-Object System.Drawing.PointF(4.4,4.4)) )
    $g.FillPolygon($dk, $fl)
    $fl2 = @( (New-Object System.Drawing.PointF(8.0,2.2)),
              (New-Object System.Drawing.PointF(11.0,5.6)),
              (New-Object System.Drawing.PointF(12.8,9.4)),
              (New-Object System.Drawing.PointF(10.8,13.6)),
              (New-Object System.Drawing.PointF(5.2,13.6)),
              (New-Object System.Drawing.PointF(3.2,9.4)),
              (New-Object System.Drawing.PointF(5.0,5.6)) )
    $g.FillPolygon($md, $fl2)
    $g.FillEllipse($lt, 3.6, 5.6, 8.8, 8.2)
    $g.FillEllipse($hi, 4.8, 6.4, 5.4, 4.4)
    $g.FillEllipse($wh, 5.6, 7.0, 2.6, 2.0)
    $g.FillEllipse($dk, 5.4, 8.4, 1.9, 2.2)
    $g.FillEllipse($dk, 8.7, 8.4, 1.9, 2.2)
    $g.FillEllipse($dk, 6.6, 11.3, 2.8, 1.9)
}

# Ice Spirit — pale blue ice ball with a face and crystal spikes
Save-Sprite -Category troops -Name ice-spirit -Size 16 -Palette @('#123a5c','#2b78ab','#66c0e2','#c8f0ff','#f4ffff') -Draw {
    param($g)
    $dk = B '#123a5c'; $md = B '#2b78ab'; $lt = B '#66c0e2'; $hi = B '#c8f0ff'; $wh = B '#f4ffff'
    $s1 = @( (New-Object System.Drawing.PointF(8.0,0.4)),
             (New-Object System.Drawing.PointF(10.0,5.4)),
             (New-Object System.Drawing.PointF(6.0,5.4)) )
    $g.FillPolygon($md, $s1)
    $s2 = @( (New-Object System.Drawing.PointF(3.0,1.8)),
             (New-Object System.Drawing.PointF(6.4,6.2)),
             (New-Object System.Drawing.PointF(2.6,6.4)) )
    $g.FillPolygon($md, $s2)
    $s3 = @( (New-Object System.Drawing.PointF(13.0,1.8)),
             (New-Object System.Drawing.PointF(13.4,6.4)),
             (New-Object System.Drawing.PointF(9.6,6.2)) )
    $g.FillPolygon($md, $s3)
    $g.FillEllipse($dk, 1.6, 4.0, 12.8, 11.4)
    $g.FillEllipse($md, 2.4, 4.7, 11.2, 9.9)
    $g.FillEllipse($lt, 3.2, 5.2, 9.6, 8.2)
    $g.FillEllipse($hi, 4.4, 5.9, 6.2, 4.6)
    $g.FillEllipse($wh, 5.2, 6.4, 2.8, 2.2)
    $g.FillEllipse($dk, 5.3, 8.4, 1.9, 2.2)
    $g.FillEllipse($dk, 8.8, 8.4, 1.9, 2.2)
    $g.FillEllipse($dk, 6.6, 11.4, 2.8, 1.8)
}

# Electro Spirit — blue-white crackling ball with a face
Save-Sprite -Category troops -Name electro-spirit -Size 16 -Palette @('#141c52','#2f49b8','#6f92f0','#dbe8ff','#ffe95c') -Draw {
    param($g)
    $dk = B '#141c52'; $md = B '#2f49b8'; $lt = B '#6f92f0'; $hi = B '#dbe8ff'; $yl = B '#ffe95c'
    $bolt = P '#ffe95c' 1.3
    $g.DrawLine($bolt, 2.4, 1.0, 4.6, 3.6)
    $g.DrawLine($bolt, 4.6, 3.6, 2.8, 4.4)
    $g.DrawLine($bolt, 13.6, 1.0, 11.4, 3.6)
    $g.DrawLine($bolt, 11.4, 3.6, 13.2, 4.4)
    $g.DrawLine($bolt, 8.4, 0.6, 7.2, 3.2)
    $g.FillEllipse($dk, 1.8, 3.4, 12.4, 12.0)
    $g.FillEllipse($md, 2.6, 4.1, 10.8, 10.6)
    $g.FillEllipse($lt, 3.4, 4.7, 9.2, 8.6)
    $g.FillEllipse($hi, 4.6, 5.4, 6.0, 4.8)
    $g.FillEllipse($yl, 5.4, 5.9, 2.8, 2.2)
    $g.FillEllipse($dk, 5.3, 8.0, 1.9, 2.2)
    $g.FillEllipse($dk, 8.8, 8.0, 1.9, 2.2)
    $g.FillEllipse($dk, 6.6, 11.0, 2.8, 1.8)
    $g.DrawLine($bolt, 1.6, 12.4, 3.4, 14.0)
    $g.DrawLine($bolt, 14.4, 12.4, 12.6, 14.0)
}

# Heal Spirit — green glowing ball with a face
Save-Sprite -Category troops -Name heal-spirit -Size 16 -Palette @('#0f3d1c','#27913c','#5cdb58','#b6f79a','#ecffd8') -Draw {
    param($g)
    $dk = B '#0f3d1c'; $md = B '#27913c'; $lt = B '#5cdb58'; $hi = B '#b6f79a'; $wh = B '#ecffd8'
    $g.FillEllipse($md, 1.2, 1.6, 2.0, 2.0)
    $g.FillEllipse($md, 4.0, 0.4, 1.6, 1.6)
    $g.FillEllipse($dk, 1.6, 3.4, 12.8, 12.0)
    $g.FillEllipse($md, 2.4, 4.1, 11.2, 10.6)
    $g.FillEllipse($lt, 3.2, 4.7, 9.6, 8.6)
    $g.FillEllipse($hi, 4.4, 5.4, 6.2, 4.8)
    $g.FillEllipse($wh, 5.2, 5.9, 2.8, 2.2)
    $g.FillEllipse($dk, 5.3, 8.0, 1.9, 2.2)
    $g.FillEllipse($dk, 8.8, 8.0, 1.9, 2.2)
    $g.FillEllipse($dk, 6.4, 10.8, 3.2, 2.0)
    $g.FillRectangle($wh, 10.4, 1.4, 4.4, 1.4)
    $g.FillRectangle($wh, 11.9, 0.0, 1.4, 4.2)
}

# Skeleton Army — bright skull-and-ribs figure with two more behind
Save-Sprite -Category troops -Name skeleton-army -Size 16 -Palette @('#2b2b28','#8d8b7d','#d8d5c2','#f4f2e6','#c23a2a') -Draw {
    param($g)
    $dk = B '#2b2b28'; $md = B '#8d8b7d'; $lt = B '#d8d5c2'; $hi = B '#f4f2e6'; $rd = B '#c23a2a'
    $g.FillEllipse($md, 0.2, 5.0, 4.4, 4.6)
    $g.FillEllipse($dk, 1.1, 6.6, 1.1, 1.3)
    $g.FillEllipse($dk, 2.5, 6.6, 1.1, 1.3)
    $g.FillEllipse($md, 11.4, 5.0, 4.4, 4.6)
    $g.FillEllipse($dk, 12.3, 6.6, 1.1, 1.3)
    $g.FillEllipse($dk, 13.7, 6.6, 1.1, 1.3)
    $g.DrawLine((P '#8d8b7d' 1.3), 3.0, 10.0, 1.6, 13.4)
    $g.DrawLine((P '#8d8b7d' 1.3), 13.0, 10.0, 14.4, 13.4)
    $g.FillEllipse($dk, 4.2, 0.6, 7.6, 7.8)
    $g.FillEllipse($lt, 4.8, 1.2, 6.4, 6.6)
    $g.FillEllipse($hi, 5.6, 1.8, 3.2, 2.4)
    $g.FillEllipse($dk, 5.7, 3.6, 2.0, 2.3)
    $g.FillEllipse($dk, 8.3, 3.6, 2.0, 2.3)
    $g.FillEllipse($rd, 6.0, 4.1, 1.2, 1.4)
    $g.FillEllipse($rd, 8.6, 4.1, 1.2, 1.4)
    $g.FillRectangle($lt, 5.8, 7.0, 4.4, 1.5)
    $g.FillRectangle($dk, 6.9, 7.2, 0.7, 1.3)
    $g.FillRectangle($dk, 8.6, 7.2, 0.7, 1.3)
    $g.DrawLine((P '#d8d5c2' 1.4), 5.2, 9.6, 2.6, 12.6)
    $g.DrawLine((P '#d8d5c2' 1.4), 10.8, 9.6, 13.4, 12.6)
    $g.FillRectangle($lt, 7.3, 9.0, 1.5, 5.4)
    $g.FillRectangle($lt, 4.8, 9.6, 6.4, 1.2)
    $g.FillRectangle($lt, 5.3, 11.5, 5.4, 1.2)
    $g.FillRectangle($lt, 5.9, 13.4, 4.2, 1.2)
}

# Graveyard Skeleton — pale skeleton clawing up out of the dirt
Save-Sprite -Category troops -Name graveyard-skeleton -Size 16 -Palette @('#2b2b28','#a8a698','#e2dfcc','#f6f4e8','#3a2a18','#7a5730') -Draw {
    param($g)
    $dk = B '#2b2b28'; $md = B '#a8a698'; $lt = B '#e2dfcc'; $hi = B '#f6f4e8'
    $d1 = B '#3a2a18'; $d2 = B '#7a5730'
    $arm = P '#e2dfcc' 1.9
    $g.DrawLine($arm, 6.0, 9.6, 2.8, 5.4)
    $g.DrawLine($arm, 10.0, 9.6, 13.2, 5.4)
    $g.FillEllipse($hi, 1.2, 3.2, 3.2, 3.2)
    $g.FillEllipse($hi, 11.6, 3.2, 3.2, 3.2)
    $g.FillEllipse($dk, 4.6, 1.2, 7.0, 7.4)
    $g.FillEllipse($lt, 5.2, 1.8, 5.8, 6.2)
    $g.FillEllipse($hi, 6.0, 2.4, 3.0, 2.4)
    $g.FillEllipse($dk, 6.1, 4.2, 1.8, 2.1)
    $g.FillEllipse($dk, 8.5, 4.2, 1.8, 2.1)
    $g.FillRectangle($md, 6.4, 7.6, 3.4, 1.2)
    $g.FillRectangle($lt, 6.8, 8.6, 2.6, 4.0)
    $g.FillRectangle($md, 5.6, 9.6, 5.0, 1.0)
    $g.FillEllipse($d1, 0.4, 10.0, 15.2, 5.8)
    $g.FillEllipse($d2, 1.4, 10.7, 13.2, 4.2)
    $g.FillEllipse($d1, 3.0, 11.0, 3.4, 1.8)
    $g.FillEllipse($d1, 9.4, 12.4, 3.8, 1.8)
}

# Goblin Barrel — green goblin bursting out of a wooden barrel
Save-Sprite -Category troops -Name goblin-barrel-goblin -Size 16 -Palette @('#1a3319','#3f7a32','#6db84a','#b6e08a','#4a2e13','#8f6130') -Draw {
    param($g)
    $dk = B '#1a3319'; $md = B '#3f7a32'; $lt = B '#6db84a'; $hi = B '#b6e08a'
    $wd = B '#4a2e13'; $wl = B '#8f6130'
    $el = @( (New-Object System.Drawing.PointF(5.0,3.4)),
             (New-Object System.Drawing.PointF(1.0,2.0)),
             (New-Object System.Drawing.PointF(4.8,6.4)) )
    $g.FillPolygon($dk, $el)
    $er = @( (New-Object System.Drawing.PointF(11.0,3.4)),
             (New-Object System.Drawing.PointF(15.0,2.0)),
             (New-Object System.Drawing.PointF(11.2,6.4)) )
    $g.FillPolygon($dk, $er)
    $g.FillEllipse($dk, 4.2, 1.0, 7.6, 7.6)
    $g.FillEllipse($md, 4.8, 1.6, 6.4, 6.4)
    $g.FillEllipse($lt, 5.2, 2.0, 5.6, 4.6)
    $g.FillEllipse($hi, 6.0, 2.4, 2.6, 1.8)
    $g.FillEllipse($dk, 6.1, 4.1, 1.5, 1.7)
    $g.FillEllipse($dk, 8.4, 4.1, 1.5, 1.7)
    $g.FillEllipse($hi, 6.6, 6.4, 2.8, 1.4)
    $g.FillEllipse($md, 1.8, 6.0, 3.2, 3.0)
    $g.FillEllipse($md, 11.0, 6.0, 3.2, 3.0)
    $g.FillEllipse($wd, 1.2, 7.2, 13.6, 8.4)
    $g.FillRectangle($wd, 2.6, 7.4, 10.8, 8.0)
    $g.FillEllipse($wl, 2.0, 7.9, 12.0, 7.0)
    $g.FillRectangle($wl, 3.2, 8.1, 9.6, 6.6)
    $g.FillRectangle($wd, 1.6, 9.6, 12.8, 1.2)
    $g.FillRectangle($wd, 1.6, 13.0, 12.8, 1.2)
    $g.FillRectangle($wd, 3.0, 7.4, 10.0, 0.9)
}

# Minion Horde — three small teal minions clustered in the air
Save-Sprite -Category troops -Name minion-horde -Size 16 -Palette @('#0e3336','#1c6a68','#33a396','#7fd9c6','#f5e26b') -Draw {
    param($g)
    $dk = B '#0e3336'; $md = B '#1c6a68'; $lt = B '#33a396'; $hi = B '#7fd9c6'; $ey = B '#f5e26b'
    $bl = @( (New-Object System.Drawing.PointF(3.4,3.0)),
             (New-Object System.Drawing.PointF(0.4,0.6)),
             (New-Object System.Drawing.PointF(0.6,4.4)),
             (New-Object System.Drawing.PointF(3.2,5.2)) )
    $g.FillPolygon($dk, $bl)
    $g.FillEllipse($dk, 1.2, 1.2, 5.4, 6.6)
    $g.FillEllipse($md, 1.7, 1.7, 4.4, 5.6)
    $g.FillEllipse($lt, 1.9, 1.9, 4.0, 3.4)
    $g.FillEllipse($ey, 2.4, 3.4, 1.3, 1.5)
    $g.FillEllipse($ey, 4.2, 3.4, 1.3, 1.5)
    $br = @( (New-Object System.Drawing.PointF(12.6,3.0)),
             (New-Object System.Drawing.PointF(15.6,0.6)),
             (New-Object System.Drawing.PointF(15.4,4.4)),
             (New-Object System.Drawing.PointF(12.8,5.2)) )
    $g.FillPolygon($dk, $br)
    $g.FillEllipse($dk, 9.4, 1.2, 5.4, 6.6)
    $g.FillEllipse($md, 9.9, 1.7, 4.4, 5.6)
    $g.FillEllipse($lt, 10.1, 1.9, 4.0, 3.4)
    $g.FillEllipse($ey, 10.5, 3.4, 1.3, 1.5)
    $g.FillEllipse($ey, 12.3, 3.4, 1.3, 1.5)
    $fl = @( (New-Object System.Drawing.PointF(6.6,8.4)),
             (New-Object System.Drawing.PointF(1.6,5.6)),
             (New-Object System.Drawing.PointF(1.4,9.4)),
             (New-Object System.Drawing.PointF(4.0,11.4)),
             (New-Object System.Drawing.PointF(6.4,10.8)) )
    $g.FillPolygon($dk, $fl)
    $fr = @( (New-Object System.Drawing.PointF(9.4,8.4)),
             (New-Object System.Drawing.PointF(14.4,5.6)),
             (New-Object System.Drawing.PointF(14.6,9.4)),
             (New-Object System.Drawing.PointF(12.0,11.4)),
             (New-Object System.Drawing.PointF(9.6,10.8)) )
    $g.FillPolygon($dk, $fr)
    $g.FillEllipse($dk, 4.6, 5.8, 6.8, 8.4)
    $g.FillEllipse($md, 5.2, 6.4, 5.6, 7.2)
    $g.FillEllipse($lt, 5.5, 6.7, 5.0, 4.2)
    $g.FillEllipse($hi, 6.2, 7.1, 2.2, 1.5)
    $g.FillEllipse($ey, 6.1, 9.0, 1.6, 1.8)
    $g.FillEllipse($ey, 8.3, 9.0, 1.6, 1.8)
    $g.FillEllipse($dk, 6.0, 13.2, 1.7, 2.3)
    $g.FillEllipse($dk, 8.3, 13.2, 1.7, 2.3)
}
