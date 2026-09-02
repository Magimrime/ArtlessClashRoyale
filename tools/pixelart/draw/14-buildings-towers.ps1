. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# ============================== BUILDINGS (24) ===============================

# Tesla (up) — coil column on a round pad, glowing orb crackling on top
Save-Sprite -Category buildings -Name tesla-up -Size 24 -Palette @('#101c30','#1e3f6e','#3d79c4','#8fd0ff','#eaf8ff') -Draw {
    param($g)
    $dk = B '#101c30'; $md = B '#1e3f6e'; $lt = B '#3d79c4'; $gl = B '#8fd0ff'; $wh = B '#eaf8ff'
    $g.FillEllipse($dk, 1.5, 14.5, 21.0, 8.5)           # base pad
    $g.FillEllipse($md, 2.8, 15.2, 18.4, 6.8)
    $g.FillEllipse($lt, 4.5, 15.8, 15.0, 3.6)           # lit rim of pad
    $g.FillRectangle($dk, 8.6, 8.0, 6.8, 10.0)          # coil column
    $g.FillRectangle($md, 9.6, 8.0, 4.2, 10.0)
    $g.DrawEllipse((P '#3d79c4' 1.4), 7.0, 10.0, 10.0, 3.0)   # coil rings
    $g.DrawEllipse((P '#3d79c4' 1.4), 7.0, 13.2, 10.0, 3.0)
    $g.DrawEllipse((P '#3d79c4' 1.4), 7.0, 16.2, 10.0, 3.0)
    $g.FillEllipse($lt, 5.8, 0.8, 12.4, 11.4)           # orb
    $g.FillEllipse($gl, 7.2, 2.2, 9.6, 8.6)
    $g.FillEllipse($wh, 9.0, 3.8, 6.0, 5.2)
    $g.DrawLine((P '#eaf8ff' 1.1), 4.6, 4.0, 2.6, 2.0)  # sparks
    $g.DrawLine((P '#eaf8ff' 1.1), 19.4, 4.0, 21.4, 2.0)
}

# Tesla (covered) — shut plank hatch lying flat on the ground, iron pull-ring
Save-Sprite -Category buildings -Name tesla-covered -Size 24 -Palette @('#2e1c0c','#5c3a18','#8a5a2a','#b3814a','#4a4e55') -Draw {
    param($g)
    $dk = B '#2e1c0c'; $md = B '#5c3a18'; $lt = B '#8a5a2a'; $hi = B '#b3814a'
    $out = @( (New-Object System.Drawing.PointF(5.5,7.5)),
              (New-Object System.Drawing.PointF(18.5,7.5)),
              (New-Object System.Drawing.PointF(23.0,20.5)),
              (New-Object System.Drawing.PointF(1.0,20.5)) )
    $g.FillPolygon($dk, $out)                               # hatch lying flat
    $inn = @( (New-Object System.Drawing.PointF(6.3,8.7)),
              (New-Object System.Drawing.PointF(17.7,8.7)),
              (New-Object System.Drawing.PointF(21.4,19.4)),
              (New-Object System.Drawing.PointF(2.6,19.4)) )
    $g.FillPolygon($md, $inn)
    $g.DrawLine((P '#8a5a2a' 2.2), 6.6, 9.6, 17.4, 9.6)     # plank faces
    $g.DrawLine((P '#8a5a2a' 2.4), 5.4, 13.2, 18.6, 13.2)
    $g.DrawLine((P '#8a5a2a' 2.6), 4.0, 17.2, 20.0, 17.2)
    $g.DrawLine((P '#b3814a' 0.9), 6.8, 8.9, 17.2, 8.9)     # lit plank edges
    $g.DrawLine((P '#b3814a' 0.9), 5.6, 12.2, 18.4, 12.2)
    $g.DrawLine((P '#b3814a' 0.9), 4.4, 15.9, 19.6, 15.9)
    $g.DrawLine((P '#2e1c0c' 1.2), 5.9, 11.3, 18.1, 11.3)   # seams
    $g.DrawLine((P '#2e1c0c' 1.2), 4.8, 15.0, 19.2, 15.0)
    $g.DrawEllipse((P '#4a4e55' 1.6), 9.4, 12.2, 5.4, 3.4)  # iron pull ring
    $g.FillRectangle($dk, 3.2, 18.6, 17.6, 1.6)             # ground shadow lip
}

# Bomb tower — stone block tower with a fat bomb and lit fuse on the roof
Save-Sprite -Category buildings -Name bomb-tower -Size 24 -Palette @('#2a2d33','#565c66','#8b939e','#c3cbd6','#141518','#e8903a') -Draw {
    param($g)
    $dk = B '#2a2d33'; $md = B '#565c66'; $lt = B '#8b939e'; $hi = B '#c3cbd6'
    $bk = B '#141518'; $fx = B '#e8903a'
    $g.FillRectangle($dk, 3.5, 8.0, 17.0, 15.0)         # keep
    $g.FillRectangle($md, 5.0, 9.2, 14.0, 13.2)
    $g.FillRectangle($lt, 5.8, 10.0, 12.4, 5.6)         # lit upper face
    $g.FillRectangle($hi, 6.6, 10.6, 4.2, 2.4)
    $g.DrawLine((P '#2a2d33' 1.1), 5.0, 15.8, 19.0, 15.8)   # block seams
    $g.DrawLine((P '#2a2d33' 1.1), 5.0, 19.4, 19.0, 19.4)
    $g.DrawLine((P '#2a2d33' 1.1), 12.0, 16.0, 12.0, 19.2)
    $g.DrawLine((P '#2a2d33' 1.1), 8.4, 19.6, 8.4, 22.4)
    $g.FillRectangle($dk, 2.5, 6.6, 19.0, 2.8)          # roof rim
    $g.FillRectangle($md, 3.4, 7.0, 17.2, 1.4)
    $g.FillEllipse($bk, 6.6, 1.2, 10.8, 9.6)            # bomb
    $g.FillEllipse($md, 8.6, 2.8, 3.6, 3.0)             # bomb sheen
    $g.DrawLine((P '#565c66' 1.2), 15.0, 2.2, 18.2, 0.9)    # fuse
    $g.FillEllipse($fx, 17.6, 0.0, 3.0, 3.0)            # spark
}

# Tombstone — round-topped slab with a pale cross, sunk in a dirt mound
Save-Sprite -Category buildings -Name tombstone -Size 24 -Palette @('#2b2e33','#6a707a','#9aa2ad','#d2d8e0','#3a2a16','#6b4a24') -Draw {
    param($g)
    $dk = B '#2b2e33'; $md = B '#6a707a'; $lt = B '#9aa2ad'; $hi = B '#d2d8e0'
    $dd = B '#3a2a16'; $dl = B '#6b4a24'
    $g.FillEllipse($dd, 1.0, 15.5, 22.0, 8.0)           # dirt mound (back)
    $g.FillEllipse($dl, 2.6, 16.0, 18.8, 6.0)
    $g.FillEllipse($dk, 4.4, 2.4, 15.2, 11.6)           # slab
    $g.FillRectangle($dk, 4.4, 7.4, 15.2, 11.4)
    $g.FillEllipse($md, 5.6, 3.6, 12.8, 9.8)
    $g.FillRectangle($md, 5.6, 8.2, 12.8, 10.0)
    $g.FillEllipse($lt, 6.4, 4.2, 11.2, 6.4)            # top-lit face
    $g.FillRectangle($hi, 10.6, 5.6, 2.8, 9.0)          # cross
    $g.FillRectangle($hi, 8.0, 8.4, 8.0, 2.8)
    $g.DrawLine((P '#2b2e33' 1.0), 15.6, 12.0, 17.0, 17.6)  # crack
    $g.FillEllipse($dd, 2.2, 17.8, 19.6, 5.4)           # dirt lip (front)
    $g.FillEllipse($dl, 3.6, 18.2, 16.0, 3.6)
}

# Inferno tower — tapered dark tower with a burning core and a flame vent
Save-Sprite -Category buildings -Name inferno-tower -Size 24 -Palette @('#241008','#4a1f12','#7d3a1c','#ff8a1e','#ffd980','#fff3c4') -Draw {
    param($g)
    $dk = B '#241008'; $md = B '#4a1f12'; $lt = B '#7d3a1c'
    $f1 = B '#ff8a1e'; $f2 = B '#ffd980'; $f3 = B '#fff3c4'
    $body = @( (New-Object System.Drawing.PointF(4.5,22.5)),
               (New-Object System.Drawing.PointF(6.8,4.5)),
               (New-Object System.Drawing.PointF(17.2,4.5)),
               (New-Object System.Drawing.PointF(19.5,22.5)) )
    $g.FillPolygon($dk, $body)
    $inn = @( (New-Object System.Drawing.PointF(6.0,22.0)),
              (New-Object System.Drawing.PointF(8.0,5.6)),
              (New-Object System.Drawing.PointF(16.0,5.6)),
              (New-Object System.Drawing.PointF(18.0,22.0)) )
    $g.FillPolygon($md, $inn)
    $band = @( (New-Object System.Drawing.PointF(6.6,21.6)),
               (New-Object System.Drawing.PointF(8.3,6.0)),
               (New-Object System.Drawing.PointF(10.4,6.0)),
               (New-Object System.Drawing.PointF(9.0,21.6)) )
    $g.FillPolygon($lt, $band)
    $g.FillRectangle($dk, 3.4, 2.0, 17.2, 3.6)          # crown rim
    $g.FillRectangle($md, 4.4, 2.6, 15.2, 2.2)
    $g.FillEllipse($dk, 2.4, 19.2, 19.2, 4.4)           # plinth
    $g.FillEllipse($lt, 3.6, 19.6, 16.8, 2.4)
    $g.FillEllipse($f1, 7.4, 9.0, 9.2, 9.2)             # glowing core
    $g.FillEllipse($f2, 9.1, 10.7, 5.8, 5.8)
    $g.FillEllipse($f3, 10.8, 12.4, 2.4, 2.4)
    $g.FillEllipse($f1, 8.4, 0.6, 7.2, 4.6)             # vent flame
    $g.FillEllipse($f2, 10.0, 1.4, 4.0, 3.0)
}

# Elixir collector — squat pink tank, pump housing, spout and a falling drop
Save-Sprite -Category buildings -Name elixir-collector -Size 24 -Palette @('#3d1147','#7a2394','#c04ad6','#f08cf8','#fbd6ff','#6e6480') -Draw {
    param($g)
    $dk = B '#3d1147'; $md = B '#7a2394'; $lt = B '#c04ad6'; $gl = B '#f08cf8'
    $hi = B '#fbd6ff'; $mt = B '#6e6480'
    $g.FillRectangle($dk, 6.8, 2.4, 10.4, 2.8)          # pump cap
    $g.FillRectangle($md, 7.8, 3.0, 8.4, 1.7)
    $g.FillRectangle($dk, 8.0, 4.4, 8.0, 8.0)           # pump housing
    $g.FillRectangle($md, 9.0, 5.3, 6.0, 7.1)
    $g.FillRectangle($lt, 9.5, 5.7, 1.9, 6.4)
    $g.FillRectangle($dk, 14.4, 5.8, 8.2, 3.6)          # spout arm
    $g.FillRectangle($mt, 15.0, 6.4, 7.4, 2.4)
    $g.FillRectangle($dk, 19.2, 8.0, 3.6, 4.0)          # spout elbow
    $g.FillRectangle($mt, 19.7, 8.4, 2.7, 3.4)
    $g.FillEllipse($dk, 2.0, 10.0, 20.0, 13.0)          # elixir tank
    $g.FillEllipse($md, 3.4, 11.0, 17.2, 11.0)
    $g.FillEllipse($lt, 5.0, 11.8, 12.0, 5.4)
    $g.FillEllipse($gl, 6.4, 12.4, 6.6, 3.2)
    $g.FillEllipse($hi, 7.6, 12.9, 2.8, 1.5)
    $g.DrawLine((P '#3d1147' 1.2), 4.6, 18.4, 19.4, 18.4)   # tank band
    $g.FillEllipse($gl, 19.3, 12.6, 3.2, 4.0)           # falling drop
    $g.FillEllipse($hi, 20.0, 13.4, 1.3, 1.7)
}

# Crate — banded wooden box with a diagonal brace
Save-Sprite -Category buildings -Name crate -Size 24 -Palette @('#2e1b0b','#5e3a18','#8f5c2a','#c08a4c') -Draw {
    param($g)
    $dk = B '#2e1b0b'; $md = B '#5e3a18'; $lt = B '#8f5c2a'; $hi = B '#c08a4c'
    $g.FillRectangle($dk, 1.8, 3.8, 20.4, 18.4)         # box
    $g.FillRectangle($md, 3.0, 5.0, 18.0, 16.0)
    $g.FillRectangle($lt, 3.8, 6.0, 16.4, 5.0)          # planks
    $g.FillRectangle($lt, 3.8, 12.4, 16.4, 5.0)
    $g.DrawLine((P '#2e1b0b' 1.5), 3.0, 11.6, 21.0, 11.6)   # seams
    $g.DrawLine((P '#2e1b0b' 1.5), 3.0, 18.0, 21.0, 18.0)
    $g.DrawLine((P '#2e1b0b' 1.7), 4.6, 19.8, 19.4, 6.6)    # brace
    $g.FillRectangle($dk, 1.8, 3.8, 2.8, 18.4)          # corner posts
    $g.FillRectangle($dk, 19.4, 3.8, 2.8, 18.4)
    $g.FillRectangle($dk, 1.8, 3.8, 20.4, 2.6)          # top / bottom rails
    $g.FillRectangle($dk, 1.8, 19.6, 20.4, 2.6)
    $g.FillRectangle($md, 2.4, 4.4, 19.2, 1.3)
    $g.FillRectangle($hi, 4.6, 6.6, 4.6, 1.8)           # plank shine
}

# Goblin cage — barred green iron cage with spiked crown and padlock
Save-Sprite -Category buildings -Name goblin-cage -Size 24 -Palette @('#16301a','#2f6b33','#57a84a','#9ad86e') -Draw {
    param($g)
    $dk = B '#16301a'; $md = B '#2f6b33'; $lt = B '#57a84a'; $hi = B '#9ad86e'
    $g.FillRectangle($dk, 2.4, 3.6, 19.2, 17.0)         # cage shadow box
    foreach ($x in 3.9, 7.3, 10.7, 14.1, 17.5) {        # bars
        $g.FillRectangle($lt, $x, 4.6, 2.0, 15.0)
        $g.FillRectangle($hi, $x, 4.6, 0.8, 15.0)
    }
    $spikes = 5.0, 11.5, 18.0
    foreach ($sx in $spikes) {
        $tri = @( (New-Object System.Drawing.PointF(($sx - 2.2), 3.0)),
                  (New-Object System.Drawing.PointF($sx, 0.5)),
                  (New-Object System.Drawing.PointF(($sx + 2.2), 3.0)) )
        $g.FillPolygon($dk, $tri)
        $tri2 = @( (New-Object System.Drawing.PointF(($sx - 1.3), 2.9)),
                   (New-Object System.Drawing.PointF($sx, 1.4)),
                   (New-Object System.Drawing.PointF(($sx + 1.3), 2.9)) )
        $g.FillPolygon($md, $tri2)
    }
    $g.FillRectangle($dk, 1.4, 2.4, 21.2, 3.2)          # top rail
    $g.FillRectangle($md, 2.2, 2.9, 19.6, 2.2)
    $g.FillRectangle($hi, 2.2, 2.9, 19.6, 0.8)
    $g.FillRectangle($dk, 1.4, 18.6, 21.2, 4.0)         # bottom rail
    $g.FillRectangle($md, 2.2, 19.2, 19.6, 2.8)
    $g.FillRectangle($hi, 2.2, 19.2, 19.6, 0.8)
    $g.FillEllipse($dk, 9.8, 10.2, 4.4, 4.6)            # padlock
    $g.FillEllipse($hi, 10.7, 11.1, 2.4, 2.6)
}

# Furnace — red brick stack with a chimney and an arched fire mouth
Save-Sprite -Category buildings -Name furnace -Size 24 -Palette @('#2a1210','#6e2a22','#a8463a','#d97b4a','#ff9d2e','#ffe08a') -Draw {
    param($g)
    $dk = B '#2a1210'; $md = B '#6e2a22'; $lt = B '#a8463a'; $hi = B '#d97b4a'
    $f1 = B '#ff9d2e'; $f2 = B '#ffe08a'
    $g.FillRectangle($dk, 5.6, 1.2, 6.4, 6.6)           # chimney
    $g.FillRectangle($md, 6.5, 2.0, 4.6, 5.8)
    $g.FillRectangle($hi, 6.5, 2.0, 1.5, 5.8)
    $g.FillRectangle($dk, 2.6, 5.8, 18.8, 17.4)         # body
    $g.FillRectangle($md, 4.0, 7.0, 16.0, 15.4)
    $g.FillRectangle($lt, 4.0, 7.0, 16.0, 4.2)          # lit brick course
    $g.FillRectangle($hi, 5.0, 7.6, 4.2, 2.0)
    $g.DrawLine((P '#2a1210' 1.0), 4.0, 11.2, 20.0, 11.2)   # brick seams
    $g.DrawLine((P '#2a1210' 1.0), 4.0, 15.2, 20.0, 15.2)
    $g.DrawLine((P '#2a1210' 1.0), 4.0, 19.2, 20.0, 19.2)
    $g.DrawLine((P '#2a1210' 1.0), 9.0, 7.2, 9.0, 11.0)
    $g.DrawLine((P '#2a1210' 1.0), 15.0, 7.2, 15.0, 11.0)
    $g.DrawLine((P '#2a1210' 1.0), 5.4, 19.4, 5.4, 23.0)
    $g.DrawLine((P '#2a1210' 1.0), 18.4, 19.4, 18.4, 23.0)
    $g.FillEllipse($dk, 7.2, 11.6, 9.6, 7.6)            # fire mouth arch
    $g.FillRectangle($dk, 7.2, 15.0, 9.6, 8.0)
    $g.FillEllipse($f1, 8.4, 12.8, 7.2, 6.0)
    $g.FillRectangle($f1, 8.4, 15.6, 7.2, 7.4)
    $g.FillEllipse($f2, 9.9, 14.6, 4.2, 3.8)
    $g.FillRectangle($f2, 9.9, 16.4, 4.2, 6.6)
}

# =============================== TOWERS (32) =================================

# Princess tower (red)
Save-Sprite -Category towers -Name princess-tower-red -Size 32 -Palette @('#5c1a1a','#9e2b2b','#e05555','#f5a0a0','#2b2f36','#565d68') -Draw {
    param($g)
    $dk = B '#5c1a1a'; $md = B '#9e2b2b'; $lt = B '#e05555'; $hi = B '#f5a0a0'
    $gun = B '#2b2f36'; $gunL = B '#565d68'
    $g.FillRectangle($dk, 3, 6, 26, 24)             # keep
    $g.FillRectangle($md, 5, 8, 22, 21)
    $g.FillRectangle($lt, 6, 9, 20, 12)             # lit top face
    $g.FillRectangle($hi, 7, 10, 8, 4)              # highlight
    for ($i = 0; $i -lt 4; $i++) {                  # battlements
        $g.FillRectangle($dk, (4 + $i * 6.5), 3.0, 4.5, 5.0)
        $g.FillRectangle($md, (4.6 + $i * 6.5), 3.6, 3.3, 4.0)
    }
    $g.FillEllipse($gun, 10, 13, 12, 12)            # turret
    $g.FillEllipse($gunL, 12, 15, 8, 8)
    $g.FillRectangle($gun, 14.5, 5, 3, 10)          # barrel
}

# King tower (blue) — wider fortress, corner buttresses, gilded battlements
Save-Sprite -Category towers -Name king-tower-blue -Size 32 -Palette @('#123a63','#2b5f9e','#4f8fe0','#9fc8f5','#2b2f36','#e8c25a') -Draw {
    param($g)
    $dk = B '#123a63'; $md = B '#2b5f9e'; $lt = B '#4f8fe0'; $hi = B '#9fc8f5'
    $gun = B '#2b2f36'; $gold = B '#e8c25a'
    $g.FillRectangle($dk, 1.5, 7.0, 29.0, 23.5)     # keep
    $g.FillRectangle($md, 4.0, 9.0, 24.0, 21.0)
    $g.FillRectangle($lt, 5.0, 10.0, 22.0, 12.0)    # lit top face
    $g.FillRectangle($hi, 6.0, 11.0, 8.0, 4.0)      # highlight
    $g.FillRectangle($dk, 1.5, 7.0, 4.0, 23.5)      # corner buttresses
    $g.FillRectangle($dk, 26.5, 7.0, 4.0, 23.5)
    $g.FillRectangle($md, 2.2, 8.4, 2.6, 21.5)
    $g.FillRectangle($md, 27.2, 8.4, 2.6, 21.5)
    $g.FillRectangle($dk, 0.8, 28.0, 30.4, 3.2)     # plinth
    $g.FillRectangle($md, 1.8, 28.6, 28.4, 1.8)
    for ($i = 0; $i -lt 5; $i++) {                  # gilded battlements
        $g.FillRectangle($dk, (1.8 + $i * 5.7), 2.6, 4.7, 5.6)
        $g.FillRectangle($md, (2.4 + $i * 5.7), 3.6, 3.5, 4.6)
        $g.FillRectangle($gold, (1.8 + $i * 5.7), 2.6, 4.7, 1.4)
    }
    $g.FillEllipse($gun, 8.5, 12.0, 15.0, 15.0)     # royal turret
    $g.FillEllipse($gold, 11.0, 14.5, 10.0, 10.0)
    $g.FillEllipse($gun, 13.2, 16.7, 5.6, 5.6)
    $g.FillRectangle($gun, 14.0, 2.0, 4.2, 12.5)    # barrel
    $g.FillRectangle($gold, 14.0, 6.0, 4.2, 1.8)
}

# King tower (red)
Save-Sprite -Category towers -Name king-tower-red -Size 32 -Palette @('#5c1a1a','#9e2b2b','#e05555','#f5a0a0','#2b2f36','#e8c25a') -Draw {
    param($g)
    $dk = B '#5c1a1a'; $md = B '#9e2b2b'; $lt = B '#e05555'; $hi = B '#f5a0a0'
    $gun = B '#2b2f36'; $gold = B '#e8c25a'
    $g.FillRectangle($dk, 1.5, 7.0, 29.0, 23.5)
    $g.FillRectangle($md, 4.0, 9.0, 24.0, 21.0)
    $g.FillRectangle($lt, 5.0, 10.0, 22.0, 12.0)
    $g.FillRectangle($hi, 6.0, 11.0, 8.0, 4.0)
    $g.FillRectangle($dk, 1.5, 7.0, 4.0, 23.5)
    $g.FillRectangle($dk, 26.5, 7.0, 4.0, 23.5)
    $g.FillRectangle($md, 2.2, 8.4, 2.6, 21.5)
    $g.FillRectangle($md, 27.2, 8.4, 2.6, 21.5)
    $g.FillRectangle($dk, 0.8, 28.0, 30.4, 3.2)
    $g.FillRectangle($md, 1.8, 28.6, 28.4, 1.8)
    for ($i = 0; $i -lt 5; $i++) {
        $g.FillRectangle($dk, (1.8 + $i * 5.7), 2.6, 4.7, 5.6)
        $g.FillRectangle($md, (2.4 + $i * 5.7), 3.6, 3.5, 4.6)
        $g.FillRectangle($gold, (1.8 + $i * 5.7), 2.6, 4.7, 1.4)
    }
    $g.FillEllipse($gun, 8.5, 12.0, 15.0, 15.0)
    $g.FillEllipse($gold, 11.0, 14.5, 10.0, 10.0)
    $g.FillEllipse($gun, 13.2, 16.7, 5.6, 5.6)
    $g.FillRectangle($gun, 14.0, 2.0, 4.2, 12.5)
    $g.FillRectangle($gold, 14.0, 6.0, 4.2, 1.8)
}

# King tower (blue, destroyed) — collapsed keep, one gilded merlon left standing
Save-Sprite -Category towers -Name king-tower-blue-destroyed -Size 32 -Palette @('#123a63','#2b5f9e','#4f8fe0','#9fc8f5','#2b2f36','#e8c25a') -Draw {
    param($g)
    $dk = B '#123a63'; $md = B '#2b5f9e'; $lt = B '#4f8fe0'; $hi = B '#9fc8f5'
    $gun = B '#2b2f36'; $gold = B '#e8c25a'
    $g.FillRectangle($dk, 1.6, 17.0, 28.8, 13.0)        # surviving wall mass
    $g.FillRectangle($dk, 1.6, 7.5, 7.6, 12.0)          # tall corner stub
    $g.FillRectangle($dk, 12.4, 13.0, 6.6, 8.0)         # middle stub
    $g.FillRectangle($dk, 22.2, 11.0, 8.2, 10.0)        # right stub
    $g.FillRectangle($md, 3.0, 20.2, 5.2, 9.8)          # ragged wall crest
    $g.FillRectangle($md, 8.2, 18.6, 5.2, 11.4)
    $g.FillRectangle($md, 13.4, 21.2, 5.2, 8.8)
    $g.FillRectangle($md, 18.6, 19.2, 5.2, 10.8)
    $g.FillRectangle($md, 23.8, 20.6, 5.2, 9.4)
    $g.FillRectangle($md, 2.9, 9.0, 5.4, 11.0)          # stub interiors
    $g.FillRectangle($md, 13.6, 14.4, 4.4, 6.6)
    $g.FillRectangle($md, 23.4, 12.4, 6.0, 8.6)
    $g.FillRectangle($lt, 3.4, 10.0, 2.0, 7.0)          # surviving lit faces
    $g.FillRectangle($hi, 3.4, 10.0, 1.0, 3.2)
    $g.FillRectangle($lt, 24.0, 13.4, 2.0, 6.0)
    $g.FillRectangle($gold, 1.6, 7.5, 7.6, 1.5)         # last gilded merlon caps
    $g.FillRectangle($gold, 22.2, 11.0, 8.2, 1.5)
    $g.FillRectangle($dk, 9.6, 14.6, 2.8, 2.4)          # knocked-loose block
    $g.FillEllipse($dk, 0.5, 24.0, 31.0, 7.5)           # rubble pile
    $g.FillEllipse($md, 2.5, 24.9, 27.0, 5.2)
    $barrel = @( (New-Object System.Drawing.PointF(9.5,27.2)),
                 (New-Object System.Drawing.PointF(13.5,22.6)),
                 (New-Object System.Drawing.PointF(16.6,24.6)),
                 (New-Object System.Drawing.PointF(12.6,29.2)) )
    $g.FillPolygon($gun, $barrel)                        # toppled barrel
    $g.FillEllipse($gold, 13.8, 23.4, 3.6, 3.6)
    $g.FillRectangle($dk, 1.0, 25.6, 4.4, 4.0)          # scattered blocks
    $g.FillRectangle($md, 1.6, 26.3, 3.0, 2.6)
    $g.FillRectangle($dk, 19.4, 26.4, 4.0, 3.4)
    $g.FillRectangle($md, 20.0, 27.0, 2.6, 2.2)
    $g.FillRectangle($dk, 26.4, 24.4, 4.6, 5.0)
    $g.FillRectangle($md, 27.0, 25.1, 3.2, 3.4)
}

# Princess tower (blue, destroyed)
Save-Sprite -Category towers -Name princess-tower-blue-destroyed -Size 32 -Palette @('#123a63','#2b5f9e','#4f8fe0','#9fc8f5','#2b2f36','#565d68') -Draw {
    param($g)
    $dk = B '#123a63'; $md = B '#2b5f9e'; $lt = B '#4f8fe0'; $hi = B '#9fc8f5'
    $gun = B '#2b2f36'; $gunL = B '#565d68'
    $tops = 11.0, 18.0, 24.0, 15.0, 22.0, 17.5          # broken wall stubs
    for ($i = 0; $i -lt 6; $i++) {
        $x = 3.6 + $i * 4.2
        $t = $tops[$i]
        $g.FillRectangle($dk, $x, $t, 4.4, (30.0 - $t))
        $g.FillRectangle($md, ($x + 0.8), ($t + 1.2), 3.0, (28.4 - $t))
    }
    $g.FillRectangle($lt, 4.4, 12.4, 1.6, 6.4)          # surviving lit faces
    $g.FillRectangle($hi, 4.4, 12.4, 0.8, 3.2)
    $g.FillRectangle($lt, 16.4, 16.4, 1.6, 5.4)
    $g.FillRectangle($dk, 9.0, 15.4, 2.6, 2.2)          # knocked-loose blocks
    $g.FillRectangle($dk, 20.4, 19.6, 2.6, 2.2)
    $g.FillEllipse($dk, 1.5, 24.0, 29.0, 7.5)           # rubble pile
    $g.FillEllipse($md, 3.5, 24.9, 25.0, 5.2)
    $barrel = @( (New-Object System.Drawing.PointF(10.5,27.6)),
                 (New-Object System.Drawing.PointF(14.4,23.2)),
                 (New-Object System.Drawing.PointF(17.2,25.2)),
                 (New-Object System.Drawing.PointF(13.3,29.4)) )
    $g.FillPolygon($gun, $barrel)                        # toppled barrel
    $g.FillEllipse($gunL, 14.4, 24.0, 3.2, 3.2)
    $g.FillRectangle($dk, 1.8, 26.2, 4.2, 3.6)          # scattered blocks
    $g.FillRectangle($md, 2.4, 26.9, 2.8, 2.2)
    $g.FillRectangle($dk, 19.8, 26.8, 3.8, 3.0)
    $g.FillRectangle($md, 20.4, 27.3, 2.4, 1.9)
    $g.FillRectangle($dk, 25.6, 25.2, 4.4, 4.6)
    $g.FillRectangle($md, 26.2, 25.9, 3.0, 3.0)
}
